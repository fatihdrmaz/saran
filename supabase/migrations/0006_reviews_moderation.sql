-- =====================================================================
-- Saran — Yorum moderasyonu: admin yorumları güncelleyebilir/silebilir (panel).
-- (articles için yazma yetkisi zaten 0002'de admin/yazar olarak tanımlı.)
-- =====================================================================

create policy reviews_admin_moderate on reviews for all
  using (public.is_admin())
  with check (public.is_admin());
