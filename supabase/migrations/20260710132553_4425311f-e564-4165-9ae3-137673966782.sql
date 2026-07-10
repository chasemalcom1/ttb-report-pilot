
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_org_id uuid;
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  org_name text := meta->>'organization_name';
  org_type_txt text := COALESCE(meta->>'organization_type', 'distillery');
  user_role_txt text := COALESCE(meta->>'role', 'admin');
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    meta->>'first_name',
    meta->>'last_name',
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  IF org_name IS NOT NULL AND length(org_name) > 0 THEN
    INSERT INTO public.organizations (
      name, type, dsp_number, permit_number, ein,
      address, city, state, zip_code, phone
    ) VALUES (
      org_name,
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

    INSERT INTO public.user_roles (user_id, organization_id, role)
    VALUES (NEW.id, new_org_id, user_role_txt::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
