/**
 * Yara tipi hizmet sayfaları — /hizmetler/* SEO içeriği (statik, DB'siz).
 * Dil ilkesi (README §11): tanı/tedavi VAADİ YOK — "takip", "danışmanlık",
 * "değerlendirme" dili. Her sayfada yasal bilgilendirme cümlesi ServicePage
 * bileşeninde sabittir.
 */

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface Service {
  slug: string;
  /** Kart başlığı (indeks + ana sayfa) */
  name: string;
  /** Sayfa H1 */
  h1: string;
  /** <title> */
  metaTitle: string;
  /** meta description */
  metaDescription: string;
  /** İndeks kartı kısa açıklama */
  card: string;
  /** H1 altı giriş paragrafı */
  intro: string;
  /** "Neden düzenli takip önemli" paragrafları (2-3) */
  why: string[];
  /** "Kimler için uygun" maddeleri */
  suitable: string[];
  faq: ServiceFaq[];
}

export const SERVICES: Service[] = [
  {
    slug: "basi-yarasi",
    name: "Bası Yarası (Yatak Yarası)",
    h1: "Bası Yarası (Yatak Yarası) Uzaktan Takibi",
    metaTitle: "Bası Yarası (Yatak Yarası) Uzaktan Takibi — Saran",
    metaDescription:
      "Yatağa bağımlı yakınınızın bası yarasını evde fotoğrafla takip edin. Uzman yara bakım hemşiresi uzaktan değerlendirir, bakım planı önerir. İlk değerlendirme ücretsiz.",
    card: "Yatağa bağımlı hastalarda bası (dekübit) yaralarının evden, fotoğrafla düzenli takibi.",
    intro:
      "Yatağa bağımlı bir yakınınıza bakıyorsanız bası yarası (dekübit) riskini yakından tanıyorsunuzdur. Saran ile yaranın fotoğrafını evden gönderirsiniz; uzman yara bakım hemşiresi uzaktan değerlendirir ve size uygun bir bakım planı önerir. Hastaneye gitmeden, evde düzenli takip mümkün olur.",
    why: [
      "Bası yaraları, uzun süre aynı pozisyonda kalan hastalarda derinin sürekli baskı altında kalmasıyla oluşur. Erken evrede küçük bir kızarıklık gibi görünen bölge, düzenli gözlem yapılmazsa kısa sürede derinleşebilir. Bu nedenle yaranın seyrini belirli aralıklarla, aynı açıdan ve karşılaştırılabilir şekilde izlemek büyük önem taşır.",
      "Evde bakım veren aile üyeleri çoğu zaman yaradaki değişimin önemli olup olmadığından emin olamaz. Fotoğrafla uzaktan takip, deneyimli bir yara bakım hemşiresinin gözünün düzenli olarak yaranın üzerinde olmasını sağlar; olumsuz bir gidişat fark edildiğinde sizi yüz yüze sağlık hizmetine yönlendirir.",
      "Düzenli takip aynı zamanda bakım rutininizi de güçlendirir: pozisyon değişikliği, cilt temizliği ve beslenme gibi günlük bakım konularında hemşireniz size rehberlik eder, sorularınızı yanıtlar.",
    ],
    suitable: [
      "Yatağa veya tekerlekli sandalyeye bağımlı yakınına evde bakan aileler",
      "Felç, ileri yaş veya ameliyat sonrası uzun süre yatak istirahati gereken hastalar",
      "Bası yarası riski nedeniyle cilt kontrolünü düzenli yaptırmak isteyenler",
      "Hastaneye sık gidemeyen, evden takip arayan hasta yakınları",
    ],
    faq: [
      {
        q: "Bası yarasının fotoğrafını nasıl çekmeliyim?",
        a: "Gün ışığında veya iyi aydınlatılmış ortamda, yaraya yaklaşık 20-30 cm mesafeden net bir fotoğraf yeterlidir. Hemşireniz gerekirse ek açı veya yakınlık isteyebilir; uygulama içinde size adım adım yol gösterilir.",
      },
      {
        q: "Hemşire eve gelir mi?",
        a: "Saran bir uzaktan takip hizmetidir; hemşire değerlendirmeyi gönderdiğiniz fotoğraf ve bilgiler üzerinden çevrimiçi yapar. Yüz yüze müdahale gerektiren durumlarda sizi uygun sağlık kuruluşuna yönlendirir.",
      },
      {
        q: "İlk değerlendirme gerçekten ücretsiz mi?",
        a: "Evet. İlk fotoğraf değerlendirmesi için ödeme alınmaz ve kart bilgisi istenmez. Hemşire plan önerdikten sonra devam edip etmemek tamamen sizin kararınızdır.",
      },
    ],
  },
  {
    slug: "diyabetik-ayak",
    name: "Diyabetik Ayak Yarası",
    h1: "Diyabetik Ayak Yarası Uzaktan Takibi",
    metaTitle: "Diyabetik Ayak Yarası Uzaktan Takibi — Saran",
    metaDescription:
      "Diyabetik ayak yaranızı evde fotoğrafla takip edin. Uzman yara bakım hemşiresi uzaktan değerlendirir, size özel bakım planı önerir. İlk değerlendirme ücretsiz.",
    card: "Diyabete bağlı ayak yaralarının evden fotoğrafla izlenmesi ve düzenli hemşire değerlendirmesi.",
    intro:
      "Diyabet yaşayan kişilerde ayakta oluşan küçük bir yara bile yakın takip gerektirir. Saran ile ayak yaranızın fotoğrafını evden gönderir, uzman yara bakım hemşiresinin uzaktan değerlendirmesini alırsınız. Düzenli fotoğrafla takip sayesinde yaranın seyri kayıt altında kalır.",
    why: [
      "Diyabet, sinir hasarı (his azalması) ve dolaşım bozukluğu nedeniyle ayak yaralarının fark edilmesini ve kapanmasını zorlaştırabilir. His azaldığı için hasta yaranın kötüleştiğini hissetmeyebilir; bu yüzden gözle ve fotoğrafla düzenli kontrol, diyabetik ayak bakımının temel taşlarından biridir.",
      "Fotoğrafla uzaktan takip, yaradaki boyut, renk ve çevre doku değişimlerinin zaman çizelgesi üzerinde karşılaştırılmasını sağlar. Deneyimli bir yara bakım hemşiresi bu değişimleri değerlendirir, günlük bakım ve korunma önerilerinde bulunur ve gerekli gördüğünde sizi vakit kaybetmeden hekime yönlendirir.",
      "Düzenli takip ayrıca ayakkabı seçimi, ayak hijyeni ve cilt bakımı gibi koruyucu alışkanlıkların yerleşmesine yardımcı olur; sorularınıza aynı gün içinde yanıt alabilirsiniz.",
    ],
    suitable: [
      "Ayağında iyileşmeyen veya yavaş kapanan yarası olan diyabet hastaları",
      "Diyabetik ayak riski nedeniyle düzenli cilt kontrolü yaptırmak isteyenler",
      "Hastane kontrollerinin arasında yarasını yakından izletmek isteyenler",
      "Diyabetli yakınının ayak bakımını evden organize eden aileler",
    ],
    faq: [
      {
        q: "Doktor kontrolümün yerine geçer mi?",
        a: "Hayır. Saran, hekim muayenesinin tamamlayıcısı olan bir uzaktan takip ve danışmanlık hizmetidir. Hemşireniz gerekli gördüğünde sizi hekiminize veya bir sağlık kuruluşuna yönlendirir.",
      },
      {
        q: "Ne sıklıkla fotoğraf göndermeliyim?",
        a: "Hemşireniz yaranızın durumuna göre size bir gönderim sıklığı önerir; çoğu takipte haftada birkaç fotoğraf yeterli olur. Aradaki değişikliklerde dilediğiniz an ek fotoğraf gönderebilirsiniz.",
      },
      {
        q: "Yara ürünlerini siz mi satıyorsunuz?",
        a: "Hayır, ürün satışı yapmıyoruz. Hemşireniz bakım planında genel ürün tipleri önerebilir; teminini eczaneniz veya sağlık kuruluşunuz üzerinden yaparsınız.",
      },
    ],
  },
  {
    slug: "cerrahi-yara",
    name: "Ameliyat Sonrası Yara",
    h1: "Ameliyat Sonrası Yara Takibi",
    metaTitle: "Ameliyat Sonrası (Cerrahi) Yara Takibi — Saran",
    metaDescription:
      "Ameliyat sonrası dikiş bölgenizi evde fotoğrafla takip ettirin. Uzman yara bakım hemşiresi uzaktan değerlendirir, bakım önerileri sunar. İlk değerlendirme ücretsiz.",
    card: "Ameliyat sonrası dikiş bölgesinin evden fotoğrafla izlenmesi ve iyileşme sürecinin kaydı.",
    intro:
      "Ameliyattan sonra eve döndüğünüzde dikiş bölgenizin normal seyredip seyretmediğini merak etmek çok doğaldır. Saran ile cerrahi yaranızın fotoğrafını evden gönderir, uzman yara bakım hemşiresinin uzaktan değerlendirmesini alırsınız. Kontroller arasındaki dönemde de yaranız gözetimsiz kalmaz.",
    why: [
      "Cerrahi yaralar çoğunlukla sorunsuz kapanır; ancak ilk haftalarda kızarıklık, akıntı, şişlik veya ısı artışı gibi bulguların erken fark edilmesi önemlidir. Bu değişimler evde çıplak gözle değerlendirilmesi zor olabilen, deneyim gerektiren işaretlerdir.",
      "Fotoğrafla düzenli takip, dikiş bölgesindeki değişimin tarih damgalı bir zaman çizelgesinde izlenmesini sağlar. Hemşireniz bu kaydı değerlendirir, pansuman ve günlük bakım konusunda yol gösterir; beklenenden farklı bir seyir gördüğünde sizi ameliyatınızı yapan ekibe veya bir sağlık kuruluşuna yönlendirir.",
      "Böylece 'Bu normal mi?' sorusunu her seferinde hastaneye gitmeden sorabilir, taburculuk sonrası dönemi daha güvende hissederek geçirirsiniz.",
    ],
    suitable: [
      "Ameliyat sonrası taburcu olmuş, dikiş bölgesini evden izletmek isteyenler",
      "Kontrol randevuları arasında yara seyrinden emin olmak isteyen hastalar",
      "Sezaryen, ortopedik veya karın cerrahisi sonrası bakım desteği arayanlar",
      "Ameliyatlı yakınının pansuman sürecine evde destek olan aileler",
    ],
    faq: [
      {
        q: "Dikişlerim alınmadan takip başlayabilir mi?",
        a: "Evet. Taburcu olduğunuz andan itibaren fotoğraf göndererek ücretsiz ilk değerlendirmeyi alabilirsiniz. Hemşireniz, cerrahınızın verdiği bakım talimatlarını dikkate alarak öneride bulunur.",
      },
      {
        q: "Pansumanı kim yapacak?",
        a: "Pansumanı siz veya bakım vereniniz yapar; hemşireniz hangi adımları nasıl uygulayacağınızı anlaşılır şekilde tarif eder ve fotoğraflar üzerinden sonucu değerlendirir.",
      },
      {
        q: "Acil bir durum fark edilirse ne olur?",
        a: "Hemşireniz endişe verici bir bulgu gördüğünde bunu size açıkça iletir ve vakit kaybetmeden ameliyatınızı yapan ekibe veya acil servise başvurmanızı önerir. Saran acil tıbbi yardımın yerini tutmaz.",
      },
    ],
  },
  {
    slug: "venoz-ulser",
    name: "Venöz Ülser (Varis Yarası)",
    h1: "Venöz Ülser (Varis Yarası) Takibi",
    metaTitle: "Venöz Ülser (Varis Yarası) Uzaktan Takibi — Saran",
    metaDescription:
      "Bacaktaki venöz ülser (varis yarası) için evden fotoğrafla uzaktan takip. Uzman yara bakım hemşiresi değerlendirir, bakım planı önerir. İlk değerlendirme ücretsiz.",
    card: "Bacakta toplardamar yetmezliğine bağlı yaraların evden fotoğrafla düzenli takibi.",
    intro:
      "Bacakta, genellikle ayak bileği çevresinde açılan venöz ülserler (varis yaraları) uzun sürebilen, sabır isteyen yaralardır. Saran ile yaranızın fotoğrafını evden gönderir, uzman yara bakım hemşiresinin uzaktan değerlendirmesi ve bakım önerileriyle süreci düzenli biçimde takip edersiniz.",
    why: [
      "Venöz ülserler, bacak toplardamarlarındaki dolaşım sorunlarına bağlı geliştiği için kapanmaları zaman alabilir ve seyirleri dalgalı olabilir. Haftalar içinde küçülme, duraklamalar veya çevre ciltte değişimler görülebilir; bu seyrin karşılaştırılabilir fotoğraflarla kayıt altına alınması, sürecin doğru okunmasını kolaylaştırır.",
      "Uzaktan takip sayesinde hemşireniz yaranın boyutundaki ve görünümündeki değişimi düzenli değerlendirir; bandaj, cilt bakımı ve günlük yaşam önerileriyle (bacak elevasyonu, yürüyüş düzeni gibi genel bakım konularında) size rehberlik eder. Beklenmeyen bir seyirde sizi hekiminize yönlendirir.",
      "Uzun süren yaralarda motivasyon da bakımın parçasıdır: zaman çizelgesindeki ilerlemeyi görmek, bakım rutinine bağlı kalmayı kolaylaştırır.",
    ],
    suitable: [
      "Bacağında uzun süredir kapanmayan varis yarası olanlar",
      "Venöz yetmezlik tanısıyla izlenen ve yara bölgesini takip ettirmek isteyenler",
      "Kompresyon (bandaj/çorap) kullanan ve bakım sürecinde rehberlik arayanlar",
      "Hastaneye sık gitmekte zorlanan, evden düzenli takip isteyen hastalar",
    ],
    faq: [
      {
        q: "Varis yarası ne kadar sürede kapanır?",
        a: "Süre kişiden kişiye ve yaranın durumuna göre değişir; kesin bir süre vaat etmek doğru olmaz. Düzenli takip, seyri yakından izlemenizi ve bakım planına bağlı kalmanızı kolaylaştırır.",
      },
      {
        q: "Kompresyon çorabı/bandajı hakkında öneri alır mıyım?",
        a: "Hemşireniz genel bakım çerçevesinde kompresyon kullanımıyla ilgili bilgilendirme yapabilir; ancak kompresyon kararı ve reçetesi hekiminize aittir.",
      },
      {
        q: "Her iki bacakta da yara varsa tek takip yeter mi?",
        a: "Her yara bölgesi ayrı fotoğraflanır ve ayrı değerlendirilir; hemşireniz takip planını yaralarınızın sayısına ve durumuna göre düzenler.",
      },
    ],
  },
  {
    slug: "yanik",
    name: "Yanık Yarası",
    h1: "Yanık Yarası Takibi",
    metaTitle: "Yanık Yarası Uzaktan Takibi — Saran",
    metaDescription:
      "Yanık bölgenizi evde fotoğrafla takip ettirin. Uzman yara bakım hemşiresi uzaktan değerlendirir, bakım önerileri sunar. İlk değerlendirme ücretsiz.",
    card: "Ev tipi yanıkların iyileşme sürecinin fotoğrafla izlenmesi ve hemşire değerlendirmesi.",
    intro:
      "Mutfakta, ütüyle ya da sıcak suyla yaşanan ev tipi yanıklar günlük hayatta sık görülür. Saran ile yanık bölgenizin fotoğrafını evden gönderir, uzman yara bakım hemşiresinin uzaktan değerlendirmesini alırsınız. İyileşme süreci fotoğraflarla düzenli takip edilir, sorularınız yanıtsız kalmaz.",
    why: [
      "Yanık yaralarında ilk günlerdeki görünüm zamanla değişir; su toplaması, soyulma ve renk değişimi sürecin doğal parçaları olabilir. Hangi değişimin beklenen, hangisinin dikkat gerektiren bir işaret olduğunu ayırt etmek deneyim ister. Düzenli fotoğraf takibi bu ayrımın zamanında yapılmasına yardımcı olur.",
      "Uzaktan takipte hemşireniz yanık bölgesinin seyrini değerlendirir, kapama/pansuman ve cilt bakımı konusunda genel önerilerde bulunur; enfeksiyon şüphesi gibi yüz yüze değerlendirme gerektiren durumlarda sizi vakit kaybetmeden sağlık kuruluşuna yönlendirir.",
      "İyileşme sonrasında da iz bakımı ve cildin korunmasıyla ilgili sorularınızı hemşirenize iletebilirsiniz.",
    ],
    suitable: [
      "Ev tipi (sıcak su, yağ, ütü, soba) yüzeysel yanığı olan yetişkinler",
      "Sağlık kuruluşunda ilk müdahalesi yapılmış, evde pansuman süreci devam edenler",
      "Yanık bölgesinin seyrini kontroller arasında izletmek isteyenler",
      "Yanığı olan yakınının evde bakımına destek olan aileler",
    ],
    faq: [
      {
        q: "Hangi yanıklar uzaktan takibe uygundur?",
        a: "Küçük ve yüzeysel ev tipi yanıklar uzaktan takibe daha uygundur. Geniş, derin, yüz/el/eklem bölgesi yanıklarında veya çocuklarda önce mutlaka bir sağlık kuruluşuna başvurmalısınız; hemşireniz ilk değerlendirmede bu ayrımı yapmanıza yardımcı olur.",
      },
      {
        q: "Yanığa ilk anda ne yapmalıyım?",
        a: "Genel öneri, bölgeyi serin (buzsuz) akan suyla soğutmak ve temiz tutmaktır. İlk anda ciddi bir yanıksa 112'yi arayın veya acil servise gidin. Saran, acil müdahalenin değil sonrasındaki bakım sürecinin takibi içindir.",
      },
      {
        q: "İz kalır mı, iz bakımı için destek alır mıyım?",
        a: "İz gelişimi yanığın derinliğine ve kişiye göre değişir; garanti verilemez. Hemşireniz iyileşme sonrasında güneşten korunma ve nemlendirme gibi genel iz bakımı konularında bilgilendirme yapar.",
      },
    ],
  },
];

/** Slug ile hizmet bul; yoksa null. */
export function getService(slug: string): Service | null {
  return SERVICES.find((s) => s.slug === slug) ?? null;
}
