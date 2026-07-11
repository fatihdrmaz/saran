import type { Metadata } from "next";
import { LegalPage, type LegalBlock } from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi — Yara Takibi",
  description:
    "Yara Takibi uzaktan yara bakım danışmanlık ve takip hizmetlerine ilişkin, 6502 sayılı TKHK ve Mesafeli Sözleşmeler Yönetmeliği'ne uygun mesafeli satış sözleşmesi.",
  alternates: { canonical: "/mesafeli-satis" },
};

const BLOCKS: LegalBlock[] = [
  {
    p: "İşbu Mesafeli Satış Sözleşmesi (\"Sözleşme\"), 6502 sayılı Tüketicinin Korunması Hakkında Kanun (\"TKHK\") ve Mesafeli Sözleşmeler Yönetmeliği hükümlerine uygun olarak, aşağıda bilgileri yer alan taraflar arasında elektronik ortamda kurulmuştur.",
  },
  { h: "1. Taraflar" },
  {
    p: "SATICI / HİZMET SAĞLAYICI: [Şirket Unvanı] (\"Yara Takibi\"). Adres: [Adres]. MERSİS No: [MERSİS]. E-posta: [E-posta]. Telefon: [Telefon].",
  },
  {
    p: "ALICI / TÜKETİCİ: Yara Takibi web sitesi veya mobil uygulaması üzerinden hizmet satın alan, sipariş sırasında bildirdiği ad-soyad ve iletişim bilgileriyle tanımlanan gerçek kişidir (\"Alıcı\").",
  },
  { h: "2. Sözleşmenin konusu ve hizmetin tanımı" },
  {
    p: "İşbu Sözleşme'nin konusu; Alıcı'nın Yara Takibi platformu üzerinden elektronik ortamda sipariş verdiği uzaktan yara bakım danışmanlık ve takip hizmetlerinin (tek değerlendirme, aylık takip ve aile planı gibi bakım planları) sunulmasına ilişkin tarafların hak ve yükümlülüklerinin belirlenmesidir.",
  },
  {
    p: "Hizmet; Alıcı'nın gönderdiği yara fotoğraflarının sertifikalı yara bakım hemşiresi tarafından uzaktan değerlendirilmesini, bakım planı önerilmesini ve onaylanan planın kapsamına göre takip, mesajlaşma ve raporlama hizmetlerini içerir. Yara Takibi bir uzaktan takip ve danışmanlık hizmetidir; yüz yüze tıbbi muayenenin, kesin tanının veya acil tıbbi müdahalenin yerini tutmaz.",
  },
  { h: "3. Fiyat ve ödeme" },
  {
    p: "İlk yara değerlendirmesi ücretsizdir; bu adımda ödeme alınmaz ve kart bilgisi istenmez. Ücretlendirme yalnızca Alıcı'nın kendisine önerilen bakım planını açıkça onaylaması hâlinde başlar.",
  },
  {
    p: "Bakım planlarının güncel fiyatları sipariş sayfasında gösterilir ve KDV dahildir. Ödemeler, iyzico ödeme altyapısı aracılığıyla kredi/banka kartı ile tahsil edilir. Abonelik niteliğindeki planlarda ücret, ilgili dönemin başında tahsil edilir.",
  },
  { h: "4. Hizmetin ifası" },
  {
    p: "Hizmet, plan onayını ve ödemenin tahsilini takiben elektronik ortamda ifa edilmeye başlanır. Alıcı, plan onayı ile birlikte hizmetin ifasına derhâl başlanmasını talep etmiş sayılır.",
  },
  { h: "5. Cayma hakkı" },
  {
    p: "Alıcı, Mesafeli Sözleşmeler Yönetmeliği uyarınca, sözleşmenin kurulduğu tarihten itibaren 14 (on dört) gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkına sahiptir. Cayma bildirimi, destek kanallarımız veya [E-posta] adresi üzerinden yazılı olarak yapılabilir.",
  },
  {
    p: "Yönetmeliğin 15. maddesi uyarınca; Alıcı'nın onayı ile hizmetin ifasına başlanan ve cayma süresi dolmadan tamamen ifa edilen hizmetlerde cayma hakkı kullanılamaz. Hizmetin ifasına başlanmış ancak tamamlanmamış olması hâlinde, cayma tarihine kadar sunulan hizmetin bedeli düşülerek kalan tutar iade edilir.",
  },
  { h: "6. Fesih ve iptal" },
  {
    p: "Alıcı, abonelik niteliğindeki planlarını dilediği zaman iptal edebilir; iptal, bir sonraki yenileme dönemi için geçerli olur ve içinde bulunulan dönemin sonuna kadar hizmet sunulmaya devam eder. İptal ve iade koşullarının ayrıntıları İptal ve İade Politikası sayfasında yer alır.",
  },
  {
    p: "Yara Takibi, Alıcı'nın Sözleşme'ye veya Kullanım Koşulları'na aykırı davranması hâlinde hizmeti askıya alma veya Sözleşme'yi feshetme hakkını saklı tutar.",
  },
  { h: "7. Kişisel verilerin korunması" },
  {
    p: "Alıcı'ya ait kişisel veriler ve özel nitelikli sağlık verileri, 6698 sayılı KVKK'ya uygun olarak işlenir. Ayrıntılı bilgi KVKK & Gizlilik Politikası sayfasında yer alır.",
  },
  { h: "8. Uyuşmazlıkların çözümü" },
  {
    p: "İşbu Sözleşme'den doğan uyuşmazlıklarda, Ticaret Bakanlığı'nca her yıl ilan edilen parasal sınırlar dahilinde Alıcı'nın yerleşim yerinin bulunduğu veya işlemin yapıldığı yerdeki Tüketici Hakem Heyetleri; bu sınırları aşan uyuşmazlıklarda ise Tüketici Mahkemeleri yetkilidir.",
  },
  { h: "9. Yürürlük" },
  {
    p: "Alıcı, sipariş onayı ile birlikte işbu Sözleşme'nin tüm koşullarını kabul etmiş sayılır. Sözleşme, elektronik ortamda kurulduğu anda yürürlüğe girer ve bir örneği Alıcı'nın erişimine sunulur.",
  },
];

export default function MesafeliSatisPage() {
  return (
    <LegalPage
      title="Mesafeli Satış Sözleşmesi"
      updated="Son güncelleme: 1 Temmuz 2026"
      blocks={BLOCKS}
    />
  );
}
