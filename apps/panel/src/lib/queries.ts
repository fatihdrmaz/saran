"use client";

/**
 * Panel veri erişim katmanı — tüm Supabase okuma/yazma burada toplanır.
 * Hepsi tarayıcıda (client component'lerde) çağrılır; RLS doğrulanmış hemşireyi
 * ve sahipliği zorlar. service_role YOK.
 */
import type { Database } from "@saran/supabase";
import {
  AppointmentStatus,
  type CareTemplateCategory,
  PLAN_DURATION_DAYS,
  PaymentStatus,
  PlanStatus,
  type PlanType,
  type WoundType,
} from "@saran/shared";
import { getSupabase } from "./supabase";

type WoundRow = Database["public"]["Tables"]["wounds"]["Row"];
type PatientRow = Database["public"]["Tables"]["patients"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type SubmissionRow = Database["public"]["Tables"]["submissions"]["Row"];
type PlanRow = Database["public"]["Tables"]["plans"]["Row"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type CareTemplateRow = Database["public"]["Tables"]["care_templates"]["Row"];
type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];
type NurseRow = Database["public"]["Tables"]["nurses"]["Row"];
type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type PlanProductRow = Database["public"]["Tables"]["plan_products"]["Row"];

/** Satılabilir plan ürünü (plan_products satırı). */
export type PlanProduct = PlanProductRow;

/** Bir yara + ilişkili hasta/profil/son gönderim/son plan birleşik görünümü. */
export interface WoundCard {
  woundId: string;
  patientId: string;
  assignedNurseId: string | null;
  type: WoundRow["type"];
  region: string | null;
  clinicalStatus: WoundRow["clinical_status"];
  startedAt: string;
  patientName: string;
  age: number | null;
  diagnoses: string[];
  allergies: string[];
  lastSubmission: SubmissionRow | null;
  latestPlan: PlanRow | null;
}

function initials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toLocaleUpperCase("tr") ?? "")
      .join("") || "?"
  );
}

export function nameInitials(name: string): string {
  return initials(name);
}

/** Bir yara satırını birleşik WoundCard'a çevirir (gömülü ilişkilerle). */
type WoundJoin = WoundRow & {
  patient:
    | (Pick<PatientRow, "age" | "diagnoses" | "allergies"> & {
        profile: Pick<ProfileRow, "full_name"> | null;
      })
    | null;
  submissions: SubmissionRow[] | null;
  plans: PlanRow[] | null;
};

function toWoundCard(w: WoundJoin): WoundCard {
  const subs = (w.submissions ?? [])
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const plans = (w.plans ?? [])
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return {
    woundId: w.id,
    patientId: w.patient_id,
    assignedNurseId: w.assigned_nurse_id,
    type: w.type,
    region: w.region,
    clinicalStatus: w.clinical_status,
    startedAt: w.started_at,
    patientName: w.patient?.profile?.full_name ?? "Hasta",
    age: w.patient?.age ?? null,
    diagnoses: w.patient?.diagnoses ?? [],
    allergies: w.patient?.allergies ?? [],
    lastSubmission: subs[0] ?? null,
    latestPlan: plans[0] ?? null,
  };
}

const WOUND_SELECT = `
  *,
  patient:patients!wounds_patient_id_fkey (
    age, diagnoses, allergies,
    profile:profiles!patients_id_fkey ( full_name )
  ),
  submissions:submissions ( * ),
  plans:plans ( * )
`;

/** Havuz: atanmamış (assigned_nurse_id IS NULL) yaralar — doğrulanmış hemşireye görünür. */
export async function fetchPoolWounds(): Promise<WoundCard[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("wounds")
    .select(WOUND_SELECT)
    .is("assigned_nurse_id", null)
    .is("deleted_at", null)
    .order("started_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as WoundJoin[]).map(toWoundCard);
}

/** Hemşirenin görebildiği tüm yaralar = atanan (kendisi) + havuz. */
export async function fetchVisibleWounds(nurseId: string): Promise<WoundCard[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("wounds")
    .select(WOUND_SELECT)
    .or(`assigned_nurse_id.is.null,assigned_nurse_id.eq.${nurseId}`)
    .is("deleted_at", null)
    .order("started_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as WoundJoin[]).map(toWoundCard);
}

/** Tek yara (detay) — patient_id üzerinden çekilir (rota /hastalar/[id] = patient_id). */
export async function fetchWoundByPatientId(
  patientId: string,
): Promise<WoundCard | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("wounds")
    .select(WOUND_SELECT)
    .eq("patient_id", patientId)
    .is("deleted_at", null)
    .order("started_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  const rows = (data ?? []) as unknown as WoundJoin[];
  return rows[0] ? toWoundCard(rows[0]) : null;
}

/** Bir hastanın tüm yaraları (yeni → eski) — yara dosyası seçici için. */
export async function fetchPatientWounds(
  patientId: string,
): Promise<WoundCard[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("wounds")
    .select(WOUND_SELECT)
    .eq("patient_id", patientId)
    .is("deleted_at", null)
    .order("started_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as WoundJoin[]).map(toWoundCard);
}

/** Bir yaranın tüm gönderimleri (yeni → eski). */
export async function fetchSubmissions(
  woundId: string,
): Promise<SubmissionRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("wound_id", woundId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Havuzdaki yarayı atomik üstlen (RPC) — sohbet de açılır, RLS yarayı kilitler. */
export async function claimWound(woundId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc("claim_wound", { w_id: woundId });
  if (error) throw error;
}

/* ----------------------------- YARA FOTOĞRAFI (STORAGE) ----------------------------- */

/**
 * Private `wound-photos` bucket'ından geçici (5 dk) imzalı URL üretir.
 * Storage RLS: objeyi yalnızca yaraya ATANMIŞ hemşire (veya hasta sahibi/admin)
 * okuyabilir; havuzdaki (atanmamış) hemşire için hata döner → null.
 * Eski/mock kayıtlarda obje bulunmayabilir → yine null (çağıran nazik mesaj gösterir).
 */
export async function getSignedWoundPhotoUrl(
  imagePath: string,
): Promise<string | null> {
  if (!imagePath) return null;
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage
      .from("wound-photos")
      .createSignedUrl(imagePath, 300);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

/**
 * KVKK erişim kaydı: gönderim görseli netleştirildiğinde access_logs'a yazılır.
 * actor_id = oturumdaki kullanıcı (RLS insert koşulu: actor_id = auth.uid()).
 * Log hatası görüntülemeyi engellemez (sessiz geçilir).
 */
export async function logSubmissionImageView(): Promise<void> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getUser();
    const actorId = data.user?.id;
    if (!actorId) return;
    await supabase.from("access_logs").insert({
      actor_id: actorId,
      resource_type: "submission_image",
      resource_id: null,
      action: "view",
    });
  } catch {
    /* sessiz — denetim kaydı UX'i bloklamasın */
  }
}

export interface CreateAssessmentInput {
  submissionId: string;
  nurseId: string;
  patientId: string;
  woundId: string;
  tissueType?: string;
  estimatedHealingDays?: number;
  prognosisNote: string;
  careInstruction?: string;
  dressingSuggestion?: string;
  /** Önerilen ürün — plan'a product_id + type (code) + fiyat SNAPSHOT yazılır. */
  product: Pick<PlanProduct, "id" | "code" | "price_kurus">;
}

/** Değerlendirme (assessments) + plan (plans, status=proposed) insert. */
export async function createAssessmentAndPlan(
  input: CreateAssessmentInput,
): Promise<{ planId: string }> {
  const supabase = getSupabase();

  const { error: aErr } = await supabase.from("assessments").insert({
    submission_id: input.submissionId,
    nurse_id: input.nurseId,
    tissue_type: input.tissueType ?? null,
    estimated_healing_days: input.estimatedHealingDays ?? null,
    prognosis_note: input.prognosisNote,
    care_instruction: input.careInstruction ?? null,
    dressing_suggestion: input.dressingSuggestion ?? null,
  });
  if (aErr) throw aErr;

  const { data: plan, error: pErr } = await supabase
    .from("plans")
    .insert({
      patient_id: input.patientId,
      wound_id: input.woundId,
      proposed_by_nurse_id: input.nurseId,
      product_id: input.product.id,
      type: input.product.code,
      status: PlanStatus.PROPOSED,
      // Fiyat SNAPSHOT: ürünün öneri anındaki fiyatı plana sabitlenir.
      price_kurus: input.product.price_kurus,
      prognosis_note: input.prognosisNote,
    })
    .select("id")
    .single();
  if (pErr) throw pErr;

  return { planId: plan.id };
}

/**
 * Bekleyen (proposed) plan önerisini iptal eder → status='cancelled'.
 * RLS (plans_update): yalnızca planı öneren hemşire (veya admin) güncelleyebilir;
 * yetki yoksa 0 satır döner → Türkçe hata fırlatılır.
 */
export async function cancelPlan(planId: string): Promise<void> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("plans")
    .update({ status: PlanStatus.CANCELLED })
    .eq("id", planId)
    .eq("status", PlanStatus.PROPOSED)
    .select("id");
  if (error) {
    throw new Error("Plan önerisi iptal edilemedi. Lütfen tekrar deneyin.");
  }
  if (!data || data.length === 0) {
    throw new Error(
      "Plan önerisi iptal edilemedi. Yalnızca kendi önerdiğiniz, onay bekleyen planları iptal edebilirsiniz.",
    );
  }
}

/** Plan süresinden ilerleme yüzdesi (started_at + PLAN_DURATION_DAYS). */
export function planProgress(plan: PlanRow): {
  day: number | null;
  totalDays: number | null;
  percent: number;
} {
  const totalDays = PLAN_DURATION_DAYS[plan.type as PlanType];
  if (!plan.started_at || totalDays == null) {
    return { day: plan.progress_day, totalDays, percent: 0 };
  }
  const start = new Date(plan.started_at).getTime();
  const day = Math.max(
    1,
    Math.min(totalDays, Math.floor((Date.now() - start) / 86_400_000) + 1),
  );
  return { day, totalDays, percent: Math.round((day / totalDays) * 100) };
}

/* ----------------------------- ÖDEMELER ----------------------------- */

export interface PaymentWithMeta extends PaymentRow {
  planType: PlanType | null;
  patientName: string;
}

type PaymentJoin = PaymentRow & {
  plan: Pick<PlanRow, "type"> | null;
  patient:
    | { profile: Pick<ProfileRow, "full_name"> | null }
    | null;
};

/** Hemşirenin hastalarının ödemeleri (plans.proposed_by_nurse_id = nurseId). */
export async function fetchNursePayments(
  nurseId: string,
): Promise<PaymentWithMeta[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("payments")
    .select(
      `*,
       plan:plans!payments_plan_id_fkey!inner ( type, proposed_by_nurse_id ),
       patient:patients!payments_patient_id_fkey ( profile:profiles!patients_id_fkey ( full_name ) )`,
    )
    .eq("plan.proposed_by_nurse_id", nurseId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as PaymentJoin[]).map((p) => ({
    ...p,
    planType: (p.plan?.type as PlanType) ?? null,
    patientName: p.patient?.profile?.full_name ?? "Hasta",
  }));
}

/** Onay bekleyen havale bildirimi (Bugün ekranı bölüm kartı satırı). */
export interface AwaitingTransfer {
  paymentId: string;
  planId: string;
  patientId: string;
  amountKurus: number;
  createdAt: string;
  patientName: string;
}

type AwaitingTransferJoin = Pick<
  PaymentRow,
  "id" | "plan_id" | "patient_id" | "amount_kurus" | "created_at"
> & {
  plan: Pick<PlanRow, "proposed_by_nurse_id"> | null;
  patient: { profile: Pick<ProfileRow, "full_name"> | null } | null;
};

/**
 * Onay bekleyen havale/EFT bildirimleri (status=awaiting_approval).
 * Hemşire yalnızca kendi önerdiği planların ödemelerini görür;
 * admin (role="admin") hepsini görür. Yeni → eski.
 */
export async function fetchAwaitingTransfers(
  nurseId: string,
  role?: string,
): Promise<AwaitingTransfer[]> {
  const supabase = getSupabase();
  let query = supabase
    .from("payments")
    .select(
      `id, plan_id, patient_id, amount_kurus, created_at,
       plan:plans!payments_plan_id_fkey!inner ( proposed_by_nurse_id ),
       patient:patients!payments_patient_id_fkey ( profile:profiles!patients_id_fkey ( full_name ) )`,
    )
    .eq("status", PaymentStatus.AWAITING_APPROVAL)
    .order("created_at", { ascending: false });
  if (role !== "admin") query = query.eq("plan.proposed_by_nurse_id", nurseId);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as unknown as AwaitingTransferJoin[]).map((p) => ({
    paymentId: p.id,
    planId: p.plan_id,
    patientId: p.patient_id,
    amountKurus: p.amount_kurus,
    createdAt: p.created_at,
    patientName: p.patient?.profile?.full_name ?? "Hasta",
  }));
}

/**
 * Havale ödemesini onayla (Edge Function: confirm-payment).
 * Başarı: payment → paid, plan → active. Yetki: planı öneren hemşire veya
 * admin; aksi halde 403 gövdesindeki Türkçe mesaj döndürülür.
 * Fırlatmaz — {ok:true} veya {ok:false, error} döndürür.
 */
export async function confirmPayment(
  paymentId: string,
): Promise<{ ok: true; planId: string | null } | { ok: false; error: string }> {
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase.functions.invoke("confirm-payment", {
      body: { paymentId },
    });
    if (error) {
      // FunctionsHttpError: asıl Türkçe mesaj yanıt gövdesinde (error.context).
      let message = "Ödeme onaylanamadı. Lütfen tekrar deneyin.";
      const ctx = (error as { context?: unknown }).context;
      if (ctx instanceof Response) {
        try {
          const body = (await ctx.json()) as { error?: string } | null;
          if (body?.error) message = body.error;
        } catch {
          /* gövde okunamadı — genel mesaj kalır */
        }
      } else if (error.message) {
        message = error.message;
      }
      return { ok: false, error: message };
    }
    const body = data as
      | { ok?: boolean; planId?: string; status?: string; error?: string }
      | null;
    if (!body?.ok) {
      return {
        ok: false,
        error: body?.error ?? "Ödeme onaylanamadı. Lütfen tekrar deneyin.",
      };
    }
    return { ok: true, planId: body.planId ?? null };
  } catch {
    return {
      ok: false,
      error: "Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.",
    };
  }
}

/**
 * Havale ödemesini reddet (Edge Function: reject-payment).
 * Başarı: payment → rejected; plan 'proposed' KALIR (hasta yeniden bildirebilir).
 * Yetki: planı öneren hemşire veya admin; aksi halde 403 gövdesindeki Türkçe
 * mesaj döndürülür. Fırlatmaz — {ok:true} veya {ok:false, error} döndürür.
 */
export async function rejectPayment(
  paymentId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase.functions.invoke("reject-payment", {
      body: { paymentId },
    });
    if (error) {
      // FunctionsHttpError: asıl Türkçe mesaj yanıt gövdesinde (error.context).
      let message = "Ödeme reddedilemedi. Lütfen tekrar deneyin.";
      const ctx = (error as { context?: unknown }).context;
      if (ctx instanceof Response) {
        try {
          const body = (await ctx.json()) as { error?: string } | null;
          if (body?.error) message = body.error;
        } catch {
          /* gövde okunamadı — genel mesaj kalır */
        }
      } else if (error.message) {
        message = error.message;
      }
      return { ok: false, error: message };
    }
    const body = data as
      | { ok?: boolean; status?: string; error?: string }
      | null;
    if (!body?.ok) {
      return {
        ok: false,
        error: body?.error ?? "Ödeme reddedilemedi. Lütfen tekrar deneyin.",
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.",
    };
  }
}

/** Bir hastanın ödemeleri (aktif hasta sekmesi). */
export async function fetchPatientPayments(
  patientId: string,
): Promise<PaymentWithMeta[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("payments")
    .select(
      `*,
       plan:plans!payments_plan_id_fkey ( type ),
       patient:patients!payments_patient_id_fkey ( profile:profiles!patients_id_fkey ( full_name ) )`,
    )
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as PaymentJoin[]).map((p) => ({
    ...p,
    planType: (p.plan?.type as PlanType) ?? null,
    patientName: p.patient?.profile?.full_name ?? "Hasta",
  }));
}

/** Bir yaranın plan(lar)ının ödemeleri (yara dosyası ödemeler sekmesi). */
export async function fetchWoundPayments(
  woundId: string,
): Promise<PaymentWithMeta[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("payments")
    .select(
      `*,
       plan:plans!payments_plan_id_fkey!inner ( type, wound_id ),
       patient:patients!payments_patient_id_fkey ( profile:profiles!patients_id_fkey ( full_name ) )`,
    )
    .eq("plan.wound_id", woundId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as PaymentJoin[]).map((p) => ({
    ...p,
    planType: (p.plan?.type as PlanType) ?? null,
    patientName: p.patient?.profile?.full_name ?? "Hasta",
  }));
}

/* ----------------------------- KONUŞMA / MESAJ ----------------------------- */

export interface ConversationWithMeta extends ConversationRow {
  patientName: string;
  woundType: WoundRow["type"] | null;
  woundPlanStatus: PlanStatus | null;
  lastMessage: string | null;
}

type ConversationJoin = ConversationRow & {
  wound:
    | {
        type: WoundRow["type"];
        plans: Pick<PlanRow, "status" | "created_at">[] | null;
      }
    | null;
  patient:
    | { profile: Pick<ProfileRow, "full_name"> | null }
    | null;
  messages: Pick<MessageRow, "content" | "created_at">[] | null;
};

/**
 * Hemşirenin konuşmaları — artık YARA başına (conversations.wound_id).
 * Her satır: hasta adı + yara tipi + o yaranın plan durumu + son mesaj.
 */
export async function fetchConversations(
  nurseId: string,
): Promise<ConversationWithMeta[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `*,
       wound:wounds!conversations_wound_id_fkey (
         type,
         plans:plans ( status, created_at )
       ),
       patient:patients!conversations_patient_id_fkey (
         profile:profiles!patients_id_fkey ( full_name )
       ),
       messages:messages ( content, created_at )`,
    )
    .eq("nurse_id", nurseId)
    .order("last_message_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return ((data ?? []) as unknown as ConversationJoin[]).map((c) => {
    const msgs = (c.messages ?? [])
      .slice()
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    const plans = (c.wound?.plans ?? [])
      .slice()
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return {
      ...c,
      patientName: c.patient?.profile?.full_name ?? "Hasta",
      woundType: c.wound?.type ?? null,
      woundPlanStatus: (plans[0]?.status as PlanStatus) ?? null,
      lastMessage: msgs[0]?.content ?? null,
    };
  });
}

/** Bir konuşmanın mesajları (eski → yeni). */
export async function fetchMessages(
  conversationId: string,
): Promise<MessageRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Mesaj gönder (sender_id = oturum açan kullanıcı). */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
): Promise<MessageRow> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      type: "text",
    })
    .select("*")
    .single();
  if (error) throw error;
  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);
  return data;
}

/**
 * Bir yaranın sohbetini bul/oluştur (RPC) → conversation uuid.
 * Yalnızca yaraya ATANMIŞ hemşire çağırabilir; atanmamış yarada RPC hata verir.
 */
export async function fetchWoundConversationId(
  woundId: string,
): Promise<string> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("get_or_create_wound_conversation", {
    w_id: woundId,
  });
  if (error) throw error;
  return data as string;
}

/**
 * Karşı taraftan gelen okunmamış mesajları okundu işaretle (read_at = now).
 * sender_id != nurseId ve read_at IS NULL olanlar güncellenir. Sessiz geçer.
 */
export async function markConversationRead(
  conversationId: string,
  nurseId: string,
): Promise<void> {
  try {
    const supabase = getSupabase();
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", nurseId)
      .is("read_at", null);
  } catch {
    /* sessiz — okundu işareti UX'i bloklamasın */
  }
}

/* ----------------------------- ŞABLONLAR ----------------------------- */

/**
 * Görünür bakım şablonları: global (nurse_id IS NULL) + oturum hemşiresinin
 * kendi şablonları. Yeni → eski.
 */
export async function fetchTemplates(
  nurseId: string,
): Promise<CareTemplateRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("care_templates")
    .select("*")
    .or(`nurse_id.is.null,nurse_id.eq.${nurseId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export interface CreateTemplateInput {
  nurseId: string;
  category: CareTemplateCategory;
  title: string;
  content: string;
}

/** Yeni şablon ekle (nurse_id = oturum hemşiresi). */
export async function createTemplate(
  input: CreateTemplateInput,
): Promise<CareTemplateRow> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("care_templates")
    .insert({
      nurse_id: input.nurseId,
      category: input.category,
      title: input.title,
      content: input.content,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/* ----------------------------- RANDEVULAR ----------------------------- */

export interface AppointmentWithMeta extends AppointmentRow {
  patientName: string;
}

type AppointmentJoin = AppointmentRow & {
  patient:
    | { profile: Pick<ProfileRow, "full_name"> | null }
    | null;
};

/** Hemşirenin tüm randevuları (yeni → eski, scheduled_at). */
export async function fetchAppointments(
  nurseId: string,
): Promise<AppointmentWithMeta[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("appointments")
    .select(
      `*,
       patient:patients!appointments_patient_id_fkey ( profile:profiles!patients_id_fkey ( full_name ) )`,
    )
    .eq("nurse_id", nurseId)
    .order("scheduled_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as unknown as AppointmentJoin[]).map((a) => ({
    ...a,
    patientName: a.patient?.profile?.full_name ?? "Hasta",
  }));
}

/** Randevu durumunu güncelle (Onayla → confirmed / İptal → cancelled). */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId);
  if (error) throw error;
}

/* ----------------------------- HEMŞİRELER (ADMIN) ----------------------------- */

export interface NurseWithMeta extends NurseRow {
  fullName: string;
  email: string | null;
}

type NurseJoin = NurseRow & {
  profile: Pick<ProfileRow, "full_name" | "email"> | null;
};

/** Tüm hemşireler + profil (ad/e-posta). RLS yalnızca admin'e tümünü gösterir. */
export async function fetchNurses(): Promise<NurseWithMeta[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("nurses")
    .select(
      `*, profile:profiles!nurses_id_fkey ( full_name, email )`,
    )
    .order("status", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as unknown as NurseJoin[]).map((n) => ({
    ...n,
    fullName: n.profile?.full_name ?? "Hemşire",
    email: n.profile?.email ?? null,
  }));
}

/** Hemşireyi doğrula (pending → verified). RLS admin'e izin verir. */
export async function verifyNurse(nurseId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("nurses")
    .update({ status: "verified" })
    .eq("id", nurseId);
  if (error) throw error;
}

export interface CreateNurseInput {
  fullName: string;
  phone: string;
  email: string;
  specialty: string;
  experienceYears: number;
  diplomaNo: string;
  documents: { type: string; url: string }[];
}

/** Edge Function ile hemşire oluştur (admin). Admin değilse 403 döner. */
export async function adminCreateNurse(
  input: CreateNurseInput,
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.functions.invoke("admin-create-nurse", {
    body: input,
  });
  if (error) throw error;
}

/* ----------------------------- BLOG (ARTICLES) ----------------------------- */

/**
 * Tüm makaleler (yayınlı + taslak), yeni → eski.
 * RLS: admin tümünü, hemşire kendi yazdıklarını + yayınlananları görür.
 */
export async function fetchAllArticles(): Promise<ArticleRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Tek makale (düzenleme ekranı). */
export async function fetchArticle(id: string): Promise<ArticleRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export interface ArticleInput {
  category: string;
  title: string;
  slug: string;
  intro: string;
  body: string;
  readingMinutes: number;
  /** null → taslak, ISO tarih → yayında. */
  publishedAt: string | null;
  /** Oturum hemşiresi; admin null bırakabilir. */
  authorNurseId: string | null;
}

/** Yeni makale ekle (author_nurse_id = oturum hemşiresi veya admin ise null). */
export async function createArticle(input: ArticleInput): Promise<ArticleRow> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("articles")
    .insert({
      category: input.category,
      title: input.title,
      slug: input.slug,
      intro: input.intro,
      body: input.body,
      reading_minutes: input.readingMinutes,
      locale: "tr",
      published_at: input.publishedAt,
      author_nurse_id: input.authorNurseId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/** Mevcut makaleyi güncelle. RLS yazma yetkisini zorlar. */
export async function updateArticle(
  id: string,
  input: Omit<ArticleInput, "authorNurseId">,
): Promise<ArticleRow> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("articles")
    .update({
      category: input.category,
      title: input.title,
      slug: input.slug,
      intro: input.intro,
      body: input.body,
      reading_minutes: input.readingMinutes,
      published_at: input.publishedAt,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/** Makaleyi sil. */
export async function deleteArticle(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) throw error;
}

/** Yayınla / Yayından kaldır toggle (published_at set/null). */
export async function togglePublish(
  id: string,
  publish: boolean,
): Promise<ArticleRow> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("articles")
    .update({ published_at: publish ? new Date().toISOString() : null })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/* ----------------------------- YORUMLAR (REVIEWS) ----------------------------- */

export interface ReviewWithMeta extends ReviewRow {
  patientName: string;
}

type ReviewJoin = ReviewRow & {
  patient: { profile: Pick<ProfileRow, "full_name"> | null } | null;
};

/** Tüm yorumlar + hasta adı, yeni → eski. */
export async function fetchAllReviews(): Promise<ReviewWithMeta[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `*,
       patient:patients!reviews_patient_id_fkey ( profile:profiles!patients_id_fkey ( full_name ) )`,
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as ReviewJoin[]).map((r) => ({
    ...r,
    patientName: r.patient?.profile?.full_name ?? "Hasta",
  }));
}

/** Yorumu sil (admin; RLS izin verir, değilse hata döner). */
export async function deleteReview(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
}

/** Yayın rızasını geri çek — görseller yayından düşer (consent_confirmed=false). */
export async function revokeReviewConsent(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("reviews")
    .update({ consent_confirmed: false })
    .eq("id", id);
  if (error) throw error;
}

/**
 * Öne çıkan vaka görselini public `case-images` bucket'ına yükler (admin).
 * `name` bucket içindeki yol (ör. `<uuid>/before.jpg`). Public URL döner.
 */
export async function uploadCaseImage(file: File, name: string): Promise<string> {
  const supabase = getSupabase();
  const { error } = await supabase.storage
    .from("case-images")
    .upload(name, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return supabase.storage.from("case-images").getPublicUrl(name).data.publicUrl;
}

export interface CaseReviewInput {
  displayName: string;
  woundType: WoundType;
  durationLabel: string;
  rating: number;
  text: string;
  beforeImageUrl: string;
  afterImageUrl: string;
}

/**
 * Öne çıkan vaka (önce/sonra görselli) yorum oluşturur. Yayın rızası alındığı
 * için consent_confirmed=true; hastaya bağlı olmadığından patient_id=null.
 * Eklenen satırı liste için hazır (patientName ile) döner.
 */
export async function createCaseReview(
  input: CaseReviewInput,
): Promise<ReviewWithMeta> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      display_name: input.displayName,
      wound_type: input.woundType,
      duration_label: input.durationLabel,
      rating: input.rating,
      text: input.text,
      before_image_url: input.beforeImageUrl,
      after_image_url: input.afterImageUrl,
      consent_confirmed: true,
      patient_id: null,
    })
    .select("*")
    .single();
  if (error) throw error;
  const row = data as ReviewRow;
  return { ...row, patientName: row.display_name ?? "Vaka" };
}

/* ----------------------------- ÜRÜNLER (PLAN_PRODUCTS) ----------------------------- */

/**
 * Plan ürünlerini listele (sort_order sırasıyla).
 * activeOnly=true → yalnızca aktif ürünler (değerlendirme ekranı bunu kullanır).
 * RLS: herkes okur.
 */
export async function fetchProducts(
  activeOnly = false,
): Promise<PlanProduct[]> {
  const supabase = getSupabase();
  let query = supabase
    .from("plan_products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (activeOnly) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export interface CreateProductInput {
  code: PlanType;
  title: string;
  description: string | null;
  durationDays: number;
  /** Kuruş integer (TL*100). */
  priceKurus: number;
  sortOrder: number;
}

/** Yeni ürün ekle. RLS yalnızca ADMIN'e izin verir; değilse hata döner. */
export async function createProduct(
  input: CreateProductInput,
): Promise<PlanProduct> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("plan_products")
    .insert({
      code: input.code,
      title: input.title,
      description: input.description,
      duration_days: input.durationDays,
      price_kurus: input.priceKurus,
      sort_order: input.sortOrder,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export interface UpdateProductInput {
  title: string;
  description: string | null;
  durationDays: number;
  /** Kuruş integer (TL*100). */
  priceKurus: number;
  active: boolean;
  sortOrder?: number;
}

/** Ürünü güncelle. RLS yalnızca ADMIN'e izin verir; değilse hata döner. */
export async function updateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<PlanProduct> {
  const supabase = getSupabase();
  const patch: Database["public"]["Tables"]["plan_products"]["Update"] = {
    title: input.title,
    description: input.description,
    duration_days: input.durationDays,
    price_kurus: input.priceKurus,
    active: input.active,
    updated_at: new Date().toISOString(),
  };
  if (input.sortOrder != null) patch.sort_order = input.sortOrder;
  const { data, error } = await supabase
    .from("plan_products")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
