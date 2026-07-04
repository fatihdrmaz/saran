-- =====================================================================
-- Saran — Ürün yönetimi: plan fiyatları koddan DB'ye taşınıyor.
-- plan_products: admin panelden yönetilir (tanımla/fiyat değiştir/aktif-pasif).
-- plans.product_id: öneri anında ürün referansı; fiyat yine plans.price_kurus'a
-- SNAPSHOT alınır (sonradan fiyat değişse bile eski planlar etkilenmez).
-- Yeni ürün gamı: Haftalık 1.500₺ · 2 Haftalık 3.000₺ · Aylık 5.000₺.
-- =====================================================================

-- enum'a week_2 ekle (2 haftalık takip; mevcut değerler legacy uyumluluk için kalır)
alter type plan_type add value if not exists 'week_2';

create table if not exists plan_products (
  id            uuid primary key default gen_random_uuid(),
  code          plan_type not null unique,   -- plans.type ile birebir eşleşir
  title         text not null,               -- "Haftalık Takip"
  description   text,
  duration_days int not null,
  price_kurus   bigint not null,
  active        boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table plan_products enable row level security;

-- herkes okur (web fiyat bölümü + mobil paketler anon/hasta erişir)
create policy plan_products_select on plan_products
  for select to anon, authenticated using (true);

-- yalnızca admin yazar
create policy plan_products_admin_write on plan_products
  for all using (public.is_admin()) with check (public.is_admin());

-- plans → ürün referansı (öneri anındaki ürün; fiyat snapshot plans.price_kurus'ta)
alter table plans add column if not exists product_id uuid references plan_products(id);

-- updated_at otomatik
create or replace function public.touch_plan_products()
  returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists trg_plan_products_touch on plan_products;
create trigger trg_plan_products_touch
  before update on plan_products
  for each row execute function public.touch_plan_products();
