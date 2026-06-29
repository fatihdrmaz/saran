-- =====================================================================
-- Saran — Row Level Security
-- En kritik ilke (README §5, §7): yara verisine YALNIZCA atanmış hemşire erişir.
-- Havuz: atanmamış (assigned_nurse_id IS NULL) yaralar tüm doğrulanmış
-- hemşirelere kuyrukta görünür; biri üstlenince yalnızca o hemşireye kilitlenir.
-- =====================================================================

-- ---------- yardımcı fonksiyonlar (SECURITY DEFINER → RLS özyinelemesini önler) ----------
create or replace function public.my_role()
  returns user_role language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
  returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

create or replace function public.is_verified_nurse()
  returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from nurses where id = auth.uid() and status = 'verified')
$$;

-- bir hemşire bu yarayı görebilir mi? (atanmış VEYA havuzda)
create or replace function public.nurse_can_see_wound(w_id uuid)
  returns boolean language sql stable security definer set search_path = public as $$
  select public.is_verified_nurse() and exists (
    select 1 from wounds w
    where w.id = w_id and (w.assigned_nurse_id = auth.uid() or w.assigned_nurse_id is null)
  )
$$;

-- bu hemşire yaraya ATANMIŞ mı? (görsel deşifre / mesaj için tam erişim)
create or replace function public.nurse_is_assigned(w_id uuid)
  returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from wounds w where w.id = w_id and w.assigned_nurse_id = auth.uid()
  )
$$;

-- ---------- RLS aç ----------
alter table profiles        enable row level security;
alter table patients        enable row level security;
alter table nurses          enable row level security;
alter table nurse_documents enable row level security;
alter table wounds          enable row level security;
alter table submissions     enable row level security;
alter table assessments     enable row level security;
alter table plans           enable row level security;
alter table payments        enable row level security;
alter table conversations   enable row level security;
alter table messages        enable row level security;
alter table appointments    enable row level security;
alter table reviews         enable row level security;
alter table care_templates  enable row level security;
alter table articles        enable row level security;
alter table access_logs     enable row level security;

-- ---------- profiles ----------
create policy profiles_select on profiles for select using (
  id = auth.uid()
  or public.is_admin()
  or (role = 'patient' and public.is_verified_nurse())   -- hemşire hastaları görür
);
-- doğrulanmış hemşire profilleri herkese açık (pazarlama / hemşire kartı)
create policy profiles_select_public_nurse on profiles for select to anon, authenticated using (
  role = 'nurse' and exists (select 1 from nurses n where n.id = profiles.id and n.status = 'verified')
);
create policy profiles_insert on profiles for insert with check (id = auth.uid());
create policy profiles_update on profiles for update using (id = auth.uid() or public.is_admin());

-- ---------- patients ----------
create policy patients_select on patients for select using (
  id = auth.uid() or public.is_admin() or public.is_verified_nurse()
);
create policy patients_write on patients for all using (
  id = auth.uid() or public.is_admin()
) with check (id = auth.uid() or public.is_admin());

-- ---------- nurses ----------
create policy nurses_select on nurses for select to anon, authenticated using (
  status = 'verified' or id = auth.uid() or public.is_admin()
);
create policy nurses_update_self on nurses for update using (id = auth.uid() or public.is_admin());
create policy nurses_admin_write on nurses for all using (public.is_admin()) with check (public.is_admin());

-- ---------- nurse_documents (yalnızca sahip hemşire + admin) ----------
create policy nurse_docs_all on nurse_documents for all using (
  nurse_id = auth.uid() or public.is_admin()
) with check (nurse_id = auth.uid() or public.is_admin());

-- ---------- wounds (havuz görünürlüğü) ----------
create policy wounds_select on wounds for select using (
  patient_id = auth.uid() or public.nurse_can_see_wound(id) or public.is_admin()
);
create policy wounds_insert on wounds for insert with check (patient_id = auth.uid());
create policy wounds_update on wounds for update using (
  public.nurse_is_assigned(id) or public.is_admin()
) with check (public.nurse_is_assigned(id) or public.is_admin());
-- not: yaranın HAVUZDAN üstlenilmesi (claim) public.claim_wound() RPC ile yapılır (0003).

-- ---------- submissions ----------
-- satır metaverisi havuzdaki hemşireye görünür (triyaj); GÖRSEL erişimi storage
-- politikasında daha sıkıdır → yalnızca atanmış hemşire imzalı URL alır (0003).
create policy submissions_select on submissions for select using (
  exists (select 1 from wounds w where w.id = wound_id and w.patient_id = auth.uid())
  or public.nurse_can_see_wound(wound_id)
  or public.is_admin()
);
create policy submissions_insert on submissions for insert with check (
  exists (select 1 from wounds w where w.id = wound_id and w.patient_id = auth.uid())
);

-- ---------- assessments ----------
create policy assessments_select on assessments for select using (
  exists (
    select 1 from submissions s join wounds w on w.id = s.wound_id
    where s.id = submission_id and w.patient_id = auth.uid()
  )
  or exists (
    select 1 from submissions s where s.id = submission_id and public.nurse_can_see_wound(s.wound_id)
  )
  or public.is_admin()
);
create policy assessments_insert on assessments for insert with check (
  nurse_id = auth.uid() and public.is_verified_nurse()
);

-- ---------- plans (yara başına) ----------
create policy plans_select on plans for select using (
  patient_id = auth.uid() or public.nurse_can_see_wound(wound_id) or public.is_admin()
);
create policy plans_insert on plans for insert with check (
  proposed_by_nurse_id = auth.uid() and public.is_verified_nurse()
);
-- öneri düzenleme/iptal hemşire+admin; ONAY (proposed→active) ödeme Edge Function'ı
-- (service_role) üzerinden yapılır, RLS'i baypas eder.
create policy plans_update on plans for update using (
  proposed_by_nurse_id = auth.uid() or public.is_admin()
) with check (proposed_by_nurse_id = auth.uid() or public.is_admin());

-- ---------- payments (yazma yalnızca service_role / Edge Function) ----------
create policy payments_select on payments for select using (
  patient_id = auth.uid()
  or exists (select 1 from plans p where p.id = plan_id and p.proposed_by_nurse_id = auth.uid())
  or public.is_admin()
);
-- insert/update policy yok → normal kullanıcı yazamaz (service_role baypas eder).

-- ---------- conversations / messages ----------
-- NOT: plan kapısı (aktif plan olmadan mesaj akışı açılmaz) uygulama + Edge
-- katmanında zorlanır; RLS yalnızca katılımcılığı garanti eder.
create policy conversations_all on conversations for all using (
  patient_id = auth.uid() or nurse_id = auth.uid() or public.is_admin()
) with check (patient_id = auth.uid() or nurse_id = auth.uid() or public.is_admin());

create policy messages_select on messages for select using (
  exists (
    select 1 from conversations c
    where c.id = conversation_id and (c.patient_id = auth.uid() or c.nurse_id = auth.uid())
  ) or public.is_admin()
);
create policy messages_insert on messages for insert with check (
  sender_id = auth.uid() and exists (
    select 1 from conversations c
    where c.id = conversation_id and (c.patient_id = auth.uid() or c.nurse_id = auth.uid())
  )
);

-- ---------- appointments ----------
create policy appointments_all on appointments for all using (
  patient_id = auth.uid() or nurse_id = auth.uid() or public.is_admin()
) with check (patient_id = auth.uid() or nurse_id = auth.uid() or public.is_admin());

-- ---------- reviews (pazarlama: herkes okur) ----------
create policy reviews_select on reviews for select to anon, authenticated using (true);
create policy reviews_insert on reviews for insert with check (patient_id = auth.uid());

-- ---------- care_templates ----------
create policy care_templates_select on care_templates for select using (
  public.is_verified_nurse() or public.is_admin()
);
create policy care_templates_write on care_templates for all using (
  nurse_id = auth.uid() or public.is_admin()
) with check (nurse_id = auth.uid() or public.is_admin());

-- ---------- articles (pazarlama: yayınlananlar herkese açık) ----------
create policy articles_select_public on articles for select to anon, authenticated using (
  published_at is not null or public.is_admin() or author_nurse_id = auth.uid()
);
create policy articles_write on articles for all using (
  public.is_admin() or author_nurse_id = auth.uid()
) with check (public.is_admin() or author_nurse_id = auth.uid());

-- ---------- access_logs ----------
create policy access_logs_insert on access_logs for insert with check (actor_id = auth.uid());
create policy access_logs_select on access_logs for select using (public.is_admin());
