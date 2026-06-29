import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchArticle, fetchArticleSlugs } from "../../../lib/articles";
import { PageShell } from "../../../components/PageShell";
import { Pill, BlurSlot } from "../../../components/ui";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await fetchArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  if (!article) return { title: "Makale bulunamadı — Saran" };
  return {
    title: `${article.title} — Saran Blog`,
    description: article.intro,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.intro,
      type: "article",
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  if (!article) notFound();

  return (
    <PageShell>
      <article style={{ maxWidth: 760, margin: "0 auto", padding: "32px 0 48px" }}>
        <div style={{ padding: "0 24px" }}>
          <Link
            href="/blog"
            style={{
              display: "inline-block",
              fontSize: 13,
              color: "var(--primary)",
              fontWeight: 700,
              marginBottom: 20,
              textDecoration: "none",
            }}
          >
            ← Blog
          </Link>
          <div>
            <Pill bg={article.categoryColor.bg} color={article.categoryColor.fg}>
              {article.chip}
            </Pill>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 500, lineHeight: 1.15, margin: "18px 0 16px" }}>
            {article.title}
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--text-muted)", marginBottom: 24 }}>
            {article.intro}
          </p>

          {/* Yazar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "16px 0",
              borderTop: "1px solid var(--card-border)",
              borderBottom: "1px solid var(--card-border)",
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#cfe6dd",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
              }}
            >
              {article.author.initial}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-heading)" }}>
                {article.author.name}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted-alt)" }}>
                {article.author.title} · {article.readingLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Kapak görseli */}
        <BlurSlot height={340} gradient={article.imageGradient} label="Makale kapak görseli (bulanık placeholder)" />

        {/* Gövde */}
        <div style={{ padding: "28px 24px 0" }}>
          {article.body.map((b, i) => {
            if (b.type === "h2") {
              return (
                <h2 key={i} style={{ fontSize: 26, fontWeight: 500, margin: "30px 0 14px" }}>
                  {b.text}
                </h2>
              );
            }
            if (b.type === "note") {
              return (
                <aside
                  key={i}
                  style={{
                    background: "var(--surface-green)",
                    borderLeft: "4px solid var(--primary)",
                    borderRadius: "0 14px 14px 0",
                    padding: "18px 22px",
                    margin: "24px 0",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--primary)", marginBottom: 6 }}>
                    💡 Hemşire notu
                  </div>
                  <p style={{ fontSize: 16, lineHeight: 1.6, color: "#236b59", margin: 0 }}>{b.text}</p>
                </aside>
              );
            }
            return (
              <p key={i} style={{ fontSize: 17, lineHeight: 1.75, color: "var(--text-body)", margin: "0 0 20px" }}>
                {b.text}
              </p>
            );
          })}

          {/* Alt CTA */}
          <div
            style={{
              background: "var(--primary-dark)",
              borderRadius: 20,
              padding: 28,
              margin: "18px 0 0",
              display: "flex",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 240px" }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 500, color: "#fff", lineHeight: 1.25 }}>
                Bir yara mı fark ettiniz?
              </div>
              <p style={{ fontSize: 15, color: "#a7c9bf", margin: "8px 0 0" }}>
                İlk fotoğrafınızı gönderin, ücretsiz değerlendirelim.
              </p>
            </div>
            <Link
              href="/degerlendirme"
              style={{
                background: "var(--primary-mid)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 800,
                padding: "14px 24px",
                borderRadius: "var(--radius-pill)",
                whiteSpace: "nowrap",
                textDecoration: "none",
              }}
            >
              Ücretsiz başla →
            </Link>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
