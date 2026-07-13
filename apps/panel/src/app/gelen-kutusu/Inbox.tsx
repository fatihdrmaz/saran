"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trackingBadge } from "@saran/shared";
import type { Database } from "@saran/supabase";
import { Button, Card, StatusBadge } from "../../components/ui";
import { isWoundImagePath, LiveWoundPhoto } from "../../components/LiveWoundPhoto";
import { useAuth } from "../../lib/auth";
import { formatRelative, woundTypeLabel } from "../../lib/labels";
import {
  fetchConversations,
  fetchMessages,
  nameInitials,
  sendMessage,
  type ConversationWithMeta,
} from "../../lib/queries";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

export function Inbox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithMeta[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchConversations(user.id)
      .then((c) => {
        if (!active) return;
        setConversations(c);
        setActiveId(c[0]?.id ?? null);
        setLoading(false);
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let active = true;
    fetchMessages(activeId)
      .then((m) => active && setMessages(m))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [activeId]);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const send = async () => {
    if (!draft.trim() || !activeId || !user) return;
    setSending(true);
    try {
      const msg = await sendMessage(activeId, user.id, draft.trim());
      setMessages((m) => [...m, msg]);
      setDraft("");
    } catch {
      /* sessiz */
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div style={{ color: "var(--text-muted)" }}>Yükleniyor…</div>;
  if (conversations.length === 0)
    return <div style={{ color: "var(--text-muted)" }}>Henüz konuşma yok.</div>;

  return (
    <div
      className="split-2col"
      style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16, alignItems: "start" }}
    >
      {/* Konuşma listesi */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {conversations.map((c) => {
          const isActive = c.id === activeId;
          return (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              style={{
                width: "100%",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                background: isActive ? "var(--surface-green)" : "#fff",
                border: "none",
                borderBottom: "1px solid var(--card-border)",
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  background: "var(--surface-green)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {nameInitials(c.patientName)}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color: "var(--text-heading)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.patientName}
                    {c.woundType ? ` · ${woundTypeLabel[c.woundType]}` : ""}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                    {formatRelative(c.last_message_at)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--text-muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.lastMessage ?? "—"}
                </div>
              </div>
            </button>
          );
        })}
      </Card>

      {/* Açık sohbet */}
      <Card style={{ padding: 0, display: "flex", flexDirection: "column", minHeight: 480 }}>
        {active && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 18px",
                borderBottom: "1px solid var(--card-border)",
              }}
            >
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  background: "var(--surface-green)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                {nameInitials(active.patientName)}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "var(--text-heading)" }}>
                  {active.patientName}
                  {active.woundType ? ` · ${woundTypeLabel[active.woundType]}` : ""}
                </div>
                <StatusBadge status={trackingBadge(active.woundPlanStatus)} />
              </div>
              <Link
                href={
                  active.wound_id
                    ? `/hastalar/${active.patient_id}?wound=${active.wound_id}`
                    : `/hastalar/${active.patient_id}`
                }
              >
                <Button variant="secondary">Yara dosyasına git →</Button>
              </Link>
            </div>

            <div style={{ flex: 1, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.length === 0 && (
                <div style={{ color: "var(--text-muted)" }}>Henüz mesaj yok.</div>
              )}
              {messages.map((m) => {
                const out = m.sender_id === user?.id;
                return (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: out ? "flex-end" : "flex-start",
                      maxWidth: "70%",
                    }}
                  >
                    <div
                      style={{
                        background: out ? "var(--primary)" : "var(--surface)",
                        color: out ? "#fff" : "var(--text-body)",
                        borderRadius: 14,
                        padding: "10px 14px",
                        fontSize: 13.5,
                        lineHeight: 1.45,
                      }}
                    >
                      {m.type === "image" && isWoundImagePath(m.content) ? (
                        <div style={{ minWidth: 180 }}>
                          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>
                            Fotoğraf
                          </div>
                          <LiveWoundPhoto imagePath={m.content.trim()} height={150} />
                        </div>
                      ) : (
                        <>
                          {m.type === "image" && (
                            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>
                              Fotoğraf
                            </div>
                          )}
                          {m.content}
                        </>
                      )}
                      <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4, textAlign: "right" }}>
                        {formatRelative(m.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 10, padding: 16, borderTop: "1px solid var(--card-border)" }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Mesaj yazın..."
                style={{
                  flex: 1,
                  padding: "11px 14px",
                  border: "1px solid var(--card-border)",
                  borderRadius: 12,
                }}
              />
              <Button onClick={send} disabled={sending || !draft.trim()}>
                Gönder
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
