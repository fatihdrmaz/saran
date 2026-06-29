import type { Metadata } from "next";
import { LegalPage, type LegalBlock } from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Kullanım Koşulları — Saran",
  description:
    "Saran uzaktan yara bakım takip hizmetinin kullanım koşulları: hizmet kapsamı, acil durumlar, ödeme ve iptal, sorumluluk sınırları.",
  alternates: { canonical: "/kosullar" },
};

const BLOCKS: LegalBlock[] = [
  {
    p: "Saran hizmetini kullanarak aşağıdaki koşulları kabul etmiş olursunuz. Lütfen dikkatlice okuyunuz. Koşulları kabul etmiyorsanız hizmeti kullanmamanızı rica ederiz.",
  },
  { h: "Hizmetin kapsamı" },
  {
    p: "Saran, uzaktan yara bakım takibi ve danışmanlığı sunan bir dijital platformdur. Hizmetimiz, sertifikalı yara bakım hemşireleri tarafından sağlanan bir destek hizmetidir; yüz yüze tıbbi muayenenin, kesin tanının veya acil tıbbi müdahalenin yerini tutmaz.",
  },
  { h: "Uygunluk ve hesap" },
  {
    p: "Hizmeti kullanabilmek için reşit olmanız veya yasal vasinizin onayını almış olmanız gerekir. Hesap bilgilerinizin gizliliğinden ve hesabınız üzerinden yapılan işlemlerden siz sorumlusunuz. Paylaştığınız bilgilerin doğru ve güncel olmasını sağlamalısınız.",
  },
  { h: "Ücretsiz değerlendirme ve plan onayı" },
  {
    p: "İlk değerlendirme ücretsizdir; bu adımda kart bilgisi istenmez. Bir bakım planı yalnızca siz onayladığınızda ücretlendirme başlar ve takip akışı açılır. Planı onaylamadığınız sürece sizden herhangi bir ücret tahsil edilmez.",
  },
  { h: "Acil durumlar" },
  {
    p: "Enfeksiyon belirtileri, yüksek ateş, şiddetli ağrı, kötü koku veya hızla kötüleşen bir yara durumunda derhal en yakın sağlık kuruluşuna başvurmalı ya da 112'yi aramalısınız. Saran bir acil servis değildir ve acil tıbbi yardımın yerini tutmaz.",
  },
  { h: "Ödeme ve iptal" },
  {
    p: "Onayladığınız planın ücreti, seçtiğiniz plan türüne göre tahsil edilir. Aboneliğinizi dilediğiniz zaman iptal edebilirsiniz; iptal, içinde bulunduğunuz dönemin sonunda geçerli olur ve sonraki dönem için ücret alınmaz. İade koşulları yürürlükteki mevzuata tabidir.",
  },
  { h: "Kullanıcı yükümlülükleri" },
  {
    p: "Doğru, net ve güncel fotoğraf ile bilgi paylaşmak kullanıcının sorumluluğundadır. Hizmeti yalnızca kendiniz veya bakımından sorumlu olduğunuz kişiler için kullanmalı; üçüncü kişilere ait görselleri onları paylaşmaya izin verir durumda olmadan yüklememelisiniz.",
  },
  { h: "Sorumluluğun sınırlandırılması" },
  {
    p: "Hemşire önerileri, paylaştığınız görseller ve bilgilere dayanan genel bir değerlendirmedir ve kesin tanı niteliği taşımaz. Saran, yanlış veya eksik bilgi nedeniyle ya da önerilerin kişisel olarak uygulanmasından doğabilecek sonuçlardan, yürürlükteki mevzuatın izin verdiği ölçüde sorumlu tutulamaz.",
  },
  { h: "Fikri mülkiyet" },
  {
    p: "Saran markası, içerikleri ve yazılımı dâhil tüm fikri mülkiyet hakları saklıdır. Platform içeriğini izinsiz çoğaltamaz, dağıtamaz veya ticari amaçla kullanamazsınız.",
  },
  { h: "Değişiklikler ve yürürlük" },
  {
    p: "Bu koşullar zaman zaman güncellenebilir. Güncel sürüm bu sayfada yayımlandığı anda yürürlüğe girer. Hizmeti kullanmaya devam etmeniz, güncellenmiş koşulları kabul ettiğiniz anlamına gelir.",
  },
];

export default function TermsPage() {
  return <LegalPage title="Kullanım Koşulları" updated="Son güncelleme: 1 Haziran 2026" blocks={BLOCKS} />;
}
