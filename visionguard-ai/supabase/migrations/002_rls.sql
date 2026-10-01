-- ============================================================
-- VisionGuard-AI RLS Policies
-- ============================================================

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table organization_members enable row level security;
alter table invitations enable row level security;
alter table org_settings enable row level security;
alter table integrations enable row level security;
alter table projects enable row level security;
alter table zones enable row level security;
alter table project_recipients enable row level security;
alter table edge_devices enable row level security;
alter table inspections enable row level security;
alter table inspection_frames enable row level security;
alter table anomalies enable row level security;
alter table anomaly_comments enable row level security;
alter table anomaly_events enable row level security;
alter table incidents enable row level security;
alter table incident_deliveries enable row level security;
alter table notifications enable row level security;
alter table reports enable row level security;
alter table audit_log enable row level security;

-- ---------- ORGANIZATIONS & MEMBERS ----------

-- organizations
create policy "Organizations: members can read" on organizations for select
using (public.is_org_member(id));

create policy "Organizations: authenticated can insert" on organizations for insert
with check (auth.uid() = created_by);

create policy "Organizations: admin can update" on organizations for update
using (public.has_role(id, array['admin'::user_role]));

create policy "Organizations: admin can delete" on organizations for delete
using (public.has_role(id, array['admin'::user_role]));

-- profiles
create policy "Profiles: users can read their own or shared org members" on profiles for select
using (
  id = auth.uid() or
  exists (
    select 1 from organization_members m1
    join organization_members m2 on m1.organization_id = m2.organization_id
    where m1.user_id = auth.uid() and m2.user_id = profiles.id
  )
);

create policy "Profiles: users can insert their own" on profiles for insert
with check (id = auth.uid());

create policy "Profiles: users can update their own" on profiles for update
using (id = auth.uid());

-- organization_members
create policy "Org members: members can read" on organization_members for select
using (public.is_org_member(organization_id));

create policy "Org members: admin can insert" on organization_members for insert
with check (public.has_role(organization_id, array['admin'::user_role]));

create policy "Org members: admin can update" on organization_members for update
using (public.has_role(organization_id, array['admin'::user_role]));

create policy "Org members: admin can delete" on organization_members for delete
using (public.has_role(organization_id, array['admin'::user_role]));

-- invitations
create policy "Invitations: admin can read" on invitations for select
using (public.has_role(organization_id, array['admin'::user_role]));

create policy "Invitations: admin can insert" on invitations for insert
with check (public.has_role(organization_id, array['admin'::user_role]));

create policy "Invitations: admin can update" on invitations for update
using (public.has_role(organization_id, array['admin'::user_role]));

create policy "Invitations: admin can delete" on invitations for delete
using (public.has_role(organization_id, array['admin'::user_role]));

-- ---------- ORG SETTINGS ----------
create policy "Org settings: members can read" on org_settings for select
using (public.is_org_member(organization_id));

create policy "Org settings: admin can insert" on org_settings for insert
with check (public.has_role(organization_id, array['admin'::user_role]));

create policy "Org settings: admin can update" on org_settings for update
using (public.has_role(organization_id, array['admin'::user_role]));

create policy "Integrations: members can read" on integrations for select
using (public.is_org_member(organization_id));

create policy "Integrations: admin can insert" on integrations for insert
with check (public.has_role(organization_id, array['admin'::user_role]));

create policy "Integrations: admin can update" on integrations for update
using (public.has_role(organization_id, array['admin'::user_role]));

-- ---------- PROJECTS, ZONES ----------
create policy "Projects: members can read" on projects for select
using (public.is_org_member(organization_id));

create policy "Projects: admin, engineer can insert" on projects for insert
with check (public.has_role(organization_id, array['admin'::user_role, 'engineer'::user_role]));

create policy "Projects: admin, engineer can update" on projects for update
using (public.has_role(organization_id, array['admin'::user_role, 'engineer'::user_role]));

create policy "Projects: admin can delete" on projects for delete
using (public.has_role(organization_id, array['admin'::user_role]));

create policy "Zones: members can read" on zones for select
using (public.is_org_member(organization_id));

create policy "Zones: admin, engineer can insert" on zones for insert
with check (public.has_role(organization_id, array['admin'::user_role, 'engineer'::user_role]));

create policy "Zones: admin, engineer can update" on zones for update
using (public.has_role(organization_id, array['admin'::user_role, 'engineer'::user_role]));

create policy "Zones: admin can delete" on zones for delete
using (public.has_role(organization_id, array['admin'::user_role]));

create policy "Project recipients: members can read" on project_recipients for select
using (public.is_org_member(organization_id));

create policy "Project recipients: admin, engineer can insert" on project_recipients for insert
with check (public.has_role(organization_id, array['admin'::user_role, 'engineer'::user_role]));

create policy "Project recipients: admin, engineer can update" on project_recipients for update
using (public.has_role(organization_id, array['admin'::user_role, 'engineer'::user_role]));

create policy "Project recipients: admin can delete" on project_recipients for delete
using (public.has_role(organization_id, array['admin'::user_role]));

-- ---------- EDGE DEVICES ----------
create policy "Edge devices: admin, engineer can read" on edge_devices for select
using (public.has_role(organization_id, array['admin'::user_role, 'engineer'::user_role]));

create policy "Edge devices: admin, engineer can insert" on edge_devices for insert
with check (public.has_role(organization_id, array['admin'::user_role, 'engineer'::user_role]));

create policy "Edge devices: admin, engineer can update" on edge_devices for update
using (public.has_role(organization_id, array['admin'::user_role, 'engineer'::user_role]));

create policy "Edge devices: admin can delete" on edge_devices for delete
using (public.has_role(organization_id, array['admin'::user_role]));

-- ---------- INSPECTIONS ----------
create policy "Inspections: members can read" on inspections for select
using (public.is_org_member(organization_id));

create policy "Inspections: inspector+ can insert" on inspections for insert
with check (public.has_role(organization_id, array['admin'::user_role, 'engineer'::user_role, 'safety_manager'::user_role, 'inspector'::user_role]));

create policy "Inspections: admin, engineer can update" on inspections for update
using (public.has_role(organization_id, array['admin'::user_role, 'engineer'::user_role]));

create policy "Inspections: admin can delete" on inspections for delete
using (public.has_role(organization_id, array['admin'::user_role]));

create policy "Inspection frames: members can read" on inspection_frames for select
using (public.is_org_member(organization_id));

create policy "Inspection frames: inspector+ can insert" on inspection_frames for insert
with check (public.has_role(organization_id, array['admin'::user_role, 'engineer'::user_role, 'safety_manager'::user_role, 'inspector'::user_role]));

create policy "Inspection frames: admin, engineer can update" on inspection_frames for update
using (public.has_role(organization_id, array['admin'::user_role, 'engineer'::user_role]));

create policy "Inspection frames: admin can delete" on inspection_frames for delete
using (public.has_role(organization_id, array['admin'::user_role]));

-- ---------- ANOMALIES ----------
create policy "Anomalies: members can read" on anomalies for select
using (public.is_org_member(organization_id));

create policy "Anomalies: server only can insert" on anomalies for insert
with check (false);

create policy "Anomalies: admin, engineer, safety_manager can update" on anomalies for update
using (public.has_role(organization_id, array['admin'::user_role, 'engineer'::user_role, 'safety_manager'::user_role]));

create policy "Anomalies: admin can delete" on anomalies for delete
using (public.has_role(organization_id, array['admin'::user_role]));

create policy "Anomaly comments: members can read" on anomaly_comments for select
using (public.is_org_member(organization_id));

create policy "Anomaly comments: inspector+ can insert" on anomaly_comments for insert
with check (public.has_role(organization_id, array['admin'::user_role, 'engineer'::user_role, 'safety_manager'::user_role, 'inspector'::user_role]));

create policy "Anomaly comments: author can update" on anomaly_comments for update
using (user_id = auth.uid());

create policy "Anomaly comments: author or admin can delete" on anomaly_comments for delete
using (user_id = auth.uid() or public.has_role(organization_id, array['admin'::user_role]));

create policy "Anomaly events: members can read" on anomaly_events for select
using (public.is_org_member(organization_id));

-- ---------- INCIDENTS & DELIVERIES ----------
create policy "Incidents: members can read" on incidents for select
using (public.is_org_member(organization_id));

create policy "Incident deliveries: members can read" on incident_deliveries for select
using (public.is_org_member(organization_id));

-- ---------- NOTIFICATIONS ----------
create policy "Notifications: users can read own or broadcast" on notifications for select
using (public.is_org_member(organization_id) and (user_id = auth.uid() or user_id is null));

create policy "Notifications: owner can update" on notifications for update
using (user_id = auth.uid());

create policy "Notifications: owner can delete" on notifications for delete
using (user_id = auth.uid());

-- ---------- REPORTS ----------
create policy "Reports: engineer+ can read" on reports for select
using (public.has_role(organization_id, array['admin'::user_role, 'engineer'::user_role, 'safety_manager'::user_role]));

create policy "Reports: engineer+ can insert" on reports for insert
with check (public.has_role(organization_id, array['admin'::user_role, 'engineer'::user_role, 'safety_manager'::user_role]));

create policy "Reports: admin can delete" on reports for delete
using (public.has_role(organization_id, array['admin'::user_role]));

-- ---------- AUDIT LOG ----------
create policy "Audit log: admin can read" on audit_log for select
using (public.has_role(organization_id, array['admin'::user_role]));
