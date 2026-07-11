// Saran — Admin: hemşire oluşturma Edge Function (Deno).
// GÜVENLİK: Yalnızca rolü 'admin' olan oturum açmış kullanıcı çağırabilir.
// service_role anahtarı yalnızca fonksiyon ortamında (Supabase otomatik enjekte eder);
// client'a asla gönderilmez. Hemşire 'pending' (doğrulama bekliyor) olarak açılır.

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

  // 1) Çağıranı doğrula
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) return json({ error: "Yetkisiz" }, 401);

  const admin = createClient(url, serviceKey);

  // 2) Çağıran ADMIN mı?
  const { data: caller } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (caller?.role !== "admin") {
    return json({ error: "Yalnızca admin hemşire ekleyebilir" }, 403);
  }

  // 3) Girdi
  const body = await req.json().catch(() => ({}));
  const {
    fullName,
    phone,
    email,
    password,
    specialty,
    experienceYears,
    diplomaNo,
    documents = [],
  } = body ?? {};
  if (!email || !fullName || !specialty || !diplomaNo) {
    return json({ error: "Eksik alan (email, fullName, specialty, diplomaNo zorunlu)" }, 400);
  }

  // 4) Auth kullanıcısı oluştur (onaylı). Trigger profili 'patient' + patients satırı açar.
  const tempPassword = password || crypto.randomUUID() + "Aa1!";
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone },
  });
  if (createErr || !created.user) {
    return json({ error: "Kullanıcı oluşturulamadı", detail: createErr?.message }, 400);
  }
  const nurseId = created.user.id;

  // 5) Rolü hemşireye yükselt + yanlışlıkla açılan patients satırını temizle
  await admin.from("profiles").update({ role: "nurse" }).eq("id", nurseId);
  await admin.from("patients").delete().eq("id", nurseId);

  // 6) Nurse kaydı (pending) + belgeler
  const { error: nurseErr } = await admin.from("nurses").insert({
    id: nurseId,
    specialty,
    experience_years: experienceYears ?? 0,
    diploma_no: diplomaNo,
    status: "pending",
  });
  if (nurseErr) return json({ error: "Hemşire kaydı başarısız", detail: nurseErr.message }, 500);

  if (Array.isArray(documents) && documents.length) {
    await admin.from("nurse_documents").insert(
      documents.map((d: { type: string; url: string }) => ({
        nurse_id: nurseId,
        type: d.type,
        url: d.url,
      })),
    );
  }

  return json({ ok: true, nurseId, status: "pending" });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
