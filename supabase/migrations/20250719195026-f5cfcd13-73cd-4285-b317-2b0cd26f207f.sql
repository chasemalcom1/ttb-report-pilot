-- Clean up duplicate user roles for your account
-- First, let's see what roles exist and clean them up
DELETE FROM public.user_roles 
WHERE user_id = '43f270fc-ad74-43f6-883a-3132bc5b1676'
AND organization_id = (SELECT id FROM public.organizations WHERE name = 'Test Distillery Co.' LIMIT 1);

-- Keep only the Chase Distillery Co. role
-- Ensure there's exactly one role for your user
DELETE FROM public.user_roles 
WHERE user_id = '43f270fc-ad74-43f6-883a-3132bc5b1676'
AND id NOT IN (
    SELECT id FROM public.user_roles 
    WHERE user_id = '43f270fc-ad74-43f6-883a-3132bc5b1676'
    AND organization_id = (SELECT id FROM public.organizations WHERE name = 'Chase Distillery Co.' LIMIT 1)
    LIMIT 1
);