import Link from "next/link";
import { PageShell } from "./PageShell";
import { SectionHeader } from "./ui";
import { Check } from "./Icons";
import type { Service } from "../lib/services";
import { waLink } from "../lib/contact";

/**
 * Yara tipi hizmet sayfası şablonu — /hizmetler/[slug].
 * İçerik src/lib/services.ts'ten gelir; düzen tüm yara tiplerinde ortaktır.
 */

/** "Yara Takibi ile nasıl çalışır" — tüm hizmet sayfalarında ortak 3 adım. */
const HOW_STEPS: [string, string, string][] = [
  [
    "1",
    "Fotoğrafınızı gönderin",
    "Yaranızın fotoğrafını evde çekin, kısa soruları yanıtlayın. İlk değerlendirme ücretsizdir.",
  ],
  [
    "2",
    "Hemşire değerlendirir",
    "Uzman yara bakım hemşiresi fotoğrafı inceler ve size uygun bir bakım planı önerir.",
  ],
  [
    "3",
    "Onaylarsanız takip başlar",
    "Planı beğenirseniz onaylarsınız; düzenli fotoğraf takibi ve mesajlaşma başlar.",
  ],
];

export function ServicePage({ service }: { service: Service }) {
  return (
    <PageShell>
      {/* Başlık + intro */}
      <section className="container" style={{ padding: "48px 24px 8px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Link
            href="/hizmetler"
            style={{
              display: "inline-block",
              fontSize: 13,
              color: "var(--primary)",
              fontWeight: 700,
              marginBottom: 18,
              textDecoration: "none",
            }}
          >
            ← Tüm hizmetler
          </Link>
          <h1 style={{ fontSize: 40, fontWeight: 500, lineHeight: 1.12, marginBottom: 16 }}>
            {service.h1}
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--text-body-alt)" }}>
            {service.intro}
          </p>
        </div>
      </section>

      {/* Neden düzenli takip önemli */}
      <section className="container" style={{ padding: "36px 24px 8px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2 style={{ fontSize: 26, fontWeight: 500, marginBottom: 14 }}>
            Bu yara tipinde neden düzenli takip önemli?
          </h2>
          {service.why.map((p) => (
            <p
              key={p.slice(0, 40)}
              style={{ fontSize: 16, lineHeight: 1.75, color: "var(--text-body)", marginBottom: 16 }}
            >
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* Yara Takibi ile nasıl çalışır */}
      <section
        style={{
          background: "#fff",
          borderTop: "1px solid var(--card-border)",
          borderBottom: "1px solid var(--card-border)",
          padding: "44px 0",
          marginTop: 28,
        }}
      >
        <div className="container">
          <SectionHeader
            eyebrow="Yara Takibi ile nasıl çalışır"
            title="Üç adımda evden uzaktan takip"
          />
          <div className="cards-3">
            {HOW_STEPS.map(([num, title, desc]) => (
              <article
                key={num}
                style={{
                  background: "var(--surface)",
                  borderRadius: 20,
                  padding: 26,
                  border: "1px solid var(--card-border)",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "var(--primary)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 16,
                    marginBottom: 14,
                  }}
                >
                  {num}
                </div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    fontFamily: "var(--font-body)",
                    marginBottom: 8,
                  }}
                >
                  {title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-muted)" }}>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Kimler için uygun */}
      <section className="container" style={{ padding: "40px 24px 8px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2 style={{ fontSize: 26, fontWeight: 500, marginBottom: 16 }}>Kimler için uygun?</h2>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
            {service.suitable.map((item) => (
              <li
                key={item}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 11,
                  fontSize: 15,
                  fontWeight: 600,
                  lineHeight: 1.55,
                  color: "#3a4f49",
                }}
              >
                <span style={{ flexShrink: 0, marginTop: 2 }}>
                  <Check />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* S.S.S. */}
      <section className="container" style={{ padding: "36px 24px 8px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2 style={{ fontSize: 26, fontWeight: 500, marginBottom: 16 }}>Sıkça sorulan sorular</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {service.faq.map(({ q, a }, i) => (
              <details
                key={q}
                open={i === 0}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "16px 22px",
                  border: "1px solid var(--card-border)",
                }}
              >
                <summary
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--text-heading)",
                    cursor: "pointer",
                    listStyle: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {q}
                  <span aria-hidden style={{ color: "var(--primary)", fontSize: 20 }}>
                    +
                  </span>
                </summary>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--text-muted)", margin: "12px 0 0" }}>
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bloğu */}
      <section className="container" style={{ padding: "36px 24px 56px" }}>
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            background: "var(--primary-dark)",
            borderRadius: 22,
            padding: "34px 30px",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: 26, fontWeight: 500, color: "#fff", marginBottom: 10 }}>
            İlk fotoğrafınızı bugün gönderin
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "#a7c9bf", marginBottom: 22 }}>
            İlk değerlendirme ücretsizdir; kart bilgisi istenmez. Sorularınız
            için WhatsApp&apos;tan da yazabilirsiniz.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/degerlendirme"
              style={{
                background: "var(--primary-mid)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 800,
                padding: "14px 26px",
                borderRadius: "var(--radius-pill)",
                textDecoration: "none",
              }}
            >
              Ücretsiz değerlendirme →
            </Link>
            <a
              href={waLink(`Merhaba, ${service.name.toLocaleLowerCase("tr-TR")} takibi hakkında bilgi almak istiyorum.`)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "#25D366",
                color: "#fff",
                fontSize: 15,
                fontWeight: 800,
                padding: "14px 26px",
                borderRadius: "var(--radius-pill)",
                textDecoration: "none",
              }}
            >
              WhatsApp&apos;tan sorun
            </a>
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: "#7fa79c", marginTop: 20 }}>
            Yara Takibi bir uzaktan takip ve danışmanlık hizmetidir; tanı koymaz,
            yüz yüze tıbbi muayenenin veya acil tıbbi yardımın yerini tutmaz.
            Acil durumlarda 112&apos;yi arayın.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
