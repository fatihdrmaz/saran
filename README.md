# Saran — Uzaktan Yara Bakım Takip Platformu

Monorepo: tek ortak backend (Supabase) + 3 ön yüz (hasta mobil, pazarlama web, hemşire/admin panel).

> Ürün spesifikasyonu ve tasarım referansları: [`design_handoff_saran/README.md`](./design_handoff_saran/README.md)

## Yapı

```
saran/
├── apps/
│   ├── mobile/      # Expo (React Native) — hasta uygulaması
│   ├── web/         # Next.js — pazarlama sitesi + blog (SEO)
│   └── panel/       # Next.js — hemşire & admin paneli
├── packages/
│   ├── tokens/      # tasarım token'ları (renk/tipografi/spacing) — tek kaynak
│   ├── shared/      # ortak tipler, enum'lar, zod şemaları, iş kuralları
│   └── supabase/    # Supabase client + üretilen DB tipleri
└── supabase/        # migration'lar, RLS politikaları, edge function'lar
```

## Mimari kararlar

| Konu | Karar |
|---|---|
| Backend | Supabase (Postgres + Auth + Storage + Realtime + Edge Functions) — ayrı backend yok |
| Hosting | web + panel → Vercel; mobil → EAS |
| Veri ikametgâhı | Supabase **AB (Frankfurt)** bölgesi (KVKK) |
| Plan kapsamı | **Yara başına** plan (her yara ayrı akış + ödeme) |
| Abonelik | **Manuel yenileme** (kart token'ı saklanmaz) |
| Hemşire atama | **Havuz modeli** (müsait hemşire üstlenir, sonra RLS o hemşireye kilitlenir) |
| Para | TRY, **kuruş cinsinden integer** |
| Silme | soft-delete (`deleted_at`) + `access_logs` (KVKK) |

## Başlangıç

```bash
pnpm install

# Supabase'i yerelde başlat (Docker gerekli)
pnpm dlx supabase start
pnpm dlx supabase db reset      # migration'ları uygula

# Geliştirme
pnpm mobile   # Expo
pnpm web      # pazarlama sitesi
pnpm panel    # hemşire/admin panel
```

Ortam değişkenleri için `.env.example` dosyasını `.env` olarak kopyala ve `supabase start` çıktısındaki anahtarlarla doldur.
