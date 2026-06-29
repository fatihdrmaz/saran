-- =====================================================================
-- Saran — şema (enum tipleri + tablolar)
-- Kararlar: plan YARA BAŞINA · aylık MANUEL yenileme · hemşire HAVUZ atama
-- Para: TRY, kuruş cinsinden bigint · Silme: soft-delete (deleted_at)
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- enum tipleri (packages/shared/src/enums.ts ile birebir) ----------
create type user_role          as enum ('patient', 'nurse', 'admin');
create type wound_type          as enum ('pressure', 'diabetic_foot', 'surgical', 'venous', 'burn');
create type wound_clinical_status as enum ('improving', 'monitoring', 'stalled', 'closed');
create type pain_level           as enum ('none', 'mild', 'moderate', 'severe');
create type exudate_level        as enum ('none', 'light', 'moderate', 'heavy');
create type plan_type            as enum ('one_time', 'week_1', 'week_3', 'monthly');
create type plan_status          as enum ('proposed', 'active', 'expired', 'cancelled');
create type payment_status       as enum ('paid', 'pending', 'awaiting_approval');
create type appointment_type     as enum ('video', 'voice');
create type appointment_status   as enum ('requested', 'confirmed', 'completed', 'cancelled');
create type nurse_status         as enum ('pending', 'verified', 'rejected');
create type nurse_document_type  as enum ('diploma', 'certificate', 'id');
create type verification_status  as enum ('pending', 'verified', 'rejected');
create type message_type         as enum ('text', 'image');
create type care_template_category as enum ('pressure', 'diabetic_foot', 'surgical', 'emergency_referral', 'burn');
create type locale_code          as enum ('tr', 'en', 'ar');

-- ---------- profiles (auth.users 1-1) ----------
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            user_role not null default 'patient',
  full_name       text not null,
  phone           text,
  email           text,
  locale          locale_code not null default 'tr',
  kvkk_consent_at timestamptz,
  created_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create table patients (
  id                uuid primary key references profiles(id) on delete cascade,
  age               int,
  diagnoses         text[] not null default '{}',
  allergies         text[] not null default '{}',
  emergency_contact text
);

create table nurses (
  id                  uuid primary key references profiles(id) on delete cascade,
  specialty           text not null,
  experience_years    int not null default 0,
  diploma_no          text not null,
  status              nurse_status not null default 'pending', -- verified olmadan atanamaz
  rating              numeric(2,1) not null default 0,
  active_patient_count int not null default 0,
  bio                 text
);

create table nurse_documents (
  id                  uuid primary key default gen_random_uuid(),
  nurse_id            uuid not null references nurses(id) on delete cascade,
  type                nurse_document_type not null,
  url                 text not null,
  verification_status verification_status not null default 'pending',
  created_at          timestamptz not null default now()
);

-- ---------- wounds (havuz: assigned_nurse_id atanana kadar null) ----------
create table wounds (
  id                uuid primary key default gen_random_uuid(),
  patient_id        uuid not null references patients(id) on delete cascade,
  assigned_nurse_id uuid references nurses(id) on delete set null, -- HAVUZ
  type              wound_type not null,
  region            text,
  clinical_status   wound_clinical_status not null default 'monitoring',
  started_at        timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  deleted_at        timestamptz
);
create index on wounds (patient_id);
create index on wounds (assigned_nurse_id);
-- havuz kuyruğu: henüz atanmamış yaralar
create index on wounds (assigned_nurse_id) where assigned_nurse_id is null;

create table submissions (
  id              uuid primary key default gen_random_uuid(),
  wound_id        uuid not null references wounds(id) on delete cascade,
  image_path      text not null,            -- storage yolu (private bucket)
  patient_note    text,
  pain_level      pain_level not null default 'none',
  exudate         exudate_level,
  healing_percent int,                      -- o anki snapshot (0-100)
  created_at      timestamptz not null default now()
);
create index on submissions (wound_id, created_at desc);

create table assessments (
  id                     uuid primary key default gen_random_uuid(),
  submission_id          uuid not null references submissions(id) on delete cascade,
  nurse_id               uuid not null references nurses(id),
  tissue_type            text,
  estimated_healing_days int,
  prognosis_note         text not null,
  care_instruction       text,
  dressing_suggestion    text,
  created_at             timestamptz not null default now()
);
create index on assessments (submission_id);

-- ---------- plans (YARA BAŞINA) ----------
create table plans (
  id                   uuid primary key default gen_random_uuid(),
  wound_id             uuid not null references wounds(id) on delete cascade,
  patient_id           uuid not null references patients(id) on delete cascade,
  proposed_by_nurse_id uuid not null references nurses(id),
  type                 plan_type not null,
  price_kurus          bigint not null,
  status               plan_status not null default 'proposed',
  prognosis_note       text,
  started_at           timestamptz,
  ends_at              timestamptz,
  progress_day         int,
  created_at           timestamptz not null default now()
);
create index on plans (wound_id);
create index on plans (patient_id);
-- bir yaranın aynı anda en fazla bir aktif planı olur
create unique index one_active_plan_per_wound
  on plans (wound_id) where status = 'active';

create table payments (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references patients(id) on delete cascade,
  plan_id     uuid not null references plans(id) on delete cascade,
  amount_kurus bigint not null,
  vat_kurus   bigint not null default 0,
  status      payment_status not null default 'awaiting_approval',
  receipt_no  text,
  paid_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index on payments (patient_id);
create index on payments (plan_id);

-- ---------- mesajlaşma ----------
create table conversations (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid not null references patients(id) on delete cascade,
  nurse_id        uuid not null references nurses(id) on delete cascade,
  last_message_at timestamptz,
  created_at      timestamptz not null default now(),
  unique (patient_id, nurse_id)
);

create table messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references profiles(id),
  type            message_type not null default 'text',
  content         text not null,
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);
create index on messages (conversation_id, created_at);

create table appointments (
  id           uuid primary key default gen_random_uuid(),
  patient_id   uuid not null references patients(id) on delete cascade,
  nurse_id     uuid not null references nurses(id) on delete cascade,
  wound_id     uuid references wounds(id) on delete set null,
  type         appointment_type not null,
  scheduled_at timestamptz not null,
  duration_min int not null default 15,
  status       appointment_status not null default 'requested',
  created_at   timestamptz not null default now()
);
create index on appointments (nurse_id, scheduled_at);

create table reviews (
  id               uuid primary key default gen_random_uuid(),
  patient_id       uuid not null references patients(id) on delete cascade,
  rating           int not null check (rating between 1 and 5),
  text             text not null,
  before_image_url text,   -- hasta onaylı
  after_image_url  text,
  wound_type       wound_type not null,
  duration_label   text,
  created_at       timestamptz not null default now()
);

create table care_templates (
  id          uuid primary key default gen_random_uuid(),
  nurse_id    uuid references nurses(id) on delete cascade, -- null = global
  category    care_template_category not null,
  title       text not null,
  content     text not null,
  usage_count int not null default 0,
  created_at  timestamptz not null default now()
);

create table articles (
  id               uuid primary key default gen_random_uuid(),
  category         text not null,
  title            text not null,
  slug             text not null,
  intro            text not null,
  body             text not null,
  author_nurse_id  uuid references nurses(id) on delete set null,
  reading_minutes  int not null default 3,
  locale           locale_code not null default 'tr',
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  unique (slug, locale)
);

-- ---------- KVKK erişim logu ----------
create table access_logs (
  id            uuid primary key default gen_random_uuid(),
  actor_id      uuid references profiles(id) on delete set null,
  resource_type text not null,  -- ör. 'submission_image'
  resource_id   uuid,
  action        text not null,  -- ör. 'view' / 'decrypt'
  created_at    timestamptz not null default now()
);
create index on access_logs (resource_type, resource_id);
