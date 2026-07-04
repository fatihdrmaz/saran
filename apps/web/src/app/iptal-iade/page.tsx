import type { Metadata } from "next";
import { LegalPage, type LegalBlock } from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "İptal ve İade Politikası — Saran",
  description:
    "Saran uzaktan yara bakım hizmetlerinde iptal, cayma hakkı ve iade koşulları: ücretsiz ilk değerlendirme, 14 gün cayma hakkı, abonelik iptali ve iade süreçleri.",
  alternates: { canonical: "/iptal-iade" },
};

const BLOCKS: LegalBlock[] = [
  {
    p: "Bu politika, Saran üzerinden satın alınan uzaktan yara bakım danışmanlık ve takip hizmetlerine ilişkin iptal, cayma ve iade koşullarını açıklar. Ayrıntılı sözleşme hükümleri için Mesafeli Satış Sözleşmesi sayfasına bakabilirsiniz.",
  },
  { h: "Ücretsiz ilk değerlendirme" },
  {
    p: "İlk yara değerlendirmesi tamamen ücretsizdir. Bu adımda ödeme alınmaz, kart bilgisi istenmez ve herhangi bir taahhüt doğmaz. Değerlendirme sonucunda önerilen bakım planını onaylamadığınız sürece sizden hiçbir ücret tahsil edilmez.",
  },
  { h: "Ücretlendirme ne zaman başlar?" },
  {
    p: "Ücretlendirme yalnızca, hemşireniz tarafından önerilen bakım planını açıkça onaylamanız hâlinde başlar. Plan onayı öncesinde herhangi bir ücret alınmaz.",
  },
  { h: "14 gün cayma hakkı" },
  {
    p: "Mesafeli Sözleşmeler Yönetmeliği uyarınca, plan satın aldığınız tarihten itibaren 14 (on dört) gün içinde gerekçe göstermeksizin cayma hakkınız vardır. Cayma bildiriminizi destek kanallarımız üzerinden yazılı olarak iletebilirsiniz.",
  },
  {
    p: "Onayınızla hizmetin ifasına başlanmış ve hizmet cayma süresi içinde tamamen ifa edilmişse (örneğin tek değerlendirme hizmetinin tamamlanması), yönetmelik gereği cayma hakkı kullanılamaz.",
  },
  { h: "Hizmet başladıysa kısmi iade" },
  {
    p: "Hizmetin ifasına başlanmış ancak henüz tamamlanmamışken cayma hakkınızı kullanırsanız, cayma tarihine kadar fiilen sunulan hizmetin bedeli toplam tutardan düşülür ve kalan tutar tarafınıza iade edilir.",
  },
  { h: "İade süresi ve yöntemi" },
  {
    p: "İade tutarı, cayma veya iptal bildiriminizin bize ulaşmasından itibaren en geç 14 (on dört) gün içinde, ödemeyi yaptığınız yönteme (kredi/banka kartınıza) iade edilir. Kartınıza yansıma süresi bankanıza göre değişebilir.",
  },
  { h: "Abonelik iptali" },
  {
    p: "Aylık takip ve aile planı gibi abonelik niteliğindeki planlarınızı dilediğiniz zaman iptal edebilirsiniz. İptal, bir sonraki yenileme dönemi için geçerli olur: içinde bulunduğunuz dönemin sonuna kadar hizmet almaya devam edersiniz ve sonraki dönem için ücret tahsil edilmez.",
  },
  { h: "İletişim" },
  {
    p: "İptal, cayma ve iade talepleriniz için bize [E-posta] adresinden veya uygulama içi destek kanallarımızdan ulaşabilirsiniz. Talebinizde ad-soyad ve sipariş/plan bilgilerinizi belirtmeniz süreci hızlandırır.",
  },
];

export default function IptalIadePage() {
  return (
    <LegalPage
      title="İptal ve İade Politikası"
      updated="Son güncelleme: 1 Temmuz 2026"
      blocks={BLOCKS}
    />
  );
}
