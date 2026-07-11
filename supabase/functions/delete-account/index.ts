// Yara Takibi — Hesap silme Edge Function (Deno).
// Apple App Store zorunluluğu + KVKK silme hakkı. Oturum açmış kullanıcı KENDİ
// hesabını siler: önce yara fotoğrafları storage'dan, sonra auth kullanıcısı
// (profiles → patients/nurses → wounds → ... FK cascade ile temizlenir).

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

  // Çağıranı doğrula — yalnızca kendi hesabı
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) return json({ error: "Yetkisiz" }, 401);
  const userId = userData.user.id;

  // Onay metni istenir (yanlışlıkla çağrıyı önle)
  const { confirm } = await req.json().catch(() => ({}));
  if (confirm !== "HESABIMI SIL") {
    return json({ error: 'Onay gerekli: body {"confirm":"HESABIMI SIL"}' }, 400);
  }

  const admin = createClient(url, serviceKey);

  // KVKK: silme talebini logla (hesap silinmeden önce)
  await admin.from("access_logs").insert({
    actor_id: userId,
    resource_type: "account",
    resource_id: userId,
    action: "delete_request",
  });

  // Kullanıcının yara fotoğraflarını storage'dan temizle
  const { data: wounds } = await admin
    .from("wounds")
    .select("id")
    .eq("patient_id", userId);
  for (const w of wounds ?? []) {
    const { data: files } = await admin.storage
      .from("wound-photos")
      .list(w.id as string);
    if (files?.length) {
      await admin.storage
        .from("wound-photos")
        .remove(files.map((f) => `${w.id}/${f.name}`));
    }
  }

  // Auth kullanıcısını sil → profiles cascade → tüm alt tablolar cascade
  const { error: delErr } = await admin.auth.admin.deleteUser(userId);
  if (delErr) return json({ error: "Hesap silinemedi", detail: delErr.message }, 500);

  return json({ ok: true });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
