-- Fix the infinite recursion in user_roles policies
-- Drop all existing problematic SELECT policies on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view organization roles" ON public.user_roles;

-- Create a simple, non-recursive SELECT policy for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Also ensure the user has a role and organization
-- Let's check if your user needs role/organization data
INSERT INTO public.user_roles (user_id, organization_id, role)
SELECT 
    '43f270fc-ad74-43f6-883a-3132bc5b1676'::uuid,
    (SELECT id FROM public.organizations WHERE name = 'Test Distillery Co.' LIMIT 1),
    'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = '43f270fc-ad74-43f6-883a-3132bc5b1676'
);

-- Create an organization for your account if it doesn't exist
INSERT INTO public.organizations (
    name, 
    type, 
    dsp_number, 
    permit_number, 
    ein, 
    address, 
    city, 
    state, 
    zip_code, 
    phone
) VALUES (
    'Chase Distillery Co.',
    'distillery',
    'CA-DSP-CHASE',
    'TTB-CHASE',
    '12-3456789',
    '123 Main St',
    'San Francisco',
    'CA',
    '94105',
    '555-123-4567'
) ON CONFLICT DO NOTHING;

-- Link your user to your organization
INSERT INTO public.user_roles (user_id, organization_id, role)
SELECT 
    '43f270fc-ad74-43f6-883a-3132bc5b1676'::uuid,
    (SELECT id FROM public.organizations WHERE name = 'Chase Distillery Co.' LIMIT 1),
    'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = '43f270fc-ad74-43f6-883a-3132bc5b1676'
    AND organization_id = (SELECT id FROM public.organizations WHERE name = 'Chase Distillery Co.' LIMIT 1)
);