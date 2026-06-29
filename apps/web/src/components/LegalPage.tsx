import Link from "next/link";
import { PageShell } from "./PageShell";

export type LegalBlock =
  | { h: string; id?: string }
  | { p: string };

/** Yapılandırılmış yasal sayfa düzeni — README §6B, §11. */
export function LegalPage({
  title,
  updated,
  blocks,
}: {
  title: string;
  updated: string;
  blocks: LegalBlock[];
}) {
  return (
    <PageShell>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 48px" }}>
        <Link
          href="/"
          style={{
            display: "inline-block",
            fontSize: 13,
            color: "var(--primary)",
            fontWeight: 700,
            marginBottom: 18,
            textDecoration: "none",
          }}
        >
          ← Ana sayfa
        </Link>
        <h1 style={{ fontSize: 38, fontWeight: 500, margin: "0 0 8px" }}>{title}</h1>
        <div style={{ fontSize: 14, color: "var(--text-muted-alt)", marginBottom: 28 }}>{updated}</div>

        {blocks.map((b, i) =>
          "h" in b ? (
            <h2
              key={i}
              id={b.id}
              style={{ fontSize: 22, fontWeight: 500, margin: "28px 0 12px", scrollMarginTop: 88 }}
            >
              {b.h}
            </h2>
          ) : (
            <p key={i} style={{ fontSize: 16, lineHeight: 1.75, color: "var(--text-body)", margin: "0 0 16px" }}>
              {b.p}
            </p>
          ),
        )}
      </div>
    </PageShell>
  );
}
