-- Saran — seed verisi (yalnızca pazarlama içeriği; auth bağımlılığı yok).
-- Hasta/hemşire seed'i auth.users gerektirir → uygulamadan kayıt ile oluşturulur.

insert into articles (category, title, slug, intro, body, reading_minutes, locale, published_at)
values
  ('diabetik-ayak', 'Diyabetik Ayak Bakımı: Evde Dikkat Edilmesi Gerekenler',
   'diyabetik-ayak-bakimi', 'Diyabetik ayak yaralarında erken fark etme ve doğru bakım iyileşmeyi hızlandırır.',
   '## Günlük kontrol\nAyaklarınızı her gün kızarıklık, çatlak ve şişlik için kontrol edin.\n\n> Hemşire notu: Renk değişimi veya kötü koku fark ederseniz beklemeyin.',
   5, 'tr', now()),
  ('basi-yarasi', 'Bası Yarası Önleme Rehberi',
   'basi-yarasi-onleme', 'Hareket kısıtlı hastalarda bası yaraları önlenebilir.',
   '## Pozisyon değişimi\nEn az 2 saatte bir pozisyon değiştirin.\n\n## Cilt bakımı\nCildi kuru ve temiz tutun.',
   4, 'tr', now()),
  ('pansuman', 'Evde Pansuman Nasıl Yapılır?',
   'evde-pansuman', 'Doğru pansuman tekniği enfeksiyon riskini azaltır.',
   '## Temel adımlar\n1. Elleri yıkayın\n2. Eldiven giyin\n3. Eski pansumanı dikkatle çıkarın',
   6, 'tr', now()),
  ('beslenme', 'Yara İyileşmesinde Beslenmenin Rolü',
   'yara-beslenme', 'Protein ve C vitamini yara iyileşmesini destekler.',
   '## Önemli besinler\nProtein, çinko ve C vitamini açısından zengin beslenin.',
   4, 'tr', now())
on conflict (slug, locale) do nothing;
