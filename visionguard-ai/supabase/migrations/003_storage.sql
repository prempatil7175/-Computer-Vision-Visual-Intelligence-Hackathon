-- ============================================================
-- VisionGuard-AI Storage Buckets
-- ============================================================

-- Create buckets
insert into storage.buckets (id, name, public) values
  ('inspection-media', 'inspection-media', false),
  ('site-maps', 'site-maps', false),
  ('incident-snapshots', 'incident-snapshots', false),
  ('reports', 'reports', false)
on conflict (id) do nothing;

-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- Storage policies for inspection-media
create policy "inspection-media: members can read" on storage.objects for select
using (bucket_id = 'inspection-media' and public.is_org_member((storage.foldername(name))[1]::uuid));

create policy "inspection-media: inspector+ can insert" on storage.objects for insert
with check (bucket_id = 'inspection-media' and public.has_role((storage.foldername(name))[1]::uuid, array['admin'::user_role, 'engineer'::user_role, 'safety_manager'::user_role, 'inspector'::user_role]));

-- Storage policies for site-maps
create policy "site-maps: members can read" on storage.objects for select
using (bucket_id = 'site-maps' and public.is_org_member((storage.foldername(name))[1]::uuid));

create policy "site-maps: admin/engineer can insert" on storage.objects for insert
with check (bucket_id = 'site-maps' and public.has_role((storage.foldername(name))[1]::uuid, array['admin'::user_role, 'engineer'::user_role]));

-- Storage policies for incident-snapshots
create policy "incident-snapshots: members can read" on storage.objects for select
using (bucket_id = 'incident-snapshots' and public.is_org_member((storage.foldername(name))[1]::uuid));

create policy "incident-snapshots: server only can insert" on storage.objects for insert
with check (false);

-- Storage policies for reports
create policy "reports: engineer+ can read" on storage.objects for select
using (bucket_id = 'reports' and public.has_role((storage.foldername(name))[1]::uuid, array['admin'::user_role, 'engineer'::user_role, 'safety_manager'::user_role]));

create policy "reports: engineer+ can insert" on storage.objects for insert
with check (bucket_id = 'reports' and public.has_role((storage.foldername(name))[1]::uuid, array['admin'::user_role, 'engineer'::user_role, 'safety_manager'::user_role]));
