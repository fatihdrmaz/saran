-- =====================================================================
-- Yara Takibi — Mesajları YARAYA bağla ("yara dosyası" modeli).
-- Önceden sohbet hasta↔hemşire genelindeydi (tek thread). Artık her YARA
-- kendi sohbetini taşır → 3 yarası olan hastada mesajlar karışmaz.
-- =====================================================================

-- conversations.wound_id
alter table conversations add column if not exists wound_id uuid references wounds(id) on delete cascade;

-- Eski (patient_id, nurse_id) tekilliğini kaldır — aynı çift artık yara başına
-- birden çok sohbete sahip olabilir.
alter table conversations drop constraint if exists conversations_patient_id_nurse_id_key;

-- Backfill: wound_id boş sohbetleri, o hasta+hemşireye ait EN ESKİ yaraya bağla
-- (demo verisi küçük; çoğu hastada tek yara). Çakışırsa en eski kazanır.
update conversations c
set wound_id = sub.wid
from (
  select distinct on (w.patient_id, w.assigned_nurse_id)
         w.patient_id, w.assigned_nurse_id, w.id as wid
  from wounds w
  where w.assigned_nurse_id is not null
  order by w.patient_id, w.assigned_nurse_id, w.created_at asc
) sub
where c.wound_id is null
  and c.patient_id = sub.patient_id
  and c.nurse_id = sub.assigned_nurse_id;

-- Bağlanamayan (yarasız/atanmamış) eski sohbetleri temizle — yaraya ait olmayan
-- sohbet artık kavramsal olarak yok.
delete from conversations where wound_id is null;

-- Yara başına en fazla bir sohbet (NULL wound_id kalmadığı için güvenli).
create unique index if not exists conversations_wound_unique on conversations(wound_id);

-- claim_wound: sohbeti YARAYA bağlı oluştur.
create or replace function public.claim_wound(w_id uuid)
  returns public.wounds language plpgsql security definer set search_path = public as $$
declare
  v_wound public.wounds;
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

  insert into public.conversations (patient_id, nurse_id, wound_id)
  values (v_wound.patient_id, auth.uid(), w_id)
  on conflict (wound_id) do nothing;

  update public.nurses set active_patient_count = active_patient_count + 1
  where id = auth.uid();

  return v_wound;
end;
$$;

-- Hasta/hemşire, atanmış bir yara için sohbeti (yoksa) açıp id'sini alsın.
-- Yaranın sahibi hasta VEYA atanmış hemşiresi çağırabilir.
create or replace function public.get_or_create_wound_conversation(w_id uuid)
  returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_wound public.wounds;
  v_conv uuid;
begin
  select * into v_wound from public.wounds where id = w_id;
  if v_wound.id is null then
    raise exception 'Yara bulunamadı';
  end if;
  if auth.uid() <> v_wound.patient_id and auth.uid() <> coalesce(v_wound.assigned_nurse_id, '00000000-0000-0000-0000-000000000000'::uuid) then
    raise exception 'Bu yara için mesajlaşma yetkiniz yok';
  end if;
  if v_wound.assigned_nurse_id is null then
    raise exception 'Yaraya henüz hemşire atanmadı';
  end if;

  select id into v_conv from public.conversations where wound_id = w_id;
  if v_conv is null then
    insert into public.conversations (patient_id, nurse_id, wound_id)
    values (v_wound.patient_id, v_wound.assigned_nurse_id, w_id)
    returning id into v_conv;
  end if;
  return v_conv;
end;
$$;
