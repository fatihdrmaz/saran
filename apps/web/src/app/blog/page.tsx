import type { Metadata } from "next";
import Link from "next/link";
import { blogCategories, fetchBlogList } from "../../lib/articles";
import { PageShell } from "../../components/PageShell";
import { Pill, BlurSlot } from "../../components/ui";

export const metadata: Metadata = {
  title: "Yara Bakımı Bilgi Blogu — Saran",
  description:
    "Uzman yara bakım hemşiremizin kaleminden diyabetik ayak, bası yarası, pansuman ve beslenme üzerine güvenilir rehberler.",
  alternates: { canonical: "/blog" },
};

// ISR: panelden yayınlanan makaleler 5 dk içinde görünür (deploy gerekmez)
export const revalidate = 300;

export default async function BlogListPage() {
  const { featured, others } = await fetchBlogList();

  return (
    <PageShell>
      {/* Başlık */}
      <section className="container" style={{ padding: "48px 24px 28px", textAlign: "center" }}>
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
          Yara bakımı rehberi
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 500 }}>Yara bakımı bilgi blogu</h1>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.6,
            color: "var(--text-muted)",
            maxWidth: 560,
            margin: "14px auto 0",
          }}
        >
          Uzman hemşiremizin kaleminden güvenilir, genel bilgilendirme amaçlı rehberler.
        </p>
      </section>

      {/* Kategori çipleri */}
      <nav
        aria-label="Blog kategorileri"
        className="container"
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          flexWrap: "wrap",
          padding: "0 24px 32px",
        }}
      >
        {blogCategories.map((c, i) => (
          <span
            key={c}
            style={{
              background: i === 0 ? "var(--primary)" : "#fff",
              color: i === 0 ? "#fff" : "#3a4f49",
              border: i === 0 ? "none" : "1px solid var(--card-border)",
              fontSize: 14,
              fontWeight: 700,
              padding: "8px 16px",
              borderRadius: "var(--radius-pill)",
            }}
          >
            {c}
          </span>
        ))}
      </nav>

      {/* İçerik yoksa boş durum */}
      {!featured && (
        <section
          className="container"
          style={{ padding: "0 24px 64px", textAlign: "center" }}
        >
          <p style={{ fontSize: 16, color: "var(--text-muted)" }}>
            Şu anda yayında makale bulunmuyor. Yakında yeni rehberlerle buradayız.
          </p>
        </section>
      )}

      {/* Öne çıkan makale */}
      {featured && (
      <section className="container" style={{ padding: "0 24px 24px" }}>
        <Link
          href={`/blog/${featured.slug}`}
          style={{
            display: "flex",
            background: "#fff",
            borderRadius: 24,
            overflow: "hidden",
            border: "1px solid var(--card-border)",
            textDecoration: "none",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: "1 1 320px", minHeight: 240 }}>
            {featured.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element -- harici storage görseli; remotePatterns gerektirmemek için düz img */
              <img
                src={featured.imageUrl}
                alt={`${featured.title} — makale görseli`}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <BlurSlot height={300} gradient={featured.imageGradient} label="Öne çıkan makale görseli" />
            )}
            <Pill
              bg="var(--warm)"
              color="#fff"
              style={{ position: "absolute", left: 18, top: 18 }}
            >
              ÖNE ÇIKAN
            </Pill>
          </div>
          <div style={{ flex: "1 1 360px", padding: 36 }}>
            <Pill bg={featured.categoryColor.bg} color={featured.categoryColor.fg}>
              {featured.chip}
            </Pill>
            <h2 style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.2, margin: "16px 0 12px" }}>
              {featured.title}
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--text-muted)", marginBottom: 20 }}>
              {featured.excerpt}
            </p>
            <span style={{ color: "var(--primary)", fontSize: 15, fontWeight: 700 }}>
              Makaleyi oku →
            </span>
          </div>
        </Link>
      </section>
      )}

      {/* 3'lü ızgara */}
      {others.length > 0 && (
      <section className="container" style={{ padding: "24px 24px 56px" }}>
        <div className="cards-3">
          {others.map((a) => (
            <Link
              key={a.slug}
              href={`/blog/${a.slug}`}
              style={{
                background: "#fff",
                borderRadius: 20,
                overflow: "hidden",
                border: "1px solid var(--card-border)",
                textDecoration: "none",
                display: "block",
              }}
            >
              {a.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element -- harici storage görseli; remotePatterns gerektirmemek için düz img */
                <img
                  src={a.imageUrl}
                  alt={`${a.title} — makale görseli`}
                  style={{ width: "100%", height: 170, objectFit: "cover", display: "block" }}
                />
              ) : (
                <BlurSlot height={170} gradient={a.imageGradient} label={`${a.category} makale görseli`} />
              )}
              <div style={{ padding: 20 }}>
                <Pill bg={a.categoryColor.bg} color={a.categoryColor.fg}>
                  {a.chip}
                </Pill>
                <h3
                  style={{
                    fontSize: 19,
                    fontWeight: 800,
                    fontFamily: "var(--font-body)",
                    lineHeight: 1.25,
                    margin: "12px 0 8px",
                  }}
                >
                  {a.title}
                </h3>
                <div style={{ fontSize: 13, color: "var(--text-muted-alt)" }}>{a.readingLabel}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      )}
    </PageShell>
  );
}
