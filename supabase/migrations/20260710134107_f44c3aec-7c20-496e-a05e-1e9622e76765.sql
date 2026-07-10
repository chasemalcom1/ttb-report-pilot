
-- 1) Rebuild handle_new_user: resilient, always provisions org + role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  full_name_txt text := COALESCE(NULLIF(meta->>'full_name',''),
                                 trim(concat_ws(' ', meta->>'first_name', meta->>'last_name')));
  first_name_txt text := COALESCE(NULLIF(meta->>'first_name',''),
                                  split_part(full_name_txt, ' ', 1));
  last_name_txt text := COALESCE(NULLIF(meta->>'last_name',''),
                                 NULLIF(regexp_replace(full_name_txt, '^\S+\s*', ''), ''));
  org_name_txt text := COALESCE(NULLIF(meta->>'organization_name',''),
                                CASE WHEN full_name_txt <> '' THEN full_name_txt || '''s Organization'
                                     ELSE 'My Organization' END);
  org_type_txt text := COALESCE(NULLIF(meta->>'organization_type',''), 'distillery');
  role_txt text := COALESCE(NULLIF(meta->>'requested_role',''),
                            NULLIF(meta->>'role',''),
                            'admin');
  new_org_id uuid;
BEGIN
  -- Profile
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (NEW.id, first_name_txt, last_name_txt, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  -- Reuse an existing org for this user if one is already assigned (idempotency)
  SELECT organization_id INTO new_org_id
  FROM public.user_roles WHERE user_id = NEW.id LIMIT 1;

  IF new_org_id IS NULL THEN
    INSERT INTO public.organizations (
      name, type, dsp_number, permit_number, ein,
      address, city, state, zip_code, phone
    ) VALUES (
      org_name_txt,
      org_type_txt::public.org_type,
      NULLIF(meta->>'dsp_number',''),
      NULLIF(meta->>'permit_number',''),
      NULLIF(meta->>'ein',''),
      NULLIF(meta->>'address',''),
      NULLIF(meta->>'city',''),
      NULLIF(meta->>'state',''),
      NULLIF(meta->>'zip_code',''),
      NULLIF(meta->>'phone','')
    )
    RETURNING id INTO new_org_id;
  END IF;

  INSERT INTO public.user_roles (user_id, organization_id, role)
  VALUES (NEW.id, new_org_id, role_txt::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block auth signup on provisioning issues; log and continue.
  RAISE WARNING 'handle_new_user failed for %: % (%). Meta=%', NEW.id, SQLERRM, SQLSTATE, meta;
  RETURN NEW;
END;
$function$;

-- 2) Ensure trigger exists (drop-and-recreate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3) Recovery RPC: signed-in users can repair their own missing profile/org/role
CREATE OR REPLACE FUNCTION public.ensure_user_provisioning(
  _organization_name text DEFAULT NULL,
  _organization_type text DEFAULT NULL,
  _requested_role text DEFAULT NULL,
  _full_name text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  uid uuid := auth.uid();
  u_email text;
  u_meta jsonb;
  org_id uuid;
  role_txt text;
  org_name_txt text;
  org_type_txt text;
  full_name_txt text;
  first_name_txt text;
  last_name_txt text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT email, COALESCE(raw_user_meta_data, '{}'::jsonb)
    INTO u_email, u_meta
  FROM auth.users WHERE id = uid;

  full_name_txt := COALESCE(NULLIF(_full_name,''),
                            NULLIF(u_meta->>'full_name',''),
                            trim(concat_ws(' ', u_meta->>'first_name', u_meta->>'last_name')));
  first_name_txt := COALESCE(NULLIF(u_meta->>'first_name',''),
                             split_part(full_name_txt, ' ', 1));
  last_name_txt := NULLIF(regexp_replace(COALESCE(full_name_txt,''), '^\S+\s*', ''), '');

  org_name_txt := COALESCE(NULLIF(_organization_name,''),
                           NULLIF(u_meta->>'organization_name',''),
                           CASE WHEN full_name_txt <> '' THEN full_name_txt || '''s Organization'
                                ELSE 'My Organization' END);
  org_type_txt := COALESCE(NULLIF(_organization_type,''),
                           NULLIF(u_meta->>'organization_type',''),
                           'distillery');
  role_txt := COALESCE(NULLIF(_requested_role,''),
                       NULLIF(u_meta->>'requested_role',''),
                       NULLIF(u_meta->>'role',''),
                       'admin');

  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (uid, first_name_txt, last_name_txt, u_email)
  ON CONFLICT (id) DO NOTHING;

  SELECT organization_id INTO org_id
  FROM public.user_roles WHERE user_id = uid LIMIT 1;

  IF org_id IS NULL THEN
    INSERT INTO public.organizations (name, type)
    VALUES (org_name_txt, org_type_txt::public.org_type)
    RETURNING id INTO org_id;
  END IF;

  INSERT INTO public.user_roles (user_id, organization_id, role)
  VALUES (uid, org_id, role_txt::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN jsonb_build_object('organization_id', org_id, 'role', role_txt);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.ensure_user_provisioning(text,text,text,text) TO authenticated;

-- 4) Repair any existing auth users missing a profile or role
INSERT INTO public.profiles (id, first_name, last_name, email)
SELECT u.id,
       COALESCE(NULLIF(u.raw_user_meta_data->>'first_name',''),
                split_part(COALESCE(u.raw_user_meta_data->>'full_name',''),' ',1)),
       COALESCE(NULLIF(u.raw_user_meta_data->>'last_name',''),
                NULLIF(regexp_replace(COALESCE(u.raw_user_meta_data->>'full_name',''), '^\S+\s*', ''), '')),
       u.email
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- For any user missing a role, create an org + admin role
DO $$
DECLARE
  r record;
  new_org uuid;
  full_name_txt text;
BEGIN
  FOR r IN
    SELECT u.id, u.email, COALESCE(u.raw_user_meta_data,'{}'::jsonb) AS meta
    FROM auth.users u
    LEFT JOIN public.user_roles ur ON ur.user_id = u.id
    WHERE ur.user_id IS NULL
  LOOP
    full_name_txt := COALESCE(NULLIF(r.meta->>'full_name',''),
                              trim(concat_ws(' ', r.meta->>'first_name', r.meta->>'last_name')));
    INSERT INTO public.organizations (name, type)
    VALUES (
      COALESCE(NULLIF(r.meta->>'organization_name',''),
               CASE WHEN full_name_txt <> '' THEN full_name_txt || '''s Organization'
                    ELSE COALESCE(r.email,'My') || '''s Organization' END),
      COALESCE(NULLIF(r.meta->>'organization_type',''), 'distillery')::public.org_type
    )
    RETURNING id INTO new_org;

    INSERT INTO public.user_roles (user_id, organization_id, role)
    VALUES (r.id, new_org,
            COALESCE(NULLIF(r.meta->>'requested_role',''),
                     NULLIF(r.meta->>'role',''),
                     'admin')::public.app_role);
  END LOOP;
END $$;
