
-- Drop the existing problematic policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view organization roles" ON public.user_roles;

-- Create a security definer function to safely check user roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
$$;

-- Create a security definer function to check if user is admin of an organization
CREATE OR REPLACE FUNCTION public.is_user_admin_of_org(user_id uuid, org_id uuid)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 
    AND user_roles.organization_id = $2 
    AND user_roles.role = 'admin'
  );
$$;

-- Recreate the policies using the security definer functions
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view organization roles"
  ON public.user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur2
      WHERE ur2.user_id = auth.uid() 
      AND ur2.organization_id = user_roles.organization_id 
      AND ur2.role = 'admin'
    )
  );

-- Also update the organizations policies to use a simpler approach
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Admins can update their organization" ON public.organizations;

CREATE POLICY "Users can view their organization"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.organization_id = organizations.id
    )
  );

CREATE POLICY "Admins can update their organization"
  ON public.organizations FOR UPDATE
  USING (
    public.is_user_admin_of_org(auth.uid(), id)
  );
