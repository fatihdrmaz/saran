-- Saran — ürün seed'i (0009'dan ayrı: yeni enum değeri 'week_2' eklendiği
-- transaction içinde kullanılamaz). Idempotent.

insert into plan_products (code, title, description, duration_days, price_kurus, sort_order)
values
  ('week_1',  'Haftalık Takip',   '7 gün boyunca sınırsız fotoğraf, mesajlaşma ve iyileşme takibi.',  7,  150000, 1),
  ('week_2',  '2 Haftalık Takip', '14 gün boyunca sınırsız fotoğraf, mesajlaşma ve iyileşme takibi.', 14, 300000, 2),
  ('monthly', 'Aylık Takip',      '30 gün boyunca sınırsız fotoğraf, mesajlaşma, randevu ve iyileşme takibi.', 30, 500000, 3)
on conflict (code) do update
  set title = excluded.title,
      description = excluded.description,
      duration_days = excluded.duration_days,
      price_kurus = excluded.price_kurus,
      sort_order = excluded.sort_order,
      active = true;
