-- =====================================================================
-- Saran — Blog: tam makale içerikleri + kapak görseli desteği.
-- articles.image_url + herkese açık 'article-images' bucket'ı (yalnızca
-- admin yükler, herkes okur). İçerik gövdesi hafif markdown:
--   "## " bölüm başlığı · "- " madde · "1. " numaralı adım · "> " hemşire notu
-- =====================================================================

alter table articles add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do nothing;

create policy "article images admin write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'article-images' and public.is_admin());

create policy "article images admin update"
  on storage.objects for update to authenticated
  using (bucket_id = 'article-images' and public.is_admin());

-- ---------- Makale 1: Diyabetik Ayak Bakımı ----------
update articles set
  intro = 'Diyabet, ayaklardaki his kaybı ve dolaşım bozukluğu nedeniyle küçük bir çatlağı bile ciddi bir yaraya dönüştürebilir. Doğru günlük bakım alışkanlıklarıyla diyabetik ayak yaralarının büyük bölümü önlenebilir.',
  reading_minutes = 8,
  body = $md$Diyabetli bireylerde ayak sağlığı, genel sağlığın en kritik göstergelerinden biridir. Yüksek kan şekeri zamanla sinirleri (nöropati) ve küçük damarları etkiler; bu da ayaklarda his azalması, kuruma ve yaraların geç fark edilmesi anlamına gelir. Fark edilmeyen küçük bir su toplaması bile uygun bakım yapılmazsa haftalar içinde derin bir ülsere dönüşebilir.

## Neden bu kadar önemli?

Diyabetik ayak ülserleri, diyabetin en sık hastane yatışı gerektiren komplikasyonlarından biridir. Ancak araştırmalar, düzenli ayak kontrolü ve doğru bakım alışkanlıklarıyla bu yaraların önemli bir bölümünün önlenebileceğini gösteriyor. Önlemenin maliyeti, tedaviden her zaman çok daha düşüktür — hem maddi hem manevi olarak.

## Günlük ayak kontrolü nasıl yapılır?

Günde bir kez, tercihen akşam duştan sonra ayaklarınızı sistematik olarak kontrol edin:

- Ayak tabanı, topuk ve parmak aralarını iyi ışıkta inceleyin; gerekirse ayna kullanın veya bir yakınınızdan yardım isteyin.
- Kızarıklık, su toplaması, çatlak, nasır, renk değişimi ve şişlik arayın.
- Ayağınızın el ile ısısını karşılaştırın: bir bölge diğerinden belirgin sıcaksa not edin.
- His kaybı olan bölgelerde ağrı olmayabilir — "ağrımıyorsa sorun yoktur" varsayımı diyabette geçerli değildir.

> Hemşire notu: Telefonunuzla haftada bir ayak fotoğrafı çekmek, gözle fark edilmeyen yavaş değişimleri yakalamanın en pratik yoludur. Şüpheli bir değişiklik görürseniz fotoğrafı hemşirenizle paylaşın.

## Yıkama, kurulama ve nemlendirme

1. Ayaklarınızı her gün ılık (sıcak değil!) su ve yumuşak sabunla yıkayın. Suyu dirseğinizle test edin; nöropati varsa ayağınız sıcaklığı doğru hissetmeyebilir.
2. Yumuşak bir havluyla bastırmadan kurulayın. Parmak aralarını mutlaka kuru bırakın — nemli parmak arası mantar ve maserasyon riskini artırır.
3. Tabana ve topuklara üre içeren nemlendirici sürün; parmak aralarına sürmeyin.
4. Ayak banyosunu 5 dakikadan uzun tutmayın; uzun ıslak kalma cildi yumuşatıp yaralanmaya açık hâle getirir.

## Ayakkabı ve çorap seçimi

- Ayakkabıyı öğleden sonra deneyin; ayaklar gün içinde hafif şişer.
- Burnu dar, topuğu yüksek ve içi dikişli modellerden kaçının.
- Yeni ayakkabıyı ilk günler 1-2 saatten uzun giymeyin.
- Dikişsiz, pamuklu, açık renk çorap tercih edin — açık renk, fark edilmeyen bir akıntının çorapta iz bırakmasıyla erken uyarı sağlar.
- Asla çıplak ayakla dolaşmayın; ev içinde bile terlik kullanın.

## Tırnak bakımı

Tırnakları düz kesin, köşelerini yuvarlamayın; batık riskini artırır. Görme sorununuz varsa veya tırnaklarınız kalınlaştıysa kesme işlemini kendiniz yapmayın, profesyonel destek alın. Nasırları asla kesmeyin, nasır bandı kullanmayın — bu ürünler diyabette ciddi doku hasarına yol açabilir.

## Ne zaman profesyonel destek almalısınız?

- 24-48 saat içinde iyileşmeyen kızarıklık veya su toplaması
- Ayakta yeni ortaya çıkan şekil değişikliği veya ısı artışı
- Akıntı, kötü koku veya siyahlaşan doku
- Ateş ile birlikte ayakta herhangi bir yara

Bu belirtilerden herhangi biri varsa beklemeyin. Erken müdahale, diyabetik ayakta sonucu belirleyen en önemli faktördür.

> Hemşire notu: Diyabetik ayak yarası "kendi kendine iyileşir" diye beklenerek en değerli haftalar kaybedilir. İlk 48 saatte yapılan doğru değerlendirme, aylarca sürecek bir tedaviyi önleyebilir.

Bu içerik genel bilgilendirme amaçlıdır; kişisel tıbbi tavsiye yerine geçmez. Tedavi kararları için mutlaka hekiminize ve size atanan sağlık profesyoneline danışın.$md$
where slug = 'diyabetik-ayak-bakimi';

-- ---------- Makale 2: Bası Yarası Önleme ----------
update articles set
  intro = 'Bası yaraları, uzun süre aynı pozisyonda kalan hastalarda saatler içinde başlayabilir — ama doğru pozisyonlama, cilt bakımı ve beslenmeyle büyük ölçüde önlenebilir. Bakım verenler için pratik bir rehber hazırladık.',
  reading_minutes = 7,
  body = $md$Yatağa veya tekerlekli sandalyeye bağımlı bir yakınınıza bakıyorsanız, bası yarası (dekübit) riskini yönetmek günlük rutininizin parçası olmalı. Bası yarası, kemik çıkıntıları üzerindeki dokunun uzun süreli baskı altında kansız kalmasıyla oluşur; en sık kuyruk sokumu, topuklar, kalçalar ve dirseklerde görülür.

## Kimler risk altında?

- Kendi başına pozisyon değiştiremeyen hastalar
- His kaybı olanlar (felç, omurilik hasarı, ileri diyabet)
- İdrar/gaita kaçırma nedeniyle cildi sık nemli kalanlar
- Yetersiz beslenen veya belirgin kilo kaybı olan hastalar
- 65 yaş üstü ve cildi incelmiş bireyler

## Erken belirtileri tanıyın

Bası yarası bir anda "yara" olarak başlamaz. İlk evre, basınç kalktıktan sonra 30 dakika içinde solmayan kızarıklıktır. Bu evrede fark edilirse çoğu zaman kalıcı hasar olmadan geri döndürülebilir.

- Kemik çıkıntıları üzerinde solmayan kızarıklık veya morluk
- Koyu tenlilerde: bölgesel ısı artışı, sertlik veya renk koyulaşması
- Hastanın belli bir bölgede ağrı veya yanma tarifi

> Hemşire notu: Parmakla hafifçe bastırın; sağlıklı cilt bastırınca beyazlar, kaldırınca pembeye döner. Beyazlamıyorsa 1. evre bası yarası başlamış demektir — o bölgeye baskıyı tamamen kaldırın ve takibe alın.

## Pozisyon değişimi: en etkili önlem

1. Yatakta en geç 2 saatte bir, tekerlekli sandalyede 15-30 dakikada bir pozisyon değiştirin.
2. 30 derece yan yatış pozisyonunu tercih edin; doğrudan kalça kemiği üzerine yatırmayın.
3. Yatak başını gereksiz yere 30 dereceden fazla yükseltmeyin — hasta aşağı kayar ve kuyruk sokumunda makaslama kuvveti oluşur.
4. Topukları yatak yüzeyinden tamamen kaldırın: baldır altına ince yastık koyun, topuk boşlukta kalsın.
5. Taşırken hastayı sürüklemeyin, kaldırarak taşıyın; çarşaf üzerinde kaydırma cildi soyabilir.

## Destek yüzeyleri

Havalı yatak (basınç dağıtıcı şilte), pozisyon yastıkları ve topuk koruyucular riski belirgin azaltır — ancak hiçbiri pozisyon değişiminin yerini tutmaz. Simit yastık kullanmayın: baskıyı halka çevresine toplayarak riski artırır.

## Cilt bakımı ve nem yönetimi

- Cildi günde en az bir kez, riskli bölgeleri her pozisyon değişiminde kontrol edin.
- Islanan cildi bekletmeden temizleyin; pH dengeli temizleyici ve bariyer krem kullanın.
- Cildi kızarmış bölgeye masaj yapmayın — hasarlı dokuyu derinleştirir.
- Çarşafları gergin ve kırışıksız tutun; kırıntı ve yabancı cisim kontrolü yapın.

## Beslenme ihmale gelmez

Yeterli protein ve sıvı almayan hastada cilt direnci düşer. İştahsızlık, kilo kaybı veya tek tip beslenme fark ederseniz bunu bakım ekibinizle paylaşın; gerekirse beslenme desteği planlanır.

> Hemşire notu: Bakım veren kişinin tükenmişliği, bası yarasının görünmez risk faktörüdür. Pozisyon saatlerini telefon alarmıyla düzenlemek ve mümkünse nöbetleşmek, hem sizi hem hastanızı korur.

Bu içerik genel bilgilendirme amaçlıdır; kişisel tıbbi tavsiye yerine geçmez. Solmayan kızarıklık, açık yara veya akıntı fark ettiğinizde vakit kaybetmeden sağlık profesyoneline başvurun.$md$
where slug = 'basi-yarasi-onleme';

-- ---------- Makale 3: Evde Pansuman ----------
update articles set
  intro = 'Evde pansuman değişimi doğru teknikle yapıldığında güvenlidir; yanlış teknikle yapıldığında ise iyileşmeyi geciktirir ve enfeksiyon riskini artırır. Adım adım doğru pansuman rehberi.',
  reading_minutes = 7,
  body = $md$Pansumanın iki temel amacı vardır: yarayı dış ortamdan korumak ve iyileşme için uygun nem dengesini sağlamak. "Yara hava alsın, çabuk kurusun" inancı yaygın ama yanlıştır — modern yara bakımında çoğu yara, uygun nemli ortamda daha hızlı ve daha az izle iyileşir.

## Başlamadan önce: hazırlık ve hijyen

- Pansumanı yemek, temizlik gibi toz kaldıran işlerden sonra değil, sakin bir zamanda yapın.
- Evcil hayvanları odadan çıkarın, pencereyi kapatın.
- Temiz, düz bir çalışma yüzeyi hazırlayın; üzerine temiz bir örtü serin.
- Ellerinizi en az 20 saniye sabunla yıkayın ve tek kullanımlık eldiven giyin.

## Gerekli malzemeler

- Steril gazlı bez ve hemşirenizin önerdiği yara örtüsü
- Serum fizyolojik (yara temizliği için ilk tercih)
- Tek kullanımlık eldiven (2 çift: çıkarma ve yeni pansuman için ayrı)
- Flaster / sabitleme bandı ve temiz makas
- Kirlilerin atılacağı ağzı kapanabilir bir poşet

## Adım adım pansuman değişimi

1. Ellerinizi yıkayıp ilk eldiveni giyin.
2. Eski pansumanı kenarından başlayarak, cildi gererek değil örtüyü yavaşça kaldırarak çıkarın. Yapışmışsa asla kuru kuruya çekmeyin; serum fizyolojikle ıslatıp bekleyin.
3. Çıkan pansumanı poşete atın, eldiveni çıkarıp yenisini giyin.
4. Yarayı serum fizyolojikle, içten dışa doğru tek yönlü hareketlerle temizleyin. Her silme için yeni bir gazlı bez kullanın.
5. Yara çevresindeki sağlam cildi ayrıca kurulayın; örtünün yapışacağı alan kuru olmalı.
6. Önerilen yara örtüsünü yara boyutundan 2-3 cm taşacak şekilde yerleştirin ve cildi germeden sabitleyin.
7. Tüm atıkları poşetle birlikte kapatıp çöpe atın, ellerinizi tekrar yıkayın.

> Hemşire notu: Her pansuman değişimi aynı zamanda bir gözlem fırsatıdır. Yaranın boyutunu, rengini, akıntısını ve kokusunu not edin — mümkünse aynı ışıkta ve aynı açıdan fotoğraflayın. Takipteki en değerli veri, düzenli çekilmiş fotoğraf serisidir.

## Sık yapılan hatalar

- Yaraya kolonya, oksijenli su, tentürdiyot veya batikon dökmek: bu maddeler mikropla birlikte iyileşen dokuyu da tahrip eder. Hemşireniz önermedikçe kullanmayın.
- Pansumanı gereğinden sık açmak: her açılış, yara ısısını düşürür ve iyileşmeyi duraklatır. Önerilen değişim aralığına uyun.
- Yapışan pansumanı zorla çekmek: yeni oluşan dokuyu koparır.
- Krem, diş macunu, yoğurt gibi "evdeki çözümleri" denemek: enfeksiyon ve alerji riski taşır.

## Bu belirtiler varsa pansumanı bırakın, iletişime geçin

- Yara çevresinde artan ve yayılan kızarıklık, ısı artışı
- Kötü koku veya koyu renkli, yoğun akıntı
- Artan zonklama tarzı ağrı
- 38°C üzeri ateş, titreme

Bu tablo enfeksiyon işareti olabilir; bir sonraki pansumanı beklemeden hemşirenize ulaşın, gerekirse acil servise başvurun.

Bu içerik genel bilgilendirme amaçlıdır; kişisel tıbbi tavsiye yerine geçmez. Pansuman malzemesi ve değişim sıklığı yaranıza göre kişiselleştirilmelidir — bunun için değerlendirme şarttır.$md$
where slug = 'evde-pansuman';

-- ---------- Makale 4: Yara İyileşmesinde Beslenme ----------
update articles set
  intro = 'Yara iyileşmesi vücudun en çok enerji ve protein harcayan süreçlerinden biridir. Ne yediğiniz, yaranızın ne hızla kapanacağını doğrudan etkiler. İşte bilimsel temelli, uygulanabilir bir beslenme rehberi.',
  reading_minutes = 6,
  body = $md$İyileşen bir yara, sessiz çalışan bir şantiye gibidir: vücut yıkılan dokuyu temizler, yeni damarlar kurar, kolajen üretir ve cildi yeniden örer. Bu şantiyenin malzemesi ise doğrudan tabağınızdan gelir. Yetersiz beslenme, en iyi yara bakımını bile yavaşlatan görünmez bir engeldir.

## Protein: iyileşmenin tuğlası

Yara iyileşmesi sırasında protein ihtiyacı belirgin artar. Yeterli protein alınmazsa vücut, kas dokusunu yıkarak açığı kapatmaya çalışır — bu da halsizlik ve iyileşmede duraklama demektir.

- Her ana öğünde avuç içi büyüklüğünde bir protein kaynağı bulundurun: yumurta, tavuk, balık, kırmızı et, baklagil.
- Süt, yoğurt, peynir ve kefir hem protein hem de ek kalori sağlar.
- İştah azaldıysa, üç büyük öğün yerine 5-6 küçük, protein ağırlıklı öğün deneyin.

## C vitamini ve çinko: kolajenin yardımcıları

Kolajen üretimi C vitamini olmadan ilerlemez; çinko ise hücre yenilenmesinde görevlidir.

- C vitamini: turunçgiller, kivi, çilek, kuşburnu, biber, maydanoz
- Çinko: kırmızı et, karaciğer, yumurta, kabak çekirdeği, mercimek
- Demir de doku oksijenlenmesi için önemlidir; kırmızı et ve koyu yeşil yapraklılarla desteklenir.

Takviye (vitamin hapı) kararını kendi başınıza vermeyin; ihtiyaç kişiye göre değişir ve fazlası bazı durumlarda zarar verebilir.

## Su: en çok unutulan iyileştirici

Dokular arası madde taşınması ve cilt esnekliği yeterli sıvıya bağlıdır. Günde 6-8 bardak su hedefleyin; ateş, akıntılı yara veya sıcak hava bu ihtiyacı artırır. İdrar renginiz koyulaştıysa sıvıyı artırın (hekiminiz sıvı kısıtlaması önerdiyse ona uyun).

## Örnek bir iyileşme tabağı

1. Tabağın çeyreği: protein (ızgara tavuk, balık veya mercimek yemeği)
2. Tabağın çeyreği: tam tahıl (bulgur pilavı, tam buğday ekmeği)
3. Tabağın yarısı: renkli sebzeler (biber, brokoli, havuç, yeşillik)
4. Yanında: bir kase yoğurt ve bir porsiyon C vitamini zengini meyve

> Hemşire notu: Takip ettiğim hastalarda iyileşmenin duraksadığı dönemlerin önemli kısmında beslenme öyküsünde bir değişiklik görüyorum — iştah kaybı, tek tip beslenme veya öğün atlama. Kilonuzu haftada bir tartın; istemsiz kilo kaybı, yaranızın rakibidir ve mutlaka paylaşılmalıdır.

## Kimler mutlaka diyetisyen desteği almalı?

- Diyabeti olanlar (kan şekeri kontrolü iyileşme hızını doğrudan etkiler)
- Böbrek veya karaciğer hastalığı olanlar (protein miktarı kişiselleştirilmelidir)
- Son 3 ayda istemeden %5'ten fazla kilo kaybedenler
- Uzun süredir iyileşmeyen (kronik) yarası olanlar

Bu içerik genel bilgilendirme amaçlıdır; kişisel tıbbi veya diyetetik tavsiye yerine geçmez. Kronik hastalığınız varsa beslenme değişikliklerini hekiminizle planlayın.$md$
where slug = 'yara-beslenme';
