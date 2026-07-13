import { Pill } from "./ui";
import { BeforeAfter } from "./BeforeAfter";
import { hasCaseImages, type Review } from "../lib/reviews";

/**
 * İyileşme hikâyesi yorum kartı — ana sayfa ve /yorumlar ortak bileşeni.
 *
 * Görsel bloğu YALNIZCA hasta onaylı (consent_confirmed) VE her iki görsel de
 * mevcutsa gösterilir; aksi halde kart sade metin (alıntı + ad + etiketler)
 * olarak render edilir. Sahte degrade önce/sonra blokları KALDIRILMIŞTIR.
 */
export function ReviewCard({ review }: { review: Review }) {
  const showImages = hasCaseImages(review);

  return (
    <article
      style={{
        background: "#fff",
        borderRadius: 22,
        padding: 18,
        border: "1px solid var(--card-border)",
      }}
    >
      {showImages && (
        <BeforeAfter
          beforeUrl={review.beforeImageUrl as string}
          afterUrl={review.afterImageUrl as string}
        />
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <Pill bg="var(--success-bg)" color="var(--success-text)">
          {review.woundLabel}
        </Pill>
        {review.durationLabel && (
          <Pill bg="var(--surface-alt)" color="var(--text-muted)">
            {review.durationLabel}
          </Pill>
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
        “{review.quote}”
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
          {review.initial}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-heading)" }}>
            {review.name}
          </div>
          <div
            aria-label={`${review.rating} / 5 yıldız`}
            style={{ fontSize: 13, color: "var(--star-text, #b7791f)", letterSpacing: 1 }}
          >
            <span aria-hidden>
              {"★".repeat(review.rating)}
              <span style={{ opacity: 0.3 }}>{"★".repeat(5 - review.rating)}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
