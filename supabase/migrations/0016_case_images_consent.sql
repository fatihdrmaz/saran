-- =====================================================================
-- Yara Takibi — Vaka (önce/sonra) görselleri + yayın rızası.
-- Pazarlama sitesindeki iyileşme hikâyelerinde gerçek hasta fotoğrafı
-- YALNIZCA yazılı rıza alınmışsa (consent_confirmed) ve blur-reveal ile gösterilir.
-- Görseller ayrı public 'case-images' bucket'ında (private wound-photos ile karışmaz).
-- =====================================================================

-- Rıza teyidi — yalnızca true olan yorumlarda önce/sonra görseli gösterilir.
alter table reviews add column if not exists consent_confirmed boolean not null default false;

-- Küratörlü pazarlama vakaları bir app hastasına bağlı olmayabilir → patient_id opsiyonel.
alter table reviews alter column patient_id drop not null;

-- Public bucket (SEO/paylaşım için doğrudan erişilebilir görsel).
insert into storage.buckets (id, name, public)
values ('case-images', 'case-images', true)
on conflict (id) do nothing;

-- Yalnızca admin yükler/günceller/siler; herkes okur (public bucket).
create policy "case images admin insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'case-images' and public.is_admin());
create policy "case images admin update"
  on storage.objects for update to authenticated
  using (bucket_id = 'case-images' and public.is_admin());
create policy "case images admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'case-images' and public.is_admin());
