-- Fix the INSERT policy for user_roles to avoid recursion
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;

-- Create a simple INSERT policy that doesn't reference user_roles table
CREATE POLICY "Users can insert their own roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Also add INSERT policy for organizations (needed for signup)
CREATE POLICY "Users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (true);  -- Allow anyone to create an organization during signup

-- Insert a test account data
-- First create a test organization
INSERT INTO public.organizations (id, name, type, dsp_number, ein, address, city, state, zip_code, phone)
VALUES (
  gen_random_uuid(),
  'Test Distillery Co.',
  'distillery',
  'DSP-12345',
  '12-3456789',
  '123 Test Street',
  'Test City',
  'CA',
  '90210',
  '555-0123'
) ON CONFLICT DO NOTHING;