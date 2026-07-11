// Yara Takibi — Havale onayı Edge Function (Deno).
// Hemşire (planı öneren) veya admin, bekleyen havale bildirimini onaylar:
// payment → paid + plan → active (takip başlar). Aktivasyon yalnızca burada
// (service_role) yapılır; hasta/hemşire RLS ile plan'ı aktifleştiremez.

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PLAN_DURATION_DAYS: Record<string, number | null> = {
  one_time: null,
  week_1: 7,
  week_2: 14,
  week_3: 21,
  monthly: 30,
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

  // Ödeme + plan yükle
  const { data: payment } = await admin
    .from("payments")
    .select("id, plan_id, status, amount_kurus")
    .eq("id", paymentId)
    .single();
  if (!payment) return json({ error: "Ödeme bulunamadı" }, 404);
  if (payment.status !== "awaiting_approval") {
    return json({ error: "Bu ödeme zaten işlenmiş", status: payment.status }, 409);
  }

  const { data: plan } = await admin
    .from("plans")
    .select("id, type, status, product_id, proposed_by_nurse_id")
    .eq("id", payment.plan_id)
    .single();
  if (!plan) return json({ error: "Plan bulunamadı" }, 404);

  // Yetki: planı öneren hemşire VEYA admin
  const { data: caller } = await admin
    .from("profiles")
    .select("role")
    .eq("id", callerId)
    .single();
  const isAdmin = caller?.role === "admin";
  if (!isAdmin && plan.proposed_by_nurse_id !== callerId) {
    return json({ error: "Bu ödemeyi yalnızca planı öneren hemşire veya admin onaylayabilir" }, 403);
  }
  if (plan.status !== "proposed") {
    return json({ error: "Plan zaten işlenmiş", status: plan.status }, 409);
  }

  // Ödemeyi tamamla
  const now = new Date();
  const { error: payErr } = await admin
    .from("payments")
    .update({
      status: "paid",
      paid_at: now.toISOString(),
      receipt_no: "YT-" + Date.now(),
    })
    .eq("id", payment.id)
    .eq("status", "awaiting_approval");
  if (payErr) return json({ error: "Ödeme güncellenemedi", detail: payErr.message }, 500);

  // Süre: üründen, yoksa legacy map
  let days: number | null | undefined;
  if (plan.product_id) {
    const { data: product } = await admin
      .from("plan_products")
      .select("duration_days")
      .eq("id", plan.product_id)
      .single();
    days = product?.duration_days;
  }
  if (days === undefined) days = PLAN_DURATION_DAYS[plan.type as string];
  const endsAt = days ? new Date(now.getTime() + days * 86400000).toISOString() : null;

  const { error: updErr } = await admin
    .from("plans")
    .update({
      status: "active",
      started_at: now.toISOString(),
      ends_at: endsAt,
      progress_day: 0,
    })
    .eq("id", plan.id)
    .eq("status", "proposed");
  if (updErr) return json({ error: "Plan aktifleştirilemedi", detail: updErr.message }, 500);

  return json({ ok: true, planId: plan.id, status: "active", endsAt });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
