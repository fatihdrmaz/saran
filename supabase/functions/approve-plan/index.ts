// Saran — Plan onayı + ödeme Edge Function (Deno).
// EN KRİTİK İŞ KURALI (README §7): Plan onayı + ödeme burada atomik yapılır.
// Sadece bu fonksiyon (service_role) plan'ı 'active' yapar → takip akışı açılır.
// Normal kullanıcılar RLS nedeniyle payments'a yazamaz / plan'ı aktifleştiremez.

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
const VAT_RATE = 0.2;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") {
    return json({ error: "POST bekleniyor" }, 405);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // 1) İsteği yapan kullanıcıyı doğrula (kendi JWT'siyle)
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) return json({ error: "Yetkisiz" }, 401);
  const patientId = userData.user.id;

  const { planId /*, paymentToken */ } = await req.json().catch(() => ({}));
  if (!planId) return json({ error: "planId gerekli" }, 400);

  // 2) Service role ile plan'ı yükle ve sahipliği + durumu doğrula
  const admin = createClient(url, serviceKey);
  const { data: plan, error: planErr } = await admin
    .from("plans")
    .select("id, patient_id, type, price_kurus, status, product_id")
    .eq("id", planId)
    .single();

  if (planErr || !plan) return json({ error: "Plan bulunamadı" }, 404);
  if (plan.patient_id !== patientId) return json({ error: "Bu plan size ait değil" }, 403);
  if (plan.status !== "proposed") {
    return json({ error: "Plan zaten işlenmiş", status: plan.status }, 409);
  }

  // 3) TODO: iyzico tahsilatı (paymentToken ile). Başarısızsa ödeme alınmaz,
  //    plan 'proposed' kalır, hiçbir şey aktifleşmez (README §7: onaylanmazsa ücret yok).
  const amount = plan.price_kurus as number;
  const vat = Math.round(amount * VAT_RATE);

  // 4) Ödeme kaydı (paid)
  const { error: payErr } = await admin.from("payments").insert({
    patient_id: patientId,
    plan_id: plan.id,
    amount_kurus: amount,
    vat_kurus: vat,
    status: "paid",
    paid_at: new Date().toISOString(),
    receipt_no: "SR-" + Date.now(),
  });
  if (payErr) return json({ error: "Ödeme kaydı başarısız", detail: payErr.message }, 500);

  // 5) Plan'ı aktifleştir → takip akışı açılır.
  // Süreyi önce üründen (plan_products) oku; yoksa legacy type map'ine düş.
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
  const now = new Date();
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
    .eq("status", "proposed"); // yarış koşulu koruması
  if (updErr) return json({ error: "Plan aktifleştirilemedi", detail: updErr.message }, 500);

  return json({ ok: true, planId: plan.id, status: "active", endsAt });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
