import type { Metadata } from "next";
import Link from "next/link";
import { FIRST_ASSESSMENT_FREE } from "@saran/shared";
import { colors } from "@saran/tokens";
import { PageShell } from "../components/PageShell";
import { SectionHeader, BlurSlot, Pill } from "../components/ui";
import { Check } from "../components/Icons";
import { HeroMockup } from "../components/HeroMockup";
import { fetchReviews } from "../lib/reviews";
import { fetchProducts } from "../lib/products";
import { JsonLd, faqJsonLd } from "../components/JsonLd";

export const metadata: Metadata = {
  title: "Yara Takibi — Uzaktan Yara Bakımı & Takibi",
  description:
    "Yaranızın fotoğrafını gönderin, uzman yara bakım hemşireniz değerlendirsin ve bakım planı önersin. İlk değerlendirme ücretsiz. Onaylarsanız takip başlar.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Yara Takibi — Uzaktan Yara Bakımı & Takibi",
    description:
      "Fotoğrafınızı gönderin, hemşire değerlendirsin. İlk değerlendirme ücretsiz.",
    type: "website",
  },
};

/** Kuruş integer → "₺X.XXX" gösterim (README: para kuruş integer taşınır). */
function priceLabel(kurus: number): string {
  const lira = Math.round(kurus / 100);
  return "₺" + lira.toLocaleString("tr-TR");
}

const HOW_STEPS = [
  ["1", "Fotoğrafınızı gönderin", "Yaranızın fotoğrafını çekin, kısa soruları yanıtlayın."],
  ["2", "Hemşire değerlendirir", "Uzman hemşireniz durumu inceler, size bir bakım planı önerir."],
  ["3", "İyileşmeyi takip edin", "Önce/sonra ve zaman çizelgesiyle iyileşmeyi net görün."],
];

const PRICING_LOGIC: [string, string, boolean][] = [
  ["1 · Ücretsiz değerlendirme", "Yara fotoğrafınızı gönderin. Bu adım için ödeme alınmaz, kart bilgisi istenmez.", false],
  ["2 · Hemşire plan önerir", "Uzman hemşireniz yaranızı değerlendirir ve durumunuza uygun bakım planını önerir.", false],
  ["3 · Onaylarsanız başlar", "Planı beğenirseniz onaylayın, takibiniz başlasın. İstediğiniz an iptal edebilirsiniz.", true],
];

const WHO_FOR: [string, string, string][] = [
  ["Bası yaraları", "Yatağa bağımlı hastalarda dekübit yaralarının takibi.", "/hizmetler/basi-yarasi"],
  ["Diyabetik ayak", "Diyabete bağlı ayak ülserlerinde erken müdahale.", "/hizmetler/diyabetik-ayak"],
  ["Cerrahi yaralar", "Ameliyat sonrası dikiş bölgesi bakımının izlenmesi.", "/hizmetler/cerrahi-yara"],
  ["Yanık yarası", "Yanık bölgesinin iyileşme takibi ve gözlemi.", "/hizmetler/yanik"],
];

/** Güven çubuğu — uydurma istatistik yerine doğrulanabilir, iddiasız vaatler. */
const TRUST_ITEMS: [string, string][] = [
  ["Ücretsiz", "ilk değerlendirme"],
  ["Aynı gün", "genellikle yanıt"],
  ["Şifreli", "uçtan uca görseller"],
  ["KVKK", "uyumlu saklama"],
];


const FAQ: [string, string][] = [
  [
    "Fotoğraflarım güvende mi?",
    "Tüm görselleriniz uçtan uca şifrelenir ve yalnızca size atanan hemşireniz görebilir. Yara fotoğrafları özel nitelikli sağlık verisi olarak KVKK'ya uygun şekilde korunur.",
  ],
  [
    "Ne kadar sürede yanıt alırım?",
    "İlk değerlendirme genellikle birkaç saat içinde tamamlanır. Plan öneriniz hazır olduğunda bildirim alırsınız.",
  ],
  [
    "Bu hizmet doktor muayenesinin yerine geçer mi?",
    "Hayır. Yara Takibi uzaktan takip ve danışmanlık hizmetidir; yüz yüze tıbbi muayenenin veya acil tıbbi yardımın yerini tutmaz.",
  ],
  [
    "Aboneliğimi istediğim zaman iptal edebilir miyim?",
    "Evet. Aboneliğinizi dilediğiniz zaman iptal edebilirsiniz; iptal bir sonraki dönem için geçerli olur.",
  ],
];

// ISR: fiyat/yorum panelden değişince 5 dk içinde siteye yansır (deploy gerekmez)
export const revalidate = 300;

export default async function HomePage() {
  const [reviews, products] = await Promise.all([fetchReviews(), fetchProducts()]);
  // "EN POPÜLER" rozeti aylık planda; yoksa ortadaki ürün öne çıkar
  const popularCode =
    products.find((p) => p.code === "monthly")?.code ??
    products[Math.floor(products.length / 2)]?.code;

  return (
    <PageShell>
      <JsonLd data={faqJsonLd(FAQ)} />
      {/* HERO */}
      <section className="container" style={{ padding: "56px 24px" }}>
        <div className="two-col">
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--surface-green)",
                color: "var(--primary)",
                fontSize: 13,
                fontWeight: 700,
                padding: "7px 14px",
                borderRadius: "var(--radius-pill)",
                marginBottom: 22,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--primary-mid)",
                }}
              />
              Uzaktan yara bakımı & takip
            </div>
            <h1
              style={{ fontSize: 52, lineHeight: 1.05, fontWeight: 500 }}
            >
              Yaranız iyileşene kadar{" "}
              <em style={{ color: "var(--primary)" }}>uzaktan yanınızdayız.</em>
            </h1>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.6,
                color: colors.textBodyAlt,
                maxWidth: 460,
                margin: "20px 0 28px",
              }}
            >
              Fotoğrafınızı gönderin, uzman yara bakım hemşireniz değerlendirsin.
              {FIRST_ASSESSMENT_FREE ? " İlk değerlendirme ücretsiz." : ""}
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link
                href="/degerlendirme"
                style={{
                  background: "var(--primary)",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  padding: "15px 26px",
                  borderRadius: "var(--radius-pill)",
                  textDecoration: "none",
                }}
              >
                Hemen başlayın
              </Link>
              <Link
                href="/blog"
                style={{
                  color: "var(--text-heading)",
                  fontSize: 16,
                  fontWeight: 700,
                  padding: "15px 22px",
                  borderRadius: "var(--radius-pill)",
                  border: "1.5px solid #d8d2c4",
                  textDecoration: "none",
                }}
              >
                Blogu keşfet
              </Link>
            </div>
          </div>
          <div>
            <div
              style={{
                background: "#fff",
                borderRadius: 24,
                padding: 12,
                boxShadow: "var(--shadow-elevated)",
                border: "1px solid var(--card-border)",
              }}
            >
              <HeroMockup />
            </div>
          </div>
        </div>
      </section>

      {/* NASIL ÇALIŞIR */}
      <section
        id="nasil-calisir"
        style={{
          background: "#fff",
          borderTop: "1px solid var(--card-border)",
          padding: "52px 0",
        }}
      >
        <div className="container">
          <SectionHeader eyebrow="Nasıl çalışır" title="Üç adımda evden yara takibi" />
          <div className="cards-3">
            {HOW_STEPS.map(([num, title, desc]) => (
              <article
                key={num}
                style={{
                  background: "var(--surface)",
                  borderRadius: 20,
                  padding: 28,
                  border: "1px solid var(--card-border)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 13,
                    background: "var(--primary)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 17,
                    marginBottom: 16,
                  }}
                >
                  {num}
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 800, fontFamily: "var(--font-body)", marginBottom: 8 }}>
                  {title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-muted)" }}>
                  {desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ÜCRET MANTIĞI */}
      <section
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--card-border)",
          padding: "52px 0",
        }}
      >
        <div className="container">
          <SectionHeader
            eyebrow="Nasıl ücretlendirilir"
            title="Önce görün, sonra karar verin"
          />
          <div className="cards-3">
            {PRICING_LOGIC.map(([title, desc, accent]) => (
              <article
                key={title}
                style={{
                  background: accent ? "var(--primary)" : "#fff",
                  color: accent ? "#fff" : "var(--text-heading)",
                  borderRadius: 20,
                  padding: 26,
                  border: accent ? "none" : "1px solid var(--card-border)",
                }}
              >
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    fontFamily: "var(--font-body)",
                    color: accent ? "#fff" : "var(--text-heading)",
                    marginBottom: 6,
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: accent ? "#d7eae3" : "var(--text-muted)",
                  }}
                >
                  {desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ÖNCE / SONRA */}
      <section style={{ padding: "52px 0" }}>
        <div className="container two-col">
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "var(--primary)",
                marginBottom: 10,
              }}
            >
              İlerlemeyi görün
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 500, lineHeight: 1.15, marginBottom: 14 }}>
              Önce ve sonra, yan yana.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: colors.textBodyAlt, marginBottom: 20 }}>
              Her gönderdiğiniz fotoğraf zaman çizelgesine eklenir. Tüm görseller
              hasta onayıyla ve bulanıklaştırılmış olarak saklanır.
            </p>
            {[
              "Tarih damgalı, sıralı arşiv",
              "İyileşme yüzdesi ölçümü",
              "KVKK uyumlu, şifreli saklama",
            ].map((row) => (
              <div
                key={row}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#3a4f49",
                  marginBottom: 12,
                }}
              >
                <Check />
                {row}
              </div>
            ))}
          </div>
          <div
            style={{
              position: "relative",
              borderRadius: 20,
              overflow: "hidden",
              aspectRatio: "16 / 11",
              border: "1px solid var(--card-border)",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, #c9a593, #a87a66)",
                filter: "blur(7px)",
              }}
            />
            <div style={{ position: "absolute", inset: 0, width: "52%", overflow: "hidden" }}>
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(135deg, #d8c0a0, #bfa07f)",
                  filter: "blur(7px)",
                }}
              />
            </div>
            <span
              style={{
                position: "absolute",
                left: 18,
                top: 16,
                background: "rgba(24,48,42,.78)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                padding: "5px 11px",
                borderRadius: "var(--radius-pill)",
              }}
            >
              Sonra · 14. gün
            </span>
            <span
              style={{
                position: "absolute",
                right: 18,
                top: 16,
                background: "rgba(24,48,42,.78)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                padding: "5px 11px",
                borderRadius: "var(--radius-pill)",
              }}
            >
              Önce · 1. gün
            </span>
            <div
              aria-hidden
              style={{ position: "absolute", top: 0, bottom: 0, left: "52%", width: 3, background: "#fff" }}
            />
          </div>
        </div>
      </section>

      {/* PAKETLER */}
      <section id="paketler" style={{ background: "var(--primary-dark)", padding: "56px 0" }}>
        <div className="container">
          <SectionHeader eyebrow="Paketler" title="Size uygun bakım planı" onDark />
          <div className="cards-3" style={{ alignItems: "stretch" }}>
            {products.map((p) => {
              const popular = p.code === popularCode;
              const features = [
                `${p.durationDays} gün takip süresi`,
                "Sınırsız fotoğraf gönderimi",
                "Anlık mesajlaşma",
                "İyileşme zaman çizelgesi",
              ];
              return (
                <article
                  key={p.id}
                  style={
                    popular
                      ? { background: "#fff", borderRadius: 22, padding: 30, position: "relative" }
                      : {
                          background: "#114a3e",
                          borderRadius: 22,
                          padding: 28,
                          border: "1px solid #1c5e50",
                        }
                  }
                >
                  {popular && (
                    <Pill
                      bg="var(--warm)"
                      color="#fff"
                      style={{
                        position: "absolute",
                        top: -13,
                        left: "50%",
                        transform: "translateX(-50%)",
                      }}
                    >
                      EN POPÜLER
                    </Pill>
                  )}
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: popular ? "var(--primary)" : "#9fe6d6",
                    }}
                  >
                    {p.title}
                  </div>
                  <div
                    style={{
                      fontSize: popular ? 36 : 34,
                      fontWeight: 800,
                      color: popular ? "var(--text-heading)" : "#fff",
                      margin: "4px 0",
                    }}
                  >
                    {priceLabel(p.priceKurus)}
                  </div>
                  {p.description && (
                    <p
                      style={{
                        fontSize: 14,
                        color: popular ? "var(--text-muted)" : "#a7c9bf",
                        marginBottom: 16,
                      }}
                    >
                      {p.description}
                    </p>
                  )}
                  {features.map((t) => (
                    <div
                      key={t}
                      style={{
                        fontSize: 14,
                        color: popular ? "var(--text-body)" : "#d7eae3",
                        marginBottom: 8,
                      }}
                    >
                      ✓ {t}
                    </div>
                  ))}
                  {popular && (
                    <Link
                      href="/degerlendirme"
                      style={{
                        display: "block",
                        marginTop: 12,
                        textAlign: "center",
                        background: "var(--primary)",
                        color: "#fff",
                        fontWeight: 800,
                        padding: 12,
                        borderRadius: "var(--radius-pill)",
                        textDecoration: "none",
                      }}
                    >
                      Ücretsiz başla
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
          <p
            style={{
              textAlign: "center",
              color: "#7fa79c",
              fontSize: 13,
              marginTop: 22,
            }}
          >
            Fiyatlandırma plan onayında geçerlidir; ilk değerlendirme her zaman ücretsizdir.
          </p>
        </div>
      </section>

      {/* İYİLEŞME HİKÂYELERİ + GÜVEN ÇUBUĞU */}
      <section style={{ padding: "56px 0" }}>
        <div className="container">
          {reviews.length > 0 && (
            <SectionHeader eyebrow="İyileşme hikâyeleri" title="Yaraları gerçekten iyileşti." />
          )}

          {/* güven çubuğu — doğrulanabilir vaatler */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              maxWidth: 760,
              margin: "0 auto 34px",
              background: "#fff",
              border: "1px solid var(--card-border)",
              borderRadius: 18,
              overflow: "hidden",
            }}
          >
            {TRUST_ITEMS.map(([big, small], i, arr) => (
              <div key={small} style={{ display: "flex", flex: "1 1 150px" }}>
                <div style={{ flex: 1, textAlign: "center", padding: 20 }}>
                  <div style={{ fontSize: 19, fontWeight: 800, color: "var(--text-heading)" }}>{big}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>{small}</div>
                </div>
                {i < arr.length - 1 && <div style={{ width: 1, background: "var(--card-border)" }} />}
              </div>
            ))}
          </div>

          {reviews.length > 0 && (
            <>
              <div className="cards-3">
                {reviews.map((s) => (
                  <article
                    key={s.id}
                    style={{
                      background: "#fff",
                      borderRadius: 22,
                      padding: 18,
                      border: "1px solid var(--card-border)",
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                      <BlurSlot gradient={s.before} aspectRatio="4 / 3" radius={12} label="Önce görseli (hasta onaylı, bulanık)">
                        <span
                          style={{
                            position: "absolute",
                            left: 7,
                            top: 7,
                            background: "rgba(24,48,42,.72)",
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 6,
                          }}
                        >
                          Önce
                        </span>
                      </BlurSlot>
                      <BlurSlot gradient={s.after} aspectRatio="4 / 3" radius={12} label="Sonra görseli (hasta onaylı, bulanık)">
                        <span
                          style={{
                            position: "absolute",
                            left: 7,
                            top: 7,
                            background: "rgba(31,163,122,.9)",
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 6,
                          }}
                        >
                          Sonra
                        </span>
                      </BlurSlot>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                      <Pill bg="var(--success-bg)" color="var(--success-text)">{s.woundLabel}</Pill>
                      {s.durationLabel && (
                        <Pill bg="var(--surface-alt)" color="var(--text-muted)">{s.durationLabel}</Pill>
                      )}
                    </div>
                    <p
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: 17,
                        lineHeight: 1.55,
                        color: "#2a3d38",
                        fontStyle: "italic",
                        marginBottom: 16,
                      }}
                    >
                      “{s.quote}”
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "#cfe6dd",
                          color: "var(--primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                        }}
                      >
                        {s.initial}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-heading)" }}>{s.name}</div>
                        <div
                          aria-label={`${s.rating} / 5 yıldız`}
                          style={{ fontSize: 13, color: "var(--star-text, #b7791f)", letterSpacing: 1 }}
                        >
                          <span aria-hidden>
                            {"★".repeat(s.rating)}
                            <span style={{ opacity: 0.3 }}>{"★".repeat(5 - s.rating)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted-alt)", marginTop: 20 }}>
                Görseller hasta onaylıdır ve mahremiyet için bulanıklaştırılmıştır.
              </p>
              <p style={{ textAlign: "center", marginTop: 14 }}>
                <Link
                  href="/yorumlar"
                  style={{ fontSize: 14, fontWeight: 800, color: "var(--primary)", textDecoration: "none" }}
                >
                  Tüm yorumlar →
                </Link>
              </p>
            </>
          )}
        </div>
      </section>

      {/* KİMLER İÇİN */}
      <section style={{ background: "var(--surface)", padding: "52px 0" }}>
        <div className="container">
          <SectionHeader eyebrow="Kimler için" title="Hangi yaralarda yardımcı oluyoruz?" />
          <div className="cards-4">
            {WHO_FOR.map(([title, desc, href]) => (
              <Link
                key={title}
                href={href}
                style={{
                  display: "block",
                  background: "#fff",
                  borderRadius: 18,
                  padding: 24,
                  border: "1px solid var(--card-border)",
                  borderTop: "3px solid var(--primary)",
                  textDecoration: "none",
                }}
              >
                <h3 style={{ fontSize: 17, fontWeight: 800, fontFamily: "var(--font-body)", marginBottom: 6 }}>
                  {title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--text-muted)", marginBottom: 10 }}>{desc}</p>
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--primary)" }}>
                  Ayrıntılı bilgi →
                </span>
              </Link>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 22 }}>
            <Link
              href="/hizmetler"
              style={{ fontSize: 14, fontWeight: 800, color: "var(--primary)", textDecoration: "none" }}
            >
              Tüm hizmetlerimizi inceleyin →
            </Link>
          </p>
        </div>
      </section>

      {/* S.S.S. */}
      <section id="sss" style={{ background: "var(--surface)", padding: "52px 0" }}>
        <div className="container">
          <SectionHeader eyebrow="S.S.S." title="Sıkça sorulan sorular" />
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQ.map(([q, a], i) => (
              <details
                key={q}
                open={i === 0}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "18px 24px",
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
                  }}
                >
                  {q}
                  <span aria-hidden style={{ color: "var(--primary)", fontSize: 20 }}>
                    +
                  </span>
                </summary>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text-muted)", margin: "12px 0 0" }}>
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ALT CTA */}
      <section style={{ padding: "48px 0" }}>
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 500 }}>Bugün ilk fotoğrafınızı gönderin.</h2>
            <div style={{ fontSize: 15, color: "var(--text-muted)", marginTop: 6 }}>
              İlk değerlendirme ücretsiz. Kredi kartı gerekmez.
            </div>
          </div>
          <Link
            href="/degerlendirme"
            style={{
              background: "var(--primary)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 800,
              padding: "15px 28px",
              borderRadius: "var(--radius-pill)",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Ücretsiz başla →
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
