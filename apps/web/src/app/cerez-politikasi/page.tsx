import type { Metadata } from "next";
import { LegalPage, type LegalBlock } from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Çerez Politikası — Yara Takibi",
  description:
    "Yara Takibi web sitesinde kullanılan çerezler: zorunlu oturum çerezleri ve tercih çerezleri. Analitik çerez kullanılmamaktadır. Çerez yönetimi ve KVKK bilgilendirmesi.",
  alternates: { canonical: "/cerez-politikasi" },
};

const BLOCKS: LegalBlock[] = [
  {
    p: "Bu politika, Yara Takibi web sitesinde hangi çerezlerin (cookie) hangi amaçlarla kullanıldığını ve çerez tercihlerinizi nasıl yönetebileceğinizi açıklar. Çerezler, ziyaret ettiğiniz web siteleri tarafından tarayıcınıza kaydedilen küçük metin dosyalarıdır.",
  },
  { h: "Zorunlu çerezler" },
  {
    p: "Sitenin temel işlevlerinin çalışması için gerekli çerezlerdir. Oturum yönetimi ve güvenlik amacıyla kullanılırlar; bu çerezler olmadan giriş yapma gibi temel özellikler çalışmaz. Zorunlu çerezler için mevzuat gereği açık rıza aranmaz.",
  },
  { h: "Tercih çerezleri" },
  {
    p: "Tercihlerinizi hatırlamak için kullanılan çerezlerdir. Sitemizde bu kapsamda yalnızca çerez bildirimine verdiğiniz yanıt tarayıcınızın yerel depolamasında (localStorage) saklanır; böylece bildirimi her ziyarette yeniden görmezsiniz.",
  },
  { h: "Analitik çerezler" },
  {
    p: "Şu an sitemizde analitik veya pazarlama amaçlı hiçbir çerez kullanmıyoruz. Ziyaret istatistiği toplayan, sizi siteler arasında takip eden veya reklam amaçlı profil çıkaran üçüncü taraf çerezleri bulunmamaktadır. İleride analitik çerez kullanmaya başlarsak bu politika güncellenir ve onayınız istenir.",
  },
  { h: "Çerezleri nasıl yönetebilirsiniz?" },
  {
    p: "Tarayıcınızın ayarlarından çerezleri görüntüleyebilir, silebilir veya engelleyebilirsiniz. Chrome, Safari, Firefox ve Edge gibi yaygın tarayıcıların ayarlar bölümünde \"Gizlilik\" veya \"Çerezler\" başlığı altında bu seçenekleri bulabilirsiniz. Zorunlu çerezlerin engellenmesi hâlinde sitenin bazı bölümleri düzgün çalışmayabilir.",
  },
  { h: "Kişisel verilerin korunması" },
  {
    p: "Çerezler aracılığıyla işlenen veriler, 6698 sayılı Kişisel Verilerin Korunması Kanunu'na (KVKK) uygun şekilde işlenir. Kişisel verilerinizin işlenmesine ilişkin ayrıntılı bilgi için KVKK & Gizlilik Politikası sayfamızı inceleyebilirsiniz.",
  },
  { h: "Değişiklikler" },
  {
    p: "Bu politika zaman zaman güncellenebilir. Güncel sürüm her zaman bu sayfada yayımlanır; önemli değişikliklerde sizi bilgilendirmek için makul çaba gösteririz.",
  },
];

export default function CerezPolitikasiPage() {
  return (
    <LegalPage
      title="Çerez Politikası"
      updated="Son güncelleme: 1 Temmuz 2026"
      blocks={BLOCKS}
    />
  );
}
