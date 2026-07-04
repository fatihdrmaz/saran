-- =====================================================================
-- Saran — reviews.display_name: web'de gösterilecek hasta onaylı takma ad.
-- Hasta profilleri (profiles) anon'a kapalı olduğundan yorum sahibinin adı
-- join ile alınamaz; hasta onayıyla kısaltılmış ad burada tutulur ("Meltem K.").
-- =====================================================================

alter table reviews add column if not exists display_name text;
