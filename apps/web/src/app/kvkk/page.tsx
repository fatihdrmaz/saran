import type { Metadata } from "next";
import { LegalPage, type LegalBlock } from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "KVKK & Gizlilik Politikası — Yara Takibi",
  description:
    "Yara Takibi'nde kişisel ve sağlık verilerinizin 6698 sayılı KVKK kapsamında nasıl işlendiğini, korunduğunu ve haklarınızı açıklayan gizlilik politikası.",
  alternates: { canonical: "/kvkk" },
};

const BLOCKS: LegalBlock[] = [
  {
    p: "Yara Takibi olarak kişisel verilerinizin ve özellikle sağlık verilerinizin gizliliğine en yüksek önemi veriyoruz. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında verilerinizin nasıl işlendiğini açıklamak amacıyla hazırlanmıştır.",
  },
  { h: "Veri sorumlusu" },
  {
    p: "Bu gizlilik politikası kapsamındaki kişisel verileriniz, hizmeti işleten Yara Takibi tarafından veri sorumlusu sıfatıyla işlenmektedir. Veri işleme faaliyetlerine ilişkin sorularınızı destek kanallarımız üzerinden iletebilirsiniz.",
  },
  { h: "Hangi verileri topluyoruz?" },
  {
    p: "Ad-soyad, telefon ve e-posta gibi iletişim bilgileriniz, ödeme işlemleri için gereken bilgiler ile yara bakım hizmeti için paylaştığınız fotoğraflar ve sağlık notlarınız işlenebilir. Yara fotoğrafları ve sağlık notları, KVKK uyarınca özel nitelikli kişisel veri kabul edilir ve en üst düzeyde korunur.",
  },
  { h: "Verileri hangi amaçlarla işliyoruz?" },
  {
    p: "Verileriniz; ücretsiz değerlendirmenin yapılması, hemşire tarafından bakım planı önerilmesi, onaylanan planların takibi, iletişim, ödeme ve faturalandırma ile yasal yükümlülüklerin yerine getirilmesi amaçlarıyla işlenir. Sağlık verileriniz yalnızca hizmetin sunulması için gerekli olduğu ölçüde işlenir.",
  },
  { h: "Verileriniz nasıl korunur?" },
  {
    p: "Tüm görseller ve sağlık verileri uçtan uca şifrelenir. Yara fotoğraflarınıza yalnızca size atanan yara bakım hemşireniz erişebilir; erişimler kayıt altına alınır. Veriler güvenli sunucularda, yetkisiz erişime karşı teknik ve idari tedbirlerle saklanır.",
  },
  { h: "Verileriniz kimlerle paylaşılır?" },
  {
    p: "Sağlık verileriniz üçüncü taraflarla pazarlama amacıyla asla paylaşılmaz. Verileriniz yalnızca hizmetin sunulması için atanan hemşireyle ve yasal zorunluluk hâlinde yetkili kurum ve kuruluşlarla, mevzuatın izin verdiği ölçüde paylaşılabilir.",
  },
  { h: "Saklama süresi" },
  {
    p: "Verileriniz, işlenme amacının gerektirdiği süre ve ilgili mevzuatta öngörülen süreler boyunca saklanır. Bu sürelerin sona ermesi veya talebiniz hâlinde verileriniz silinir, yok edilir veya anonim hâle getirilir.",
  },
  { h: "Haklarınız" },
  {
    p: "KVKK'nın 11. maddesi kapsamında; kişisel verilerinizin işlenip işlenmediğini öğrenme, bunlara erişme, düzeltilmesini veya silinmesini isteme ve işlemenin kanuna aykırı olduğunu düşündüğünüzde itiraz etme haklarına sahipsiniz. Hesabınızı kapattığınızda görselleriniz kalıcı olarak silinir.",
  },
  { h: "Çerez politikası", id: "cerez" },
  {
    p: "Web sitemiz, temel işlevselliği sağlamak ve deneyiminizi iyileştirmek için zorunlu ve isteğe bağlı çerezler kullanabilir. Tarayıcı ayarlarınızdan çerez tercihlerinizi yönetebilirsiniz; ancak bazı çerezlerin devre dışı bırakılması site işlevselliğini etkileyebilir.",
  },
  { h: "Değişiklikler" },
  {
    p: "Bu politika zaman zaman güncellenebilir. Önemli değişikliklerde sizi bilgilendirmek için makul çaba gösteririz. Güncel sürüm her zaman bu sayfada yayımlanır.",
  },
];

export default function KvkkPage() {
  return <LegalPage title="KVKK & Gizlilik Politikası" updated="Son güncelleme: 1 Haziran 2026" blocks={BLOCKS} />;
}
