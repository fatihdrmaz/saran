// Yara Takibi — Havale reddi Edge Function (Deno).
// Hemşire (planı öneren) veya admin, bekleyen havale bildirimini REDDEDER:
// payment → rejected; plan 'proposed' KALIR (hasta yeniden bildirebilir veya
// hemşireyle iletişime geçer). confirm-payment'ın simetriği.

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST bekleniyor" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authHeader = req.headers.get("Authorization") ?? "";

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) return json({ error: "Yetkisiz" }, 401);
  const callerId = userData.user.id;

  const { paymentId } = await req.json().catch(() => ({}));
  if (!paymentId) return json({ error: "paymentId gerekli" }, 400);

  const admin = createClient(url, serviceKey);

  const { data: payment } = await admin
    .from("payments")
    .select("id, plan_id, status")
    .eq("id", paymentId)
    .single();
  if (!payment) return json({ error: "Ödeme bulunamadı" }, 404);
  if (payment.status !== "awaiting_approval") {
    return json({ error: "Bu ödeme zaten işlenmiş", status: payment.status }, 409);
  }

  const { data: plan } = await admin
    .from("plans")
    .select("id, proposed_by_nurse_id")
    .eq("id", payment.plan_id)
    .single();
  if (!plan) return json({ error: "Plan bulunamadı" }, 404);

  const { data: caller } = await admin
    .from("profiles")
    .select("role")
    .eq("id", callerId)
    .single();
  const isAdmin = caller?.role === "admin";
  if (!isAdmin && plan.proposed_by_nurse_id !== callerId) {
    return json({ error: "Bu ödemeyi yalnızca planı öneren hemşire veya admin reddedebilir" }, 403);
  }

  const { error: updErr } = await admin
    .from("payments")
    .update({ status: "rejected" })
    .eq("id", payment.id)
    .eq("status", "awaiting_approval");
  if (updErr) return json({ error: "Ödeme güncellenemedi", detail: updErr.message }, 500);

  return json({ ok: true, paymentId: payment.id, status: "rejected" });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
