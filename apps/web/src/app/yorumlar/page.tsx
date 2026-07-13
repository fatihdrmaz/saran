import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../../components/PageShell";
import { ReviewCard } from "../../components/ReviewCard";
import { fetchReviews, hasCaseImages } from "../../lib/reviews";

export const metadata: Metadata = {
  title: "Hasta Yorumları — Yara Takibi Uzaktan Yara Bakımı",
  description:
    "Yara Takibi ile yaralarını uzaktan takip ettiren hastaların gerçek yorumları: bası yarası, diyabetik ayak, cerrahi yara ve daha fazlası. İlk değerlendirme ücretsiz.",
  alternates: { canonical: "/yorumlar" },
};

// ISR: panelden eklenen/onaylanan yorumlar 5 dk içinde görünür (deploy gerekmez)
export const revalidate = 300;

export default async function ReviewsPage() {
  const reviews = await fetchReviews(50);
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <PageShell>
      <section className="container" style={{ padding: "48px 24px 32px", textAlign: "center" }}>
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
          İyileşme hikâyeleri
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 500 }}>Hastalarımız ne diyor?</h1>

        {reviews.length > 0 && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginTop: 16,
              background: "#fff",
              border: "1px solid var(--card-border)",
              borderRadius: "var(--radius-pill)",
              padding: "10px 20px",
            }}
          >
            <span aria-hidden style={{ color: "var(--star)", fontSize: 18 }}>
              ★
            </span>
            <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text-heading)" }}>
              {average.toLocaleString("tr-TR", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
              /5
            </span>
            <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 600 }}>
              · {reviews.length} yorum
            </span>
          </div>
        )}
      </section>

      <section className="container" style={{ padding: "0 24px 40px" }}>
        {reviews.length === 0 ? (
          <div
            style={{
              maxWidth: 560,
              margin: "0 auto",
              textAlign: "center",
              background: "#fff",
              border: "1px solid var(--card-border)",
              borderRadius: 20,
              padding: "40px 28px",
            }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 10 }}>
              Henüz yorum yayınlanmadı
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text-muted)", marginBottom: 20 }}>
              Takibini tamamlayan hastalarımızın deneyimleri yakında burada
              olacak. Siz de ücretsiz değerlendirmeyle başlayabilirsiniz.
            </p>
            <Link
              href="/degerlendirme"
              style={{
                display: "inline-block",
                background: "var(--primary)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 800,
                padding: "13px 26px",
                borderRadius: "var(--radius-pill)",
                textDecoration: "none",
              }}
            >
              Ücretsiz değerlendirme →
            </Link>
          </div>
        ) : (
          <>
            <div className="cards-3" style={{ alignItems: "start" }}>
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
            {reviews.some(hasCaseImages) && (
              <p
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "var(--text-muted-alt)",
                  marginTop: 22,
                }}
              >
                Görseller hasta onaylıdır ve mahremiyet için bulanıklaştırılmıştır.
              </p>
            )}
            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "var(--text-muted-alt)",
                marginTop: 22,
              }}
            >
              Yorumlar, takibini tamamlayan hastalarımızın onayıyla yayınlanır.
            </p>
          </>
        )}
      </section>

      {/* CTA */}
      <section className="container" style={{ padding: "0 24px 56px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            background: "var(--surface-green)",
            borderRadius: 20,
            padding: "26px 30px",
          }}
        >
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 500 }}>Siz de takibinizi başlatın.</h2>
            <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
              İlk değerlendirme ücretsiz; kart bilgisi istenmez.
            </div>
          </div>
          <Link
            href="/degerlendirme"
            style={{
              background: "var(--primary)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 800,
              padding: "14px 26px",
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
