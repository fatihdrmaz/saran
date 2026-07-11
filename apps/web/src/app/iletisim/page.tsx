import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../../components/PageShell";
import { CONTACT, waLink } from "../../lib/contact";

export const metadata: Metadata = {
  title: "İletişim — Yara Takibi Uzaktan Yara Bakımı",
  description:
    "Yara Takibi ekibine WhatsApp veya e-posta ile ulaşın. Her gün 09.00–21.00 arası yanıtlıyoruz. İlk yara değerlendirmesi ücretsizdir.",
  alternates: { canonical: "/iletisim" },
};

// NOT: Numara ve e-posta src/lib/contact.ts içindeki PLACEHOLDER değerlerdir;
// gerçek bilgiler gelince yalnızca o dosya güncellenecek.
export default function ContactPage() {
  const cardStyle = {
    background: "#fff",
    borderRadius: 20,
    padding: 28,
    border: "1px solid var(--card-border)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  } as const;

  return (
    <PageShell>
      <section className="container" style={{ padding: "48px 24px 24px", textAlign: "center" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "var(--primary)",
            marginBottom: 12,
          }}
        >
          İletişim
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 500 }}>Size nasıl yardımcı olabiliriz?</h1>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.6,
            color: "var(--text-muted)",
            maxWidth: 560,
            margin: "14px auto 0",
          }}
        >
          Sorularınız için bize WhatsApp veya e-posta ile ulaşabilirsiniz.
          Mesajlarınızı {CONTACT.hours.toLocaleLowerCase("tr-TR")} arasında yanıtlıyoruz.
        </p>
      </section>

      <section className="container" style={{ padding: "16px 24px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            maxWidth: 760,
            margin: "0 auto",
          }}
        >
          {/* WhatsApp kartı */}
          <article style={cardStyle}>
            <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-body)" }}>
              WhatsApp
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text-muted)" }}>
              En hızlı yanıtı WhatsApp üzerinden alırsınız. Yaranızla ilgili
              sorularınızı yazın, ekibimiz size yardımcı olsun.
            </p>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-heading)" }}>
              {CONTACT.whatsappDisplay}
            </div>
            <a
              href={waLink("Merhaba, yara değerlendirmesi hakkında bilgi almak istiyorum.")}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                textAlign: "center",
                background: "#25D366",
                color: "#fff",
                fontSize: 15,
                fontWeight: 800,
                padding: "13px 24px",
                borderRadius: "var(--radius-pill)",
                textDecoration: "none",
                marginTop: "auto",
              }}
            >
              WhatsApp&apos;tan yazın
            </a>
          </article>

          {/* E-posta kartı */}
          <article style={cardStyle}>
            <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-body)" }}>
              E-posta
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text-muted)" }}>
              Ayrıntılı sorularınız veya belge paylaşımı için e-posta
              gönderebilirsiniz. Genellikle aynı gün dönüş yapıyoruz.
            </p>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-heading)" }}>
              {CONTACT.email}
            </div>
            <a
              href={`mailto:${CONTACT.email}`}
              style={{
                display: "inline-block",
                textAlign: "center",
                background: "var(--primary)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 800,
                padding: "13px 24px",
                borderRadius: "var(--radius-pill)",
                textDecoration: "none",
                marginTop: "auto",
              }}
            >
              E-posta gönderin
            </a>
          </article>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "var(--text-muted)",
            margin: "22px auto 0",
            maxWidth: 560,
          }}
        >
          Yanıt saatleri: <strong>{CONTACT.hours}</strong> · Bu saatler dışında
          gelen mesajlar ertesi sabah yanıtlanır.
        </p>
      </section>

      {/* CTA */}
      <section className="container" style={{ padding: "16px 24px 56px" }}>
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            background: "var(--surface-green)",
            borderRadius: 20,
            padding: "28px 28px",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 500, marginBottom: 8 }}>
            Yaranız için hemen değerlendirme isteyin
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 18 }}>
            İlk değerlendirme ücretsizdir; kart bilgisi istenmez. Fotoğrafınızı
            gönderin, uzman hemşiremiz incelesin.
          </p>
          <Link
            href="/degerlendirme"
            style={{
              display: "inline-block",
              background: "var(--primary)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 800,
              padding: "14px 28px",
              borderRadius: "var(--radius-pill)",
              textDecoration: "none",
            }}
          >
            Ücretsiz değerlendirme →
          </Link>
          <p style={{ fontSize: 12, color: "var(--text-muted-alt)", marginTop: 16 }}>
            Yara Takibi bir uzaktan takip ve danışmanlık hizmetidir; acil tıbbi
            yardımın yerini tutmaz. Acil durumlarda 112&apos;yi arayın.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
