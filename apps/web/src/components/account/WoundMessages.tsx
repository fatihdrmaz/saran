"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { addSeenMessageIds } from "../../lib/notifications";
import { ErrorBox, inputStyle, primaryButtonStyle } from "../fields";
import { cardStyle, sectionTitleStyle, type MessageRow } from "./shared";

/**
 * Bir yaranın "Mesajlar" bölümü — yara başına tek sohbet.
 * Konuşma id'si `get_or_create_wound_conversation` RPC ile alınır; yaraya
 * hemşire atanmamışsa RPC hata fırlatır → nazik not gösterilir.
 */

function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === new Date().toDateString()) return time;
  return `${d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} ${time}`;
}

function MessageBubble({ message, own }: { message: MessageRow; own: boolean }) {
  return (
    <div
      style={{
        alignSelf: own ? "flex-end" : "flex-start",
        maxWidth: "78%",
        background: own ? "var(--primary)" : "#fff",
        color: own ? "#fff" : "var(--text-body)",
        border: own ? "none" : "1px solid var(--card-border)",
        borderRadius: 16,
        borderBottomRightRadius: own ? 6 : 16,
        borderBottomLeftRadius: own ? 16 : 6,
        padding: "10px 14px",
      }}
    >
      <div style={{ fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {message.type === "image" ? (
          <span style={{ fontStyle: "italic", opacity: 0.9 }}>Fotoğraf</span>
        ) : (
          message.content
        )}
      </div>
      <div
        style={{
          fontSize: 11,
          marginTop: 4,
          textAlign: "right",
          color: own ? "rgba(255,255,255,.75)" : "var(--text-muted-alt)",
        }}
      >
        {formatMessageTime(message.created_at)}
      </div>
    </div>
  );
}

export function WoundMessages({ woundId, userId }: { woundId: string; userId: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  /** Yaraya hemşire atanmadığında (RPC hatası) gösterilecek nazik not. */
  const [unassigned, setUnassigned] = useState(false);
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const loadMessages = useCallback(async (convId: string) => {
    const { data: msgs } = await getSupabase()
      .from("messages")
      .select("id,sender_id,type,content,read_at,created_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages((msgs ?? []) as MessageRow[]);
  }, []);

  const init = useCallback(async () => {
    try {
      const { data: convId, error } = await getSupabase().rpc("get_or_create_wound_conversation", {
        w_id: woundId,
      });
      if (error || !convId) {
        // Yaraya henüz hemşire atanmadı → RPC hata fırlatır.
        setUnassigned(true);
        return;
      }
      setConversationId(convId);
      await loadMessages(convId);
    } catch {
      setUnassigned(true);
    } finally {
      setLoaded(true);
    }
  }, [woundId, loadMessages]);

  useEffect(() => {
    init().catch(() => setLoaded(true));
  }, [init]);

  // /hesabim/yara/[id]#mesajlar ile gelindiyse bölüme kaydır.
  useEffect(() => {
    if (loaded && typeof window !== "undefined" && window.location.hash === "#mesajlar") {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loaded]);

  // Bölüm görünür olduğunda işaretle (okundu güncellemesi için).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setVisible(true);
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Görünür olunca hemşireden gelen okunmamışları okundu yap. RLS update
  // politikası yoksa sessizce lokal "görüldü" listesine düş (yt-seen-msg-ids).
  useEffect(() => {
    if (!visible || !conversationId) return;
    const unreadIds = messages
      .filter((m) => m.sender_id !== userId && m.read_at === null)
      .map((m) => m.id);
    if (unreadIds.length === 0) return;
    const now = new Date().toISOString();
    (async () => {
      try {
        const { error } = await getSupabase()
          .from("messages")
          .update({ read_at: now })
          .in("id", unreadIds);
        if (error) throw new Error(error.message);
      } catch {
        addSeenMessageIds(unreadIds);
      }
      // Rozetin düşmesi için lokal durumda da okundu işaretle.
      setMessages((prev) =>
        prev.map((m) => (unreadIds.includes(m.id) ? { ...m, read_at: m.read_at ?? now } : m)),
      );
    })();
  }, [visible, conversationId, messages, userId]);

  // Yeni mesajda listeyi en alta kaydır.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !conversationId || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const { error } = await getSupabase().from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        type: "text",
        content: text,
      });
      if (error) throw new Error(error.message);
      setDraft("");
      await loadMessages(conversationId);
    } catch (err) {
      setSendError(
        err instanceof Error
          ? `Mesaj gönderilemedi (${err.message}). Lütfen tekrar deneyin.`
          : "Mesaj gönderilemedi. Lütfen tekrar deneyin.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div ref={sectionRef} id="mesajlar" style={{ scrollMarginTop: "calc(var(--nav-h) + 16px)" }}>
      <h2 style={sectionTitleStyle}>Mesajlar</h2>

      {!loaded ? (
        <div style={cardStyle}>
          <p style={{ fontSize: 15, color: "var(--text-muted)" }}>Mesajlarınız yükleniyor…</p>
        </div>
      ) : unassigned || !conversationId ? (
        <div style={cardStyle}>
          <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Hemşire atandığında bu yara için mesajlaşma açılır.
          </p>
        </div>
      ) : (
        <div style={{ ...cardStyle, padding: "18px 20px" }}>
          <div
            ref={listRef}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxHeight: 380,
              overflowY: "auto",
              padding: "4px 2px",
            }}
          >
            {messages.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
                Henüz mesaj yok. İlk mesajınızı aşağıdan gönderebilirsiniz.
              </p>
            ) : (
              messages.map((m) => (
                <MessageBubble key={m.id} message={m} own={m.sender_id === userId} />
              ))
            )}
          </div>

          {sendError && (
            <div style={{ marginTop: 12 }}>
              <ErrorBox>{sendError}</ErrorBox>
            </div>
          )}

          <form
            onSubmit={handleSend}
            style={{
              display: "flex",
              gap: 8,
              marginTop: 14,
              paddingTop: 14,
              borderTop: "1px solid var(--card-border)",
            }}
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Mesajınızı yazın…"
              maxLength={2000}
              aria-label="Yeni mesaj"
              style={{ ...inputStyle, flex: 1, width: "auto" }}
            />
            <button
              type="submit"
              disabled={sending || draft.trim().length === 0}
              style={{
                ...primaryButtonStyle,
                fontSize: 15,
                padding: "12px 22px",
                opacity: sending || draft.trim().length === 0 ? 0.6 : 1,
                whiteSpace: "nowrap",
              }}
            >
              {sending ? "Gönderiliyor…" : "Gönder"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
