-- ============================================================
-- VisionGuard-AI Schema
-- ============================================================
create extension if not exists "pgcrypto";

-- ---------- ENUMS ----------
create type user_role as enum ('admin','engineer','safety_manager','inspector','viewer');
create type infra_type as enum ('highway','bridge','tunnel','high_rise','other');
create type analysis_mode as enum ('structural','safety','both');
create type source_type as enum ('inspector_photo','drone_image','drone_video_frame','cctv_frame','edge_device');
create type severity_tier as enum ('low','moderate','critical');
create type anomaly_status as enum ('open','acknowledged','in_progress','resolved','verified','false_positive');
create type anomaly_kind as enum ('structural','safety');
create type inspection_status as enum ('queued','processing','completed','failed');
create type channel_type as enum ('sms','whatsapp','jira','sap','in_app');
create type delivery_status as enum ('pending','sent','delivered','failed','dry_run');

-- ---------- ORGANIZATIONS & MEMBERS ----------
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text check (phone is null or phone ~ '^\+[1-9][0-9]{7,14}$'),
  created_at timestamptz not null default now()
);

create table organization_members (
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role user_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index idx_org_members_user on organization_members(user_id);

create table invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  email text not null,
  role user_role not null default 'viewer',
  token text not null unique default encode(gen_random_bytes(24),'hex'),
  invited_by uuid not null references auth.users(id),
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

-- ---------- ORG SETTINGS ----------
create table org_settings (
  organization_id uuid primary key references organizations(id) on delete cascade,
  severity_thresholds jsonb not null default '{
    "crack_width_mm":{"moderate":0.3,"critical":1.0},
    "crack_growth_pct":{"moderate":10,"critical":30},
    "rust_area_pct":{"moderate":5,"critical":20},
    "spalling_area_pct":{"moderate":5,"critical":15},
    "ppe_noncompliant_workers_critical":3
  }'::jsonb,
  alert_rules jsonb not null default '{
    "min_severity_for_sms":"critical",
    "min_severity_for_whatsapp":"critical",
    "min_severity_for_work_order":"moderate",
    "dedupe_window_minutes":30
  }'::jsonb,
  updated_at timestamptz not null default now()
);

create table integrations (
  organization_id uuid primary key references organizations(id) on delete cascade,
  twilio_enabled boolean not null default false,
  jira_enabled boolean not null default false,
  jira_base_url text,
  jira_project_key text,
  jira_issue_type text default 'Task',
  sap_enabled boolean not null default false,
  sap_base_url text,
  dry_run boolean not null default true,
  updated_at timestamptz not null default now()
  -- NOTE: secrets (tokens/passwords) are NEVER stored here; they live in server environment variables.
);

-- ---------- PROJECTS, ZONES ----------
create table projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 160),
  infra_type infra_type not null,
  location_description text,
  site_map_path text,          -- storage path in 'site-maps' bucket
  site_map_width int,
  site_map_height int,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create index idx_projects_org on projects(organization_id);

create table zones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  level_label text,            -- e.g., "Level 3", "Pier P4", "Chainage 12+400"
  created_at timestamptz not null default now()
);
create index idx_zones_project on zones(project_id);

create table project_recipients (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  phone text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  role_label text,
  sms_enabled boolean not null default true,
  whatsapp_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- EDGE DEVICES ----------
create table edge_devices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  zone_id uuid references zones(id) on delete set null,
  name text not null,
  device_kind text not null default 'jetson_gateway',
  stream_label text,           -- e.g., "RTSP Cam 07 - North Gate"
  api_key_hash text not null,  -- SHA-256 of the key; plaintext shown once at creation
  api_key_prefix text not null,
  is_active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_devices_org on edge_devices(organization_id);

-- ---------- INSPECTIONS ----------
create table inspections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  zone_id uuid references zones(id) on delete set null,
  created_by uuid references auth.users(id),
  edge_device_id uuid references edge_devices(id) on delete set null,
  analysis_mode analysis_mode not null,
  source_type source_type not null,
  status inspection_status not null default 'queued',
  notes text,
  captured_at timestamptz not null default now(),
  frames_total int not null default 0,
  frames_processed int not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index idx_inspections_project on inspections(project_id, created_at desc);

create table inspection_frames (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid not null references inspections(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  storage_path text not null,     -- 'inspection-media' bucket
  frame_index int not null default 0,
  timestamp_seconds numeric,
  width int,
  height int,
  location_x numeric check (location_x between 0 and 1),
  location_y numeric check (location_y between 0 and 1),
  gps_lat numeric,
  gps_lng numeric,
  reference_scale_mm numeric,
  ai_raw_response jsonb,
  ai_model text,
  processing_ms int,
  created_at timestamptz not null default now()
);
create index idx_frames_inspection on inspection_frames(inspection_id);

-- ---------- ANOMALIES ----------
create table anomalies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  zone_id uuid references zones(id) on delete set null,
  inspection_id uuid not null references inspections(id) on delete cascade,
  frame_id uuid not null references inspection_frames(id) on delete cascade,
  kind anomaly_kind not null,
  defect_type text,                    -- section 8.2 values when kind='structural'
  violation_type text,                 -- section 8.3 values when kind='safety'
  severity severity_tier not null,
  ai_proposed_severity severity_tier not null,
  severity_breakdown jsonb not null default '{}'::jsonb,  -- rule engine trace
  confidence numeric not null check (confidence between 0 and 1),
  bbox jsonb not null,                 -- {x,y,w,h} normalized 0-1
  measurements jsonb not null default '{}'::jsonb, -- {crack_width_mm, crack_length_mm, rust_area_pct, spalling_area_pct, measurement_basis}
  summary text not null,
  reasoning text not null,
  recommended_action text not null,
  urgency text not null check (urgency in ('immediate','within_24h','within_7d','next_scheduled_maintenance')),
  engineer_review_required boolean not null default true,
  standards_referenced text[] not null default '{}',
  location_x numeric check (location_x between 0 and 1),
  location_y numeric check (location_y between 0 and 1),
  gps_lat numeric,
  gps_lng numeric,
  status anomaly_status not null default 'open',
  previous_anomaly_id uuid references anomalies(id) on delete set null,
  assigned_to uuid references auth.users(id),
  detected_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  check ((kind='structural' and defect_type is not null) or (kind='safety' and violation_type is not null))
);
create index idx_anomalies_org_status on anomalies(organization_id, status, severity);
create index idx_anomalies_project on anomalies(project_id, detected_at desc);
create index idx_anomalies_zone_type on anomalies(zone_id, defect_type, violation_type, detected_at desc);

create table anomaly_comments (
  id uuid primary key default gen_random_uuid(),
  anomaly_id uuid not null references anomalies(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table anomaly_events (
  id uuid primary key default gen_random_uuid(),
  anomaly_id uuid not null references anomalies(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  actor_id uuid references auth.users(id),
  event_type text not null,       -- created, status_changed, assigned, severity_overridden, incident_triggered
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- INCIDENTS & DELIVERIES ----------
create table incidents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  anomaly_id uuid not null references anomalies(id) on delete cascade,
  severity severity_tier not null,
  title text not null,
  message text not null,
  snapshot_path text not null,
  dedupe_key text not null,
  created_at timestamptz not null default now()
);
create index idx_incidents_dedupe on incidents(organization_id, dedupe_key, created_at desc);

create table incident_deliveries (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references incidents(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  channel channel_type not null,
  target text,                     -- phone number, Jira issue key, SAP notification no.
  status delivery_status not null default 'pending',
  external_id text,
  external_url text,
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- NOTIFICATIONS ----------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,  -- null = broadcast to org
  title text not null,
  body text not null,
  severity severity_tier,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on notifications(user_id, read_at, created_at desc);

-- ---------- REPORTS ----------
create table reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  generated_by uuid not null references auth.users(id),
  date_from date not null,
  date_to date not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- ---------- AUDIT LOG ----------
create table audit_log (
  id bigserial primary key,
  organization_id uuid references organizations(id) on delete cascade,
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip inet,
  created_at timestamptz not null default now()
);
create index idx_audit_org on audit_log(organization_id, created_at desc);

-- ---------- HELPER FUNCTIONS ----------
create or replace function public.is_org_member(org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from organization_members where organization_id = org and user_id = auth.uid());
$$;

create or replace function public.org_role(org uuid)
returns user_role language sql stable security definer set search_path = public as $$
  select role from organization_members where organization_id = org and user_id = auth.uid();
$$;

create or replace function public.has_role(org uuid, allowed user_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.org_role(org) = any(allowed), false);
$$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Block updates/deletes on audit_log (immutability)
create or replace function public.audit_immutable() returns trigger language plpgsql as $$
begin raise exception 'audit_log is immutable'; end; $$;
create trigger audit_no_update before update or delete on audit_log
  for each row execute function public.audit_immutable();

-- Enable realtime
alter publication supabase_realtime add table anomalies, notifications, incidents;
