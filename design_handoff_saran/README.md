# Teslim Paketi: Saran — Uzaktan Yara Bakım Takip Platformu

> Bu doküman, prototipleri görmemiş bir geliştiricinin (Claude Code) ürünü sıfırdan
> gerçek bir kod tabanında inşa edebilmesi için tek başına yeterli olacak şekilde yazılmıştır.

---

## 1. Genel Bakış

**Saran**, bir yara bakım hemşiresinin hastalara **uzaktan** hizmet vermesini sağlayan bir platformdur. Temel döngü:

1. Hasta yarasının **fotoğrafını gönderir** (ilk değerlendirme **ücretsiz**).
2. Hemşire fotoğrafı değerlendirir, bir **öngörü** (evre + tahmini iyileşme süresi) yapar ve hastaya **bir bakım planı önerir** (1 haftalık / 3 haftalık / aylık).
3. Hasta planı **onaylayıp öderse**, **takip akışı açılır**: sınırsız fotoğraf gönderimi, mesajlaşma, randevu, iyileşme zaman çizelgesi.
4. Onaylanmazsa **hiçbir ücret alınmaz ve takip başlamaz.**

İş modeli: ücretsiz ilk değerlendirme → plana dönüşüm → tek seferlik veya aylık abonelik geliri.

---

## 2. Tasarım Dosyaları Hakkında — ÖNEMLİ

`prototypes/` klasöründeki dosyalar **HTML ile üretilmiş tasarım referanslarıdır** — ürünün görünüşünü ve davranışını gösteren prototiplerdir, **doğrudan kopyalanacak üretim kodu değildir.**

Görev: bu HTML tasarımlarını **hedef kod tabanının kendi ortamında yeniden oluşturmaktır.** Henüz bir ortam yoksa, proje için en uygun teknolojiyi seçip tasarımları orada uygulayın. Önerilen mimari için Bölüm 4'e bakın.

Dosyalar `.dc.html` uzantılıdır ("Design Component"). Tarayıcıda doğrudan açılırlar. İçlerindeki mantık `<script data-dc-script>` bloğunda `class Component` olarak, arayüz ise çoğunlukla `React.createElement(...)` çağrılarıyla yazılmıştır. **Bunları olduğu gibi kullanmayın** — yapıyı, akışı ve stilleri referans alıp hedef framework'te yeniden yazın.

---

## 3. Fidelity (Doğruluk Düzeyi)

**Yüksek doğruluk (hi-fi).** Renkler, tipografi, boşluklar ve etkileşimler nihai haline yakındır. Geliştirici arayüzü kod tabanının kendi kütüphaneleriyle **piksel düzeyinde sadık** şekilde yeniden oluşturmalıdır. Yalnızca placeholder olan tek şey **gerçek fotoğraflardır** (hemşire/hasta portreleri ve yara görselleri) — bunlar bilinçli olarak bulanık/gri bloklarla temsil edilmiştir.

---

## 4. Önerilen Mimari

Tek bir ortak **backend** + üç ayrı **ön yüz**:

- **Backend / API + Veritabanı** — tüm veri ve iş mantığı burada (Bölüm 8 veri modeli). Öneri: Node.js (NestJS/Express) veya Django; PostgreSQL. Dosya/görsel depolama için şifreli object storage (S3 uyumlu). Kimlik doğrulama: JWT + rol (hasta / hemşire / admin).
- **Hasta Mobil Uygulaması** — `Saran Mobil Prototip` dosyasına karşılık gelir. Öneri: React Native veya Flutter.
- **Pazarlama Web Sitesi + Blog** — `Saran Web Prototip` dosyasına karşılık gelir. SEO kritik → SSR/SSG (Next.js öneri).
- **Hemşire & Admin Paneli** — `Saran Hemsire Panel Prototip` dosyasına karşılık gelir. Web (React + responsive masaüstü düzen).

> `Saran.dc.html` (tasarım tuvali) tüm ekranların statik referans galerisidir; üç prototip ise bunların tıklanabilir, akışlı halidir.

---

## 5. Marka & Tasarım Token'ları

### Renkler
| Rol | Hex |
|---|---|
| Ana yeşil (primary, koyu) | `#0E7A63` |
| En koyu yeşil (arka plan, panel sidebar) | `#0E3B31` |
| Orta yeşil (panel vurgu / aktif) | `#1FA37A` |
| Açık teal (koyu zeminde metin) | `#7FD8C4` |
| Açık yeşil yüzey (rozet/şerit zemini) | `#E3F0EB` / `#E8F6EE` |
| Krem ana arka plan | `#F5F1E9` |
| İkincil yüzey (kart içi) | `#F8F6F0` / `#F2EFE6` |
| Kart kenarlığı | `#ECE7DB` |
| Koyu metin (başlık) | `#18302A` |
| Orta metin (gövde) | `#33423D` / `#4A5C56` |
| Soluk metin (ikincil) | `#5E726B` / `#9AA8A2` |
| Sıcak vurgu (turuncu — "popüler", uyarı) | `#D98456` |
| Uyarı turuncusu (onay bekliyor) | `#C07A2E` / `#FDEBD8` (zemin) |
| Acil / hata kırmızısı | `#C2553B` / `#D9534F`; zemin `#FBE3E2` / `#FBF1EE` |
| Yıldız / puan sarısı | `#E0A33B`; rozet zemini `#FBF1DD`, metin `#B07D1E` |
| Başarı yeşili rozet | metin `#1FA37A`, zemin `#E3F4EC` |

### Tipografi
- **Başlık / serif vurgu**: `Newsreader` (Google Fonts), genelde `font-weight:500`, sıklıkla `font-style:italic` ile vurgu. Hero başlıkları, bölüm başlıkları, alıntılar.
- **Gövde / arayüz**: `Plus Jakarta Sans` (Google Fonts), ağırlıklar 400–800.
- Mobil ölçek: gövde 13–15px, başlık 20–24px, hero 26–32px.
- Web ölçek: gövde 14–18px, bölüm başlığı 34–38px, hero 52–58px.
- Panel ölçek: gövde 13–14px, başlık 18–22px, istatistik rakamı 24–30px.

### Şekil & Gölge
- Köşe yarıçapı: küçük öğeler 10–14px, kartlar 16–22px, mobil cihaz çerçevesi 42–46px, rozet/pill `999px`.
- Kart gölgesi (hafif): `0 1px 3px rgba(0,0,0,.08)`.
- Yükseltilmiş gölge: `0 24px 50px -28px rgba(14,122,99,.4)` (yeşil tonlu) veya `0 30px 80px -24px rgba(0,0,0,.5)` (tarayıcı/cihaz çerçevesi).
- Boşluk ölçeği: 4 / 8 / 10 / 12 / 14 / 16 / 18 / 22 / 28 / 44px yaygın kullanılır.

### Mahremiyet kuralı (kritik)
Yara fotoğrafları **her zaman bulanık** gösterilir ve "🔒" rozeti taşır; yalnızca atanmış hemşire "Netleştir" ile açabilir. Yorumlardaki önce/sonra görselleri hasta onaylıdır. Bu, tasarımın her yerinde uygulanmış bir ilkedir — üründe de korunmalıdır.

---

## 6. Ekranlar

### 6A. Hasta Mobil Uygulaması (`Saran Mobil Prototip`)
Cihaz çerçevesi 390px genişlik. Alt sekme çubuğu: **Ana Sayfa / Takip / Mesaj / Profil**. Ekranlar:

1. **Onboarding 1-2-3** — koyu yeşil karşılama, 3 slayt (değer önerisi), "Hemen başla" / "Atla".
2. **Kayıt** — Ad Soyad, Telefon (+90), E-posta, Şifre, KVKK onay kutusu, Apple/Google ile giriş.
3. **Boş Ana Sayfa** (plan başlatmamış kullanıcı) — hero ("Yaranız iyileşene kadar yanınızdayız") + güven çubuğu (4,9★ · %91 planını tamamladı · 1.200+ iyileşen yara) + "Nasıl çalışır" 3 adım + iyileşme hikâyeleri (önce/sonra görselli) + alt CTA. **Ücretsiz değerlendirme başlat** birincil aksiyon.
4. **Ücretsiz Değerlendirme** (Adım 1/2) — "İlk değerlendirme ücretsiz" şeridi, fotoğraf yükleme (Kamera/Galeri), yara tipi seçimi (Bası / Diyabetik ayak / Cerrahi / Venöz). "Hemşireye gönder".
5. **Bekleme** — "Fotoğrafınız iletildi" + durum zaman çizelgesi (Gönderildi ✓ → Hemşire değerlendiriyor → Bakım planı önerisi bekleniyor) + hemşire kartı (çevrimiçi).
6. **Plan Önerisi** ⭐ — hemşirenin değerlendirme özeti + öngörü (evre, tahmini süre) + **önerilen plan kartı** (koyu yeşil, fiyat, özellikler) + **"Planı onayla & başla"** + "Tek seferlik al" alternatifi + "Onaylamazsanız ücret alınmaz" notu.
7. **Ödeme** — sipariş özeti, kart bilgileri, 3D Secure / iyzico notu, güvenli öde.
8. **Plan Aktif** — koyu yeşil başarı ekranı, "Aylık Takip aktif!", ilk kontrol kartı, "Uygulamaya gir".
9. **Ana Sayfa (aktif)** — hemşire kartı (çevrimiçi), takip edilen yara kartı (iyileşme %68 çubuğu), hızlı aksiyonlar (Yeni fotoğraf / Randevu), Plan & Yorumlar kısayolları, bildirim zili.
10. **Yara Detayı** — önce/sonra karşılaştırma görseli + iyileşme zaman çizelgesi (14./7./1. gün, her birinde küçük görsel) + "Yeni fotoğraf ekle".
11. **Fotoğraf Gönder** — yükleme alanı, ağrı seviyesi (Yok/Hafif/Orta/Şiddetli), not alanı, mahremiyet şeridi.
12. **Yara Arşivi** — toplam iyileşme + çizgi grafik + tüm fotoğrafların ızgarası (tarih + %).
13. **Mesajlaşma** — hemşire ile sohbet, fotoğraf baloncuğu, hızlı yanıt çipleri.
14. **Randevu** — Görüntülü/Sesli seçimi, tarih şeridi, uygun saat ızgarası, onayla.
15. **Paketler** — Aylık/Tek seferlik geçişi, öne çıkan plan + alternatif.
16. **Yorumlar** — puan özeti (4,9 + dağılım) + önce/sonra görselli yorumlar.
17. **Bildirimler** — plan önerisi geldi / mesaj / ödeme onayı (tıklanınca ilgili ekrana).
18. **Hemşire Profili** — portre, istatistik (12 yıl, 1.200+ hasta, 4,9★), hakkında, sertifikalar.
19. **Profil** — kullanıcı kartı, istatistikler, menü (Kişisel bilgiler / Yaralarım / Ödeme & abonelik / Bildirimler / Hemşirem), Acil yardım.
20. **Fatura/Makbuz** — ödeme başarılı kartı, makbuz detayı, KDV, PDF indir / e-posta.
21. **Acil Uyarı** — kırmızı temalı; tespit edilen risk işaretleri, "112'yi ara" + "Hemşireme acil bildir" + yasal uyarı ("acil tıbbi yardımın yerini tutmaz").

### 6B. Pazarlama Web Sitesi (`Saran Web Prototip`)
Üst menü sabit (Nasıl çalışır / Paketler / Blog / S.S.S. + dil seçici TR/EN/AR + Ücretsiz değerlendirme). Sayfalar:

1. **Ana Sayfa** — hero, "Nasıl çalışır" (3 adım), ücret mantığı ("Önce görün, sonra karar verin" — ücretsiz değerlendirme → hemşire önerir → onaylarsanız başlar), önce/sonra, paketler (Tek/Aylık/Aile), iyileşme hikâyeleri + güven çubuğu, "Kimler için" (Bası / Diyabetik ayak / Cerrahi / Yanık), hemşire tanıtımı, S.S.S., footer (yasal + keşfet linkleri).
2. **Blog Listesi** — kategori çipleri, öne çıkan makale (büyük kart), 3'lü makale ızgarası.
3. **Blog Makaleleri** (4 adet, hepsi tam içerikli): Diyabetik ayak bakımı / Bası yarası önleme / Evde pansuman / Yara beslenmesi. Her biri: kategori, başlık, intro, yazar (hemşire), H2 bölümler, "Hemşire notu" kutusu, alt CTA.
4. **Ücretsiz Değerlendirme** — fotoğraf yükleme + yara tipi, "Hemşireye gönder".
5. **Gönderildi** — onay ekranı.
6. **KVKK & Gizlilik** ve **Kullanım Koşulları** — footer'dan erişilen, tam metinli yasal sayfalar.

### 6C. Hemşire & Admin Paneli (`Saran Hemsire Panel Prototip`)
Sol sidebar (koyu yeşil): **Bugün / Hastalar / Gelen kutusu / Randevular / Şablonlar / Kazanç** + **YÖNETİM: Ekip · Hemşireler**. Ekranlar:

1. **Bugün (Dashboard)** — selamlama, üstte "X planı onayladı — takip başladı ✓" bildirim şeridi, istatistik kartları (bekleyen değerlendirme / randevu / aktif hasta / ort. yanıt), bekleyen değerlendirme kuyruğu (öncelik renkleriyle), günün randevuları, haftalık özet.
2. **Hastalar** — filtre çipleri, tablo: Hasta / Yara tipi / **Takip durumu** (Aktif takip ✓ / Onay bekliyor / Değerlendirme) / İyileşme (onaysızsa "— başlamadı", soluk) / Son güncelleme. Satıra tıklanınca: onaylıysa **Aktif hasta** ekranı, değilse **Hasta değerlendirme** ekranı.
3. **Hasta Değerlendirme (onaysız)** — gönderilen fotoğraf + hasta notu, değerlendirme formu (yara durumu, tahmini iyileşme, öngörü notu), **hastaya önerilecek plan seçimi** (1 hafta / 3 hafta / aylık), "Planı hastaya gönder". Not: hasta onaylamadan akış açılmaz.
4. **Plan Gönderildi** — onay ekranı + "Durum: Onay bekliyor" uyarısı.
5. **Aktif Hasta (onaylı)** ⭐ — üstte "Aktif takip ✓" rozeti. Sol kolon: plan onay kartı (X/30 gün ilerleme) + iyileşme grafiği + önce/sonra. Sağ kolon **4 sekme**:
   - **Akış** — kronolojik zaman çizelgesi (mesaj + görsel + değerlendirme karışık, yeniden eskiye).
   - **Tüm fotoğraflar** — görsel galerisi (tarih + iyileşme %).
   - **Mesajlar** — tüm yazışma geçmişi.
   - **Ödemeler** — bu hastanın ödeme geçmişi, toplam ödenen, sonraki yenileme.
6. **Gelen Kutusu** — sol konuşma listesi (okunmamış rozetli) + açık sohbet (fotoğraf + mesaj) + "Hastaya git".
7. **Randevular** — hafta şeridi, günün ajandası (zaman çizelgesi), randevu talepleri (Onayla/Ertele).
8. **Şablonlar** — hazır bakım talimatı kartları (Bası / Diyabetik ayak / Cerrahi / Acil yönlendirme / Yanık) + "Yeni şablon".
9. **Kazanç** — özet kartları (bu ay / bekleyen tahsilat / yıl toplamı / ort. plan değeri), aylık gelir bar grafiği, sonraki ödeme aktarımı (brüt − %10 komisyon = net), son ödemeler tablosu (durum: Ödendi / Bekliyor / Onay bekliyor).
10. **Ekip · Hemşireler (admin)** — hemşire tablosu (uzmanlık / durum: Onaylı veya Doğrulama bekliyor / aktif hasta / puan), "+ Yeni hemşire ekle".
11. **Yeni Hemşire Ekle (admin)** — 3 adımlı form: kişisel bilgiler, mesleki bilgiler (uzmanlık, deneyim, diploma no), belge yükleme (diploma / sertifika / kimlik), KVKK onayı, "Doğrulamaya gönder".
12. **Hemşire Eklendi** — doğrulama bekliyor durum ekranı (Belgeler alındı → İnceleniyor → Onay & aktivasyon). Onaylanmadan hastalara atanamaz.

---

## 7. Etkileşim & Davranış Kuralları

- **Plan onayı kapısı (en kritik iş kuralı):** Hasta bir planı onaylayıp ödeme yapmadan **mesajlaşma ve fotoğraf gönderme akışı açılmaz**; panelde hasta "Onay bekliyor" durumunda kalır ve iyileşme takibi başlamaz. Onay + ödeme sonrası akış otomatik açılır ve hemşireye bildirim gider.
- **Ücretsiz ilk değerlendirme:** Kayıt ve ilk fotoğraf gönderimi ücretsizdir; ödeme yalnızca plan onayında alınır.
- **Acil tespiti:** Belirli risk işaretlerinde (artan kızarıklık, ateş, kötü koku, şiddetli ağrı) hastaya Acil Uyarı ekranı gösterilir ve sağlık kuruluşuna/112'ye yönlendirilir. Ürün hiçbir zaman acil tıbbi yardımın yerini tuttuğunu iddia etmez (yasal uyarı her ilgili ekranda).
- **Navigasyon:** Mobilde alt sekme + ekran içi butonlar; web'de sabit üst menü (bölümlere kaydırma) + footer linkleri; panelde sol sidebar.
- **Durum rozetleri** her yerde tutarlı: Aktif takip ✓ (yeşil) / Onay bekliyor (turuncu) / Değerlendirme (sarı) / Acil (kırmızı).
- **Geçişler:** ekranlar arası hafif fade/slide (~0.25–0.3s). Animasyonlar dekoratif; iş mantığını etkilemez.

---

## 8. Veri Modeli (önerilen)

- **User** — id, rol (`patient` | `nurse` | `admin`), ad, telefon, e-posta, dil, kvkkOnay, oluşturulma.
- **Patient** (User'a 1-1) — yaş, tanılar[], alerjiler[], acil kişi.
- **Nurse** (User'a 1-1) — uzmanlık, deneyimYıl, diplomaNo, belgeler[] (tür, url, doğrulamaDurumu), durum (`pending` | `verified`), puan, aktifHastaSayısı.
- **Wound** — id, patientId, tip (bası/diyabetik/cerrahi/venöz/yanık), bölge, başlangıçTarihi, durum (iyileşiyor/izlem/...), iyileşmeYüzdesi.
- **Submission** (fotoğraf gönderimi) — id, woundId, görselUrl (şifreli), hastaNotu, ağrıSeviyesi, akıntı, tarih, hemşireDeğerlendirmesi (durum, dokuTipi, iyileşme%, bakımTalimatı, pansumanÖnerisi).
- **Plan** — id, woundId/patientId, tür (1hafta/3hafta/aylık/aile), fiyat, durum (`proposed` | `approved` | `active` | `cancelled`), öngörüNotu, başlangıç, bitiş, ilerlemeGünü.
- **Message** — id, conversationId, gönderen (patient/nurse), tip (metin/görsel), içerik, tarih, okundu.
- **Appointment** — id, patientId, nurseId, tür (görüntülü/sesli), tarih, süre, durum (talep/onaylı/tamamlandı).
- **Payment** — id, patientId, planId, tutar, durum (`paid` | `pending` | `awaiting_approval`), tarih, makbuzNo, KDV.
- **Review** — id, patientId, puan, metin, önceGörsel, sonraGörsel (onaylı), yaraTipi, süre.
- **CareTemplate** — id, nurseId, kategori, başlık, içerik, kullanımSayısı.
- **Article** (blog) — id, kategori, başlık, slug, intro, gövde[], yazar, okumaSüresi.

---

## 9. Tasarım Dosyaları (referans)

`prototypes/` klasöründe:
- `Saran.dc.html` — tüm ekranların statik tasarım tuvali (genel referans galerisi).
- `Saran Mobil Prototip.dc.html` — hasta mobil uygulaması, tıklanabilir.
- `Saran Web Prototip.dc.html` — pazarlama sitesi + blog, tıklanabilir.
- `Saran Hemsire Panel Prototip.dc.html` — hemşire & admin paneli, tıklanabilir.
- `image-slot.js`, `support.js` — prototip çalışma zamanı yardımcıları (üretimde gerekmez).

Tarayıcıda açıp gezerek tüm akışları görebilirsiniz. Renk/ölçü/metin değerleri için doğrudan dosya içindeki inline stilleri inceleyin.

---

## 10. Önerilen MVP Önceliklendirmesi

**MVP (ilk sürüm):** Kayıt/giriş · ücretsiz değerlendirme (fotoğraf + yara tipi) · hemşire değerlendirme + plan önerme · plan onayı + ödeme · onaylı takip akışı (fotoğraf + mesaj + iyileşme) · hemşire paneli (Bugün, Hastalar, Aktif hasta, Gelen kutusu) · acil uyarı · temel KVKK/Koşullar.

**Sonraki sürüm:** Randevu/görüntülü görüşme · paketler/abonelik yönetimi · Kazanç paneli · blog/SEO · şablonlar · admin ekip yönetimi + hemşire doğrulama · çok dillilik (EN/AR).

---

## 11. Yasal & Uyumluluk Notları (geliştiriciye hatırlatma)

Bu bir **sağlık** ürünüdür. Üretim öncesi gerekenler (kod dışı, ama mimariyi etkiler):
- KVKK uyumu — sağlık verisi özel nitelikli; şifreli saklama, erişim logu, silme hakkı.
- Görsellerin uçtan uca şifrelenmesi; yalnızca atanmış hemşire erişimi.
- Ödeme: iyzico/PayTR + e-arşiv fatura entegrasyonu.
- Uzaktan sağlık hizmeti mevzuatına uygun konumlandırma (danışmanlık/takip; tanı/tedavi sınırları).
