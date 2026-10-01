-- =========================================================================
-- VISIONGUARD-AI: QUICK SEED SCRIPT
-- Run this script in your Supabase SQL Editor to instantly generate a 
-- Project, Inspection, and Anomaly linked to your authenticated user!
-- =========================================================================

DO $$
DECLARE
  test_user_id UUID;
  new_project_id UUID;
  new_inspection_id UUID;
BEGIN
  -- 1. Grab the first user in the auth.users table
  -- (Assuming you have already signed up or created a user in Supabase Auth)
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found in auth.users. Please sign up or create a user in Supabase Auth first!';
  END IF;

  RAISE NOTICE 'Seeding data for User ID: %', test_user_id;

  -- 2. Insert a Mock Project
  INSERT INTO projects (name, location, user_id) 
  VALUES ('Downtown Highrise (Alpha Sector)', 'New York, NY', test_user_id)
  RETURNING id INTO new_project_id;

  -- 3. Insert a Mock Inspection linked to the project and user
  INSERT INTO inspections (project_id, inspector_id, image_url, status, inspection_type)
  VALUES (
    new_project_id, 
    test_user_id, 
    'https://images.unsplash.com/photo-1541888081622-12ec16413d7a?auto=format&fit=crop&q=80', 
    'Completed', 
    'Hybrid'
  )
  RETURNING id INTO new_inspection_id;

  -- 4. Insert Mock Anomalies linked to the inspection
  INSERT INTO anomalies (inspection_id, category, severity, description, recommended_action, x_coordinate, y_coordinate)
  VALUES 
    (
      new_inspection_id, 
      'Concrete_Crack', 
      'Critical', 
      'Deep structural fissure detected on load-bearing pillar near Level 2 scaffolding.', 
      'Immediate structural review required. Halt operations in Zone B.',
      45.5, 
      65.2
    ),
    (
      new_inspection_id, 
      'PPE_Violation', 
      'Moderate', 
      'Worker detected without a high-visibility vest near active machinery.', 
      'Issue warning to supervisor. Ensure compliance before allowing entry to active zone.',
      25.0, 
      35.0
    );

  RAISE NOTICE '✅ Seeding complete! You can now view the anomalies on your Dashboard.';
END $$;
