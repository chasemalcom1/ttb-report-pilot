-- Get the test organization ID for the test user
DO $$
DECLARE 
    test_org_id UUID;
    test_user_id UUID := '550e8400-e29b-41d4-a716-446655440000'::UUID; -- Fixed UUID for test user
BEGIN
    -- Get the test organization ID
    SELECT id INTO test_org_id 
    FROM public.organizations 
    WHERE name = 'Test Distillery Co.' 
    LIMIT 1;
    
    -- Insert test user profile (this will be created automatically by trigger when user signs up)
    -- But we'll insert it manually for our test account
    INSERT INTO public.profiles (id, first_name, last_name, email)
    VALUES (
        test_user_id,
        'Test',
        'User',
        'test@example.com'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Insert test user role
    INSERT INTO public.user_roles (user_id, organization_id, role)
    VALUES (
        test_user_id,
        test_org_id,
        'admin'
    ) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Test account created with org ID: %', test_org_id;
END $$;