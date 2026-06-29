-- Saran — blog makaleleri seed'i (migration olarak; DB sahibi çalıştırır, RLS baypas).
-- Pazarlama sitesi blog'unun gerçek veriyle çalışması için. Idempotent.

insert into articles (category, title, slug, intro, body, reading_minutes, locale, published_at)
values
  ('diyabetik-ayak', 'Diyabetik Ayak Bakımı: Evde Dikkat Edilmesi Gerekenler',
   'diyabetik-ayak-bakimi', 'Diyabetik ayak yaralarında erken fark etme ve doğru bakım iyileşmeyi hızlandırır.',
   E'## Günlük kontrol\nAyaklarınızı her gün kızarıklık, çatlak ve şişlik için kontrol edin.\n\n## Cilt bakımı\nAyakları ılık suyla yıkayın, parmak aralarını iyice kurulayın.\n\n> Hemşire notu: Renk değişimi veya kötü koku fark ederseniz beklemeyin, hemşirenize danışın.',
   5, 'tr', now()),
  ('basi-yarasi', 'Bası Yarası Önleme Rehberi',
   'basi-yarasi-onleme', 'Hareket kısıtlı hastalarda bası yaraları doğru bakımla önlenebilir.',
   E'## Pozisyon değişimi\nEn az 2 saatte bir pozisyon değiştirin.\n\n## Cilt bakımı\nCildi kuru ve temiz tutun; nemli ortam yara riskini artırır.\n\n> Hemşire notu: Kemik çıkıntılarının üzerindeki kızarıklıkları yakından izleyin.',
   4, 'tr', now()),
  ('pansuman', 'Evde Pansuman Nasıl Yapılır?',
   'evde-pansuman', 'Doğru pansuman tekniği enfeksiyon riskini azaltır ve iyileşmeyi destekler.',
   E'## Temel adımlar\n1. Elleri yıkayın\n2. Eldiven giyin\n3. Eski pansumanı dikkatle çıkarın\n4. Yarayı uygun solüsyonla temizleyin\n5. Yeni pansumanı kapatın\n\n> Hemşire notu: Pansuman ıslandığında veya kirlendiğinde değiştirin.',
   6, 'tr', now()),
  ('beslenme', 'Yara İyileşmesinde Beslenmenin Rolü',
   'yara-beslenme', 'Protein, çinko ve C vitamini yara iyileşmesini doğrudan destekler.',
   E'## Önemli besinler\nProtein, çinko ve C vitamini açısından zengin beslenin.\n\n## Sıvı alımı\nYeterli su tüketimi doku onarımı için gereklidir.\n\n> Hemşire notu: Kronik yarası olan hastalarda beslenme planı için diyetisyene danışılması faydalıdır.',
   4, 'tr', now())
on conflict (slug, locale) do nothing;
