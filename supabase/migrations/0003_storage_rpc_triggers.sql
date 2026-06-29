-- =====================================================================
-- Saran — Storage (yara fotoğrafları), RPC'ler ve trigger'lar
-- =====================================================================

-- ---------- private bucket: yara fotoğrafları ----------
insert into storage.buckets (id, name, public)
values ('wound-photos', 'wound-photos', false)
on conflict (id) do nothing;

-- yol kuralı: wound-photos/{wound_id}/{dosya}
-- yükleme: yalnızca yaranın sahibi hasta
create policy "wound photo upload (patient owns wound)"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'wound-photos'
    and exists (
      select 1 from public.wounds w
      where w.id = ((storage.foldername(name))[1])::uuid and w.patient_id = auth.uid()
    )
  );

-- indirme/imzalı URL: hasta (sahip) VEYA YALNIZCA ATANMIŞ hemşire.
-- Havuzdaki (atanmamış) hemşire görseli AÇAMAZ → mahremiyet kuralı (README §5).
create policy "wound photo read (owner or assigned nurse)"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'wound-photos'
    and (
      exists (
        select 1 from public.wounds w
        where w.id = ((storage.foldername(name))[1])::uuid and w.patient_id = auth.uid()
      )
      or public.nurse_is_assigned(((storage.foldername(name))[1])::uuid)
      or public.is_admin()
    )
  );

-- ---------- yeni kullanıcı → profil otomatik oluştur ----------
create or replace function public.handle_new_user()
  returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role user_role := coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'patient');
begin
  insert into public.profiles (id, role, full_name, email, phone, kvkk_consent_at)
  values (
    new.id,
    v_role,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'phone',
    case when (new.raw_user_meta_data ->> 'kvkk_consent') = 'true' then now() else null end
  );
  if v_role = 'patient' then
    insert into public.patients (id) values (new.id) on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- havuzdan yara üstlenme (claim) ----------
-- Doğrulanmış hemşire atanmamış bir yarayı atomik olarak üstlenir; sohbet açılır.
create or replace function public.claim_wound(w_id uuid)
  returns public.wounds language plpgsql security definer set search_path = public as $$
declare
  v_wound public.wounds;
  v_patient uuid;
begin
  if not public.is_verified_nurse() then
    raise exception 'Yalnızca doğrulanmış hemşire yara üstlenebilir';
  end if;

  update public.wounds
    set assigned_nurse_id = auth.uid()
  where id = w_id and assigned_nurse_id is null
  returning * into v_wound;

  if v_wound.id is null then
    raise exception 'Yara bulunamadı veya zaten üstlenilmiş';
  end if;

  v_patient := v_wound.patient_id;
  insert into public.conversations (patient_id, nurse_id)
  values (v_patient, auth.uid())
  on conflict (patient_id, nurse_id) do nothing;

  update public.nurses set active_patient_count = active_patient_count + 1
  where id = auth.uid();

  return v_wound;
end;
$$;

-- ---------- mesaj sonrası conversation.last_message_at güncelle ----------
create or replace function public.touch_conversation()
  returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_message_insert on messages;
create trigger on_message_insert
  after insert on messages
  for each row execute function public.touch_conversation();
