import Link from "next/link";
import { Logo } from "./Logo";

/** Footer — README §6B (yasal + keşfet linkleri), §11 yasal vurgusu. */
export function SiteFooter() {
  const linkStyle = {
    textDecoration: "none",
    color: "#a7c9bf",
    fontSize: 14,
  } as const;

  return (
    <footer style={{ background: "var(--primary-dark)", color: "#a7c9bf" }}>
      <div
        className="container"
        style={{ padding: "44px 24px 28px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 32,
          }}
        >
          <div style={{ maxWidth: 280 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 12,
              }}
            >
              <Logo variant="light" />
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6 }}>
              Uzaktan yara bakımı ve takibi. Yara Takibi bir uzaktan takip
              hizmetidir; acil tıbbi yardımın yerini tutmaz.
            </p>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "var(--teal-light)",
                marginBottom: 4,
              }}
            >
              Yasal
            </div>
            <Link href="/kvkk" style={linkStyle}>
              KVKK & Gizlilik
            </Link>
            <Link href="/kosullar" style={linkStyle}>
              Kullanım Koşulları
            </Link>
            <Link href="/mesafeli-satis" style={linkStyle}>
              Mesafeli Satış Sözleşmesi
            </Link>
            <Link href="/iptal-iade" style={linkStyle}>
              İptal ve İade Politikası
            </Link>
            <Link href="/cerez-politikasi" style={linkStyle}>
              Çerez Politikası
            </Link>
          </nav>

          <nav style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "var(--teal-light)",
                marginBottom: 4,
              }}
            >
              Keşfet
            </div>
            <Link href="/hizmetler" style={linkStyle}>
              Hizmetler
            </Link>
            <Link href="/blog" style={linkStyle}>
              Blog
            </Link>
            <Link href="/yorumlar" style={linkStyle}>
              Hasta yorumları
            </Link>
            <Link href="/degerlendirme" style={linkStyle}>
              Ücretsiz değerlendirme
            </Link>
            <Link href="/hesabim" style={linkStyle}>
              Hesabım
            </Link>
            <Link href="/#sss" style={linkStyle}>
              S.S.S.
            </Link>
            <Link href="/iletisim" style={linkStyle}>
              İletişim
            </Link>
          </nav>
        </div>

        <div
          style={{
            borderTop: "1px solid #1c5e50",
            marginTop: 28,
            paddingTop: 18,
            fontSize: 12,
          }}
        >
          © 2026 Yara Takibi · Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
