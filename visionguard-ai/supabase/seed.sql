-- ============================================================
-- VisionGuard-AI Seed Data
-- ============================================================

-- Note: In a real environment, auth.users would be populated via the Supabase Auth API.
-- For local testing, we assume a user exists or we bypass auth constraints if needed.
-- But since we enforce RLS and references, we need an auth user. 
-- In local Supabase, you can create a user via the UI or seed it if pgcrypto allows.

-- We'll insert a dummy user into auth.users (requires superuser or service role, which seed runs as).
insert into auth.users (id, email, raw_user_meta_data) 
values ('00000000-0000-0000-0000-000000000001', 'admin@visionguard.local', '{"full_name": "Demo Admin"}')
on conflict (id) do nothing;

-- The trigger handle_new_user should create the profile.

-- Create an organization
insert into organizations (id, name, created_by)
values ('11111111-1111-1111-1111-111111111111', 'Acme Infrastructure', '00000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

insert into organization_members (organization_id, user_id, role)
values ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'admin')
on conflict do nothing;

insert into org_settings (organization_id)
values ('11111111-1111-1111-1111-111111111111')
on conflict do nothing;

insert into integrations (organization_id, dry_run)
values ('11111111-1111-1111-1111-111111111111', true)
on conflict do nothing;

-- Create a project
insert into projects (id, organization_id, name, infra_type, location_description, created_by)
values ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'NH-48 Flyover Bridge', 'bridge', 'North Section', '00000000-0000-0000-0000-000000000001')
on conflict do nothing;

-- Create a zone
insert into zones (id, project_id, organization_id, name, level_label)
values ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Pier P4', 'Ground Level')
on conflict do nothing;
