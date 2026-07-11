// Saran — e-posta bildirimi Edge Function (Deno).
// DB trigger'ları (0008) pg_net ile {type, id} gönderir; bu fonksiyon veriyi
// service_role ile DB'den OKUR (payload'a güvenmez) ve Resend ile e-posta yollar.
// RESEND_API_KEY secret'ı yoksa sessizce atlar (kurulum: Dashboard → Edge
// Functions → Secrets → RESEND_API_KEY; gönderici domain'i Resend'de doğrulanmalı).
// Deploy: --no-verify-jwt (pg_net Authorization header'ı göndermez).

import { createClient } from "jsr:@supabase/supabase-js@2";

const FROM = Deno.env.get("NOTIFY_FROM") ?? "Yara Takibi <onboarding@resend.dev>";

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ ok: false }, 405);

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    // Anahtar kurulmadan tetikleyiciler çalışabilir; sessizce başarılı dön.
    return json({ ok: true, skipped: "RESEND_API_KEY yok" });
  }

  const { type, id } = await req.json().catch(() => ({}));
  if (!type || !id) return json({ ok: false, error: "type/id gerekli" }, 400);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let to: string | null = null;
  let subject = "";
  let html = "";

  if (type === "plan_proposed") {
    const { data: plan } = await admin
      .from("plans")
      .select("id, patient_id, type, price_kurus")
      .eq("id", id)
      .single();
    if (!plan) return json({ ok: false, error: "plan yok" }, 404);
    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", plan.patient_id)
      .single();
    to = profile?.email ?? null;
    const tl = ((plan.price_kurus as number) / 100).toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
    });
    subject = "Bakım planı öneriniz hazır — Yara Takibi";
    html = `<p>Merhaba ${escapeHtml(profile?.full_name ?? "")},</p>
<p>Hemşireniz yaranızı değerlendirdi ve size bir bakım planı önerdi (${tl} ₺).</p>
<p>Uygulamadan planı inceleyip onaylayabilirsiniz. <strong>Onaylamazsanız ücret alınmaz.</strong></p>
<p>Sağlıklı günler,<br/>Yara Takibi</p>`;
  } else if (type === "new_message") {
    const { data: msg } = await admin
      .from("messages")
      .select("id, sender_id, conversation_id, conversations(patient_id, nurse_id)")
      .eq("id", id)
      .single();
    if (!msg) return json({ ok: false, error: "mesaj yok" }, 404);
    const conv = msg.conversations as unknown as {
      patient_id: string;
      nurse_id: string;
    } | null;
    if (!conv) return json({ ok: false, error: "konuşma yok" }, 404);
    // Yalnızca HEMŞİREDEN gelen mesajda hastaya e-posta at (hasta kendi mesajında mail almasın)
    if (msg.sender_id !== conv.nurse_id) return json({ ok: true, skipped: "hasta mesajı" });
    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", conv.patient_id)
      .single();
    to = profile?.email ?? null;
    subject = "Hemşirenizden yeni mesaj — Yara Takibi";
    html = `<p>Merhaba ${escapeHtml(profile?.full_name ?? "")},</p>
<p>Hemşirenizden yeni bir mesajınız var. Uygulamadan okuyabilirsiniz.</p>
<p>Sağlıklı günler,<br/>Yara Takibi</p>`;
  } else {
    return json({ ok: false, error: "bilinmeyen type" }, 400);
  }

  if (!to) return json({ ok: true, skipped: "alıcı e-postası yok" });

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  const body = await r.json().catch(() => ({}));
  return json({ ok: r.ok, resendStatus: r.status, id: body?.id });
});

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
