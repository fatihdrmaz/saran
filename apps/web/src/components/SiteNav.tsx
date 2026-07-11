"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";

/**
 * Sabit üst menü — README §6B, §7. Bölümlere kaydırma (anchor) + dil seçici
 * (TR/EN/AR yalnızca UI) + "Ücretsiz değerlendirme" CTA. Mobilde hamburger menü.
 */

const LOCALES = ["TR", "EN", "AR"] as const;

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Nasıl çalışır", href: "/#nasil-calisir" },
  { label: "Hizmetler", href: "/hizmetler" },
  { label: "Paketler", href: "/#paketler" },
  { label: "Blog", href: "/blog" },
  { label: "S.S.S.", href: "/#sss" },
  { label: "İletişim", href: "/iletisim" },
];

export function SiteNav() {
  const [locale, setLocale] = useState<(typeof LOCALES)[number]>("TR");
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: "var(--nav-h)",
        background: "rgba(245,241,233,.92)",
        backdropFilter: "saturate(180%) blur(10px)",
        borderBottom: "1px solid var(--card-border)",
      }}
    >
      <nav
        className="container"
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <Logo size={30} />
        </Link>

        <div
          className="hide-mobile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{ textDecoration: "none", color: "var(--text-body)" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            role="group"
            aria-label="Dil seçimi"
            className="hide-mobile"
            style={{
              display: "flex",
              border: "1px solid var(--card-border)",
              borderRadius: "var(--radius-pill)",
              overflow: "hidden",
              background: "#fff",
            }}
          >
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLocale(l)}
                aria-pressed={locale === l}
                style={{
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "6px 10px",
                  color: locale === l ? "#fff" : "var(--text-muted)",
                  background: locale === l ? "var(--primary)" : "transparent",
                }}
              >
                {l}
              </button>
            ))}
          </div>

          <Link
            href="/degerlendirme"
            className="hide-mobile"
            style={{
              background: "var(--primary)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              padding: "11px 20px",
              borderRadius: "var(--radius-pill)",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Ücretsiz değerlendirme
          </Link>

          <button
            type="button"
            aria-label="Menü"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            style={{
              display: "none",
              border: "1px solid var(--card-border)",
              background: "#fff",
              borderRadius: 10,
              width: 40,
              height: 40,
              cursor: "pointer",
            }}
            data-mobile-menu
          >
            <span aria-hidden style={{ fontSize: 18 }}>
              {open ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </nav>

      {open && (
        <div
          style={{
            borderTop: "1px solid var(--card-border)",
            background: "var(--bg-cream)",
            padding: "12px 24px 18px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{
                  textDecoration: "none",
                  color: "var(--text-body)",
                  fontWeight: 600,
                  padding: "10px 0",
                  borderBottom: "1px solid var(--card-border)",
                }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/degerlendirme"
              onClick={() => setOpen(false)}
              style={{
                marginTop: 12,
                textAlign: "center",
                background: "var(--primary)",
                color: "#fff",
                fontWeight: 700,
                padding: "12px",
                borderRadius: "var(--radius-pill)",
                textDecoration: "none",
              }}
            >
              Ücretsiz değerlendirme
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          header nav [data-mobile-menu] { display: inline-flex !important; align-items: center; justify-content: center; }
        }
      `}</style>
    </header>
  );
}
