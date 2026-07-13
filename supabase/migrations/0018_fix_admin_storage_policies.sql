-- =====================================================================
-- FIX: admin storage yüklemeleri RLS'e takılıyordu ("new row violates RLS").
-- Teşhis: hasta wound-photos INSERT'i (satır-içi EXISTS) çalışırken,
-- is_admin() fonksiyonuna dayanan article-images/case-images INSERT'leri
-- storage bağlamında reddediliyor. Politikalar satır-içi EXISTS'e çevrildi
-- ve API üzerinden okuma için authenticated SELECT politikaları eklendi.
-- =====================================================================

-- ---------- case-images ----------
drop policy if exists "case images admin insert" on storage.objects;
drop policy if exists "case images admin update" on storage.objects;
drop policy if exists "case images admin delete" on storage.objects;

create policy "case images admin insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'case-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "case images admin update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'case-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "case images admin delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'case-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "case images authenticated read"
  on storage.objects for select to authenticated
  using (bucket_id = 'case-images');

-- ---------- article-images (aynı sorun) ----------
drop policy if exists "article images admin write" on storage.objects;
drop policy if exists "article images admin update" on storage.objects;

create policy "article images admin write"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'article-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "article images admin update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'article-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "article images authenticated read"
  on storage.objects for select to authenticated
  using (bucket_id = 'article-images');
