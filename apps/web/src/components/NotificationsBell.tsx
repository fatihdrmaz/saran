"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getSupabase } from "../lib/supabase";
import {
  getPatientNotifications,
  getUnreadCount,
  type PatientNotification,
} from "../lib/notifications";

/**
 * Bildirim zili — yalnızca oturum açıkken görünür. Türetilmiş bildirimler
 * (plan önerisi, hemşire mesajı, ödeme makbuzu) açılır panelde listelenir.
 * Rozet 60 sn'de bir (sekme görünürken) tazelenir.
 */

const REFRESH_MS = 60_000;

function BellIcon({ size = 21 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 15.2V10.8C18 7.6 15.3 5 12 5C8.7 5 6 7.6 6 10.8V15.2L4.5 17.4H19.5L18 15.2Z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <path
        d="M10 20a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatNotifDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

export function NotificationsBell() {
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<PatientNotification[] | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Hafif oturum takibi (SiteNav ile aynı desen).
  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe(): void } | null = null;
    try {
      const supabase = getSupabase();
      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (mounted) setUserId(data.session?.user.id ?? null);
        })
        .catch(() => {});
      // NOT: callback SENKRON tutulur (await yok) — deadlock önlemi.
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserId(session?.user.id ?? null);
      });
      subscription = data.subscription;
    } catch {
      // env eksikse zil hiç görünmez.
    }
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const refreshCount = useCallback(() => {
    if (!userId) return;
    getUnreadCount(userId)
      .then(setCount)
      .catch(() => {});
  }, [userId]);

  // İlk yükleme + 60 sn'de bir tazeleme (yalnızca sekme görünürken).
  useEffect(() => {
    if (!userId) return;
    refreshCount();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") refreshCount();
    }, REFRESH_MS);
    return () => clearInterval(interval);
  }, [userId, refreshCount]);

  // Dışına tıklayınca kapat.
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent | TouchEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open]);

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && userId) {
      setItems(null);
      getPatientNotifications(userId)
        .then(setItems)
        .catch(() => setItems([]));
      refreshCount();
    }
  }

  if (!userId) return null;

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "flex" }}>
      <button
        type="button"
        aria-label={count > 0 ? `Bildirimler (${count} yeni)` : "Bildirimler"}
        aria-expanded={open}
        onClick={toggleOpen}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 38,
          height: 38,
          border: "none",
          borderRadius: 999,
          background: open ? "var(--surface-alt)" : "transparent",
          color: "var(--text-body)",
          cursor: "pointer",
        }}
      >
        <BellIcon />
        {count > 0 && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: 3,
              right: 2,
              minWidth: 16,
              height: 16,
              padding: "0 4px",
              borderRadius: 999,
              background: "var(--danger)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 800,
              lineHeight: "16px",
              textAlign: "center",
            }}
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Bildirimler"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: "min(340px, calc(100vw - 48px))",
            background: "#fff",
            border: "1px solid var(--card-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-card)",
            zIndex: 60,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              fontSize: 14,
              fontWeight: 800,
              color: "var(--text-heading)",
              borderBottom: "1px solid var(--card-border)",
            }}
          >
            Bildirimler
          </div>

          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {items === null ? (
              <div style={{ padding: "18px 16px", fontSize: 14, color: "var(--text-muted)" }}>
                Yükleniyor…
              </div>
            ) : items.length === 0 ? (
              <div style={{ padding: "18px 16px", fontSize: 14, color: "var(--text-muted)" }}>
                Yeni bildiriminiz yok.
              </div>
            ) : (
              items.map((n, i) => (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "block",
                    padding: "12px 16px",
                    textDecoration: "none",
                    borderTop: i === 0 ? "none" : "1px solid var(--card-border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-heading)" }}>
                      {n.title}
                    </span>
                    <span
                      style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}
                    >
                      {formatNotifDate(n.date)}
                    </span>
                  </div>
                  {n.detail && (
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                      {n.detail}
                    </div>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
