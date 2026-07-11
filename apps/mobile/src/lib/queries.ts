/**
 * Saran mobil veri erişim katmanı. Tüm Supabase okuma/yazma işlemleri burada
 * toplanır ki ekranlar yalnızca bu yeniden kullanılabilir fonksiyonları çağırsın.
 * Client tam tipli (`SupabaseClient<Database>`) — kolonlar snake_case.
 */
import {
  PlanType,
  WoundType,
  PainLevel,
  ExudateLevel,
  type AppointmentType,
  type PlanStatus,
  type WoundClinicalStatus,
} from "@saran/shared";
import { type Database } from "@saran/supabase";
import { supabase } from "./supabase";
import { uploadWoundPhoto, type PickedPhoto } from "./photo";

type WoundRow = Database["public"]["Tables"]["wounds"]["Row"];
export type PlanProductRow = Database["public"]["Tables"]["plan_products"]["Row"];
type SubmissionRow = Database["public"]["Tables"]["submissions"]["Row"];
type PlanRow = Database["public"]["Tables"]["plans"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];
type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

/** Ana sayfa/takip için bir yaranın özeti: yara + son gönderim + güncel plan. */
export interface WoundOverview {
  wound: WoundRow;
  latestSubmission: SubmissionRow | null;
  plan: PlanRow | null;
}

// ── Etiket yardımcıları (enum → TR etiket) ─────────────────────────────────

const WOUND_TYPE_LABELS: Record<WoundType, string> = {
  [WoundType.PRESSURE]: "Bası yarası",
  [WoundType.DIABETIC_FOOT]: "Diyabetik ayak yarası",
  [WoundType.SURGICAL]: "Cerrahi yara",
  [WoundType.VENOUS]: "Venöz ülser",
  [WoundType.BURN]: "Yanık",
};

export function woundTypeLabel(type: WoundType): string {
  return WOUND_TYPE_LABELS[type] ?? type;
}

const CLINICAL_STATUS_LABELS: Record<WoundClinicalStatus, string> = {
  improving: "İyileşiyor",
  monitoring: "İzlemde",
  stalled: "Duraklamış",
  closed: "Kapandı",
};

export function clinicalStatusLabel(status: WoundClinicalStatus): string {
  return CLINICAL_STATUS_LABELS[status] ?? status;
}

const PLAN_TYPE_LABELS: Record<PlanType, string> = {
  [PlanType.ONE_TIME]: "Tek Seferlik",
  [PlanType.WEEK_1]: "Haftalık Takip",
  [PlanType.WEEK_2]: "2 Haftalık Takip",
  [PlanType.WEEK_3]: "3 Haftalık Takip",
  [PlanType.MONTHLY]: "Aylık Takip",
};

/** plan.type enum → TR paket başlığı (ürün title'ı yoksa fallback). */
export function planTypeLabel(type: string): string {
  return PLAN_TYPE_LABELS[type as PlanType] ?? type;
}

// ── Yara + gönderim + plan okuma ───────────────────────────────────────────

/**
 * Oturum kullanıcısının yaralarını, her biri için son gönderim ve güncel planla
 * birlikte döner. Veri yoksa boş dizi (ekran boş durum gösterir).
 */
export async function getWoundOverviews(patientId: string): Promise<WoundOverview[]> {
  const { data: wounds, error } = await supabase
    .from("wounds")
    .select("*")
    .eq("patient_id", patientId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!wounds || wounds.length === 0) return [];

  const woundIds = wounds.map((w) => w.id);

  const [submissionsRes, plansRes] = await Promise.all([
    supabase
      .from("submissions")
      .select("*")
      .in("wound_id", woundIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("plans")
      .select("*")
      .in("wound_id", woundIds)
      .order("created_at", { ascending: false }),
  ]);

  if (submissionsRes.error) throw submissionsRes.error;
  if (plansRes.error) throw plansRes.error;

  const submissions = submissionsRes.data ?? [];
  const plans = plansRes.data ?? [];

  return wounds.map((wound) => ({
    wound,
    latestSubmission: submissions.find((s) => s.wound_id === wound.id) ?? null,
    plan: plans.find((p) => p.wound_id === wound.id) ?? null,
  }));
}

/** Yara detayı/arşiv için tek yara + gönderimleri + güncel plan. */
export interface WoundDetail {
  wound: WoundRow;
  submissions: SubmissionRow[];
  plan: PlanRow | null;
}

/**
 * Tek bir yaranın detayını döner: yara + tüm gönderimleri (yeni → eski) +
 * güncel planı. `woundId` verilmezse hastanın en yeni (ilk) yarası kullanılır.
 * Yara yoksa null (ekran boş durum gösterir).
 */
export async function getWoundDetail(
  patientId: string,
  woundId?: string | null,
): Promise<WoundDetail | null> {
  let wound: WoundRow | null = null;

  if (woundId) {
    const { data, error } = await supabase
      .from("wounds")
      .select("*")
      .eq("id", woundId)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    wound = data ?? null;
  } else {
    const { data, error } = await supabase
      .from("wounds")
      .select("*")
      .eq("patient_id", patientId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    wound = data ?? null;
  }

  if (!wound) return null;

  const [submissionsRes, planRes] = await Promise.all([
    supabase
      .from("submissions")
      .select("*")
      .eq("wound_id", wound.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("plans")
      .select("*")
      .eq("wound_id", wound.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (submissionsRes.error) throw submissionsRes.error;
  if (planRes.error) throw planRes.error;

  return {
    wound,
    submissions: submissionsRes.data ?? [],
    plan: planRes.data ?? null,
  };
}

/** Tek bir yaranın tüm gönderimlerini (yeni → eski) döner (arşiv/zaman çizelgesi). */
export async function getWoundSubmissions(woundId: string): Promise<SubmissionRow[]> {
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("wound_id", woundId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Plan + bağlı ürünün başlığı (plans.product_id → plan_products.title). */
export type PlanWithProduct = PlanRow & {
  product: Pick<PlanProductRow, "title"> | null;
};

/** Belirli bir durumdaki ilk planı döner (örn. proposed plan önerisi). */
export async function getPlanByStatus(
  patientId: string,
  status: PlanStatus,
): Promise<PlanWithProduct | null> {
  const { data, error } = await supabase
    .from("plans")
    .select("*, product:plan_products(title)")
    .eq("patient_id", patientId)
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

// ── Paket ürünleri (Paketler ekranı) ───────────────────────────────────────

/** Satıştaki paket ürünlerini `sort_order` sırasıyla döner (yalnızca aktif). */
export async function getProducts(): Promise<PlanProductRow[]> {
  const { data, error } = await supabase
    .from("plan_products")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ── Değerlendirme gönderimi (yara + submission + gerçek foto) ──────────────

export interface CreateAssessmentInput {
  patientId: string;
  type: WoundType;
  /** Kamera/galeriden seçilen gerçek yara fotoğrafı (zorunlu). */
  photo: PickedPhoto;
  region?: string | null;
  painLevel?: PainLevel;
  exudate?: ExudateLevel | null;
  patientNote?: string | null;
}

/**
 * Ücretsiz değerlendirme: yara + ilk gönderim oluşturur. Seçilen gerçek
 * fotoğraf storage'a yüklenir; yüklenen yol `image_path` olarak kaydedilir.
 * Fotoğraf yüklenemezse hata fırlatılır (fotoğrafsız değerlendirme yok).
 */
export async function createAssessment(
  input: CreateAssessmentInput,
): Promise<{ woundId: string; submissionId: string }> {
  const { data: wound, error: woundError } = await supabase
    .from("wounds")
    .insert({
      patient_id: input.patientId,
      type: input.type,
      region: input.region ?? null,
      // assigned_nurse_id null → havuza düşer (hemşire daha sonra üstlenir)
    })
    .select("id")
    .single();

  if (woundError) throw woundError;

  const imagePath = await uploadWoundPhoto(wound.id, input.photo);

  const { data: submission, error: subError } = await supabase
    .from("submissions")
    .insert({
      wound_id: wound.id,
      image_path: imagePath,
      pain_level: input.painLevel ?? PainLevel.NONE,
      exudate: input.exudate ?? null,
      patient_note: input.patientNote ?? null,
    })
    .select("id")
    .single();

  if (subError) throw subError;

  return { woundId: wound.id, submissionId: submission.id };
}

// ── Mevcut yaraya yeni gönderim (Fotoğraf Gönder) ──────────────────────────

export interface CreateSubmissionInput {
  woundId: string;
  /** Kamera/galeriden seçilen gerçek yara fotoğrafı (zorunlu). */
  photo: PickedPhoto;
  painLevel?: PainLevel;
  exudate?: ExudateLevel | null;
  patientNote?: string | null;
}

/**
 * MEVCUT bir yaraya yeni gönderim ekler (yeni fotoğraf/takip). Seçilen gerçek
 * fotoğraf storage'a yüklenir; yüklenemezse hata fırlatılır (fotoğrafsız
 * gönderim yok).
 */
export async function createSubmission(
  input: CreateSubmissionInput,
): Promise<{ submissionId: string }> {
  const imagePath = await uploadWoundPhoto(input.woundId, input.photo);

  const { data: submission, error } = await supabase
    .from("submissions")
    .insert({
      wound_id: input.woundId,
      image_path: imagePath,
      pain_level: input.painLevel ?? PainLevel.NONE,
      exudate: input.exudate ?? null,
      patient_note: input.patientNote ?? null,
    })
    .select("id")
    .single();

  if (error) throw error;
  return { submissionId: submission.id };
}

// ── Plan onayı (Edge Function) ─────────────────────────────────────────────

/**
 * Proposed plan'ı onaylar: `approve-plan` Edge Function plan'ı active yapar ve
 * takibi açar. (Ödeme/iş kuralları fonksiyon içinde uygulanır.)
 */
export async function approvePlan(planId: string): Promise<void> {
  const { error } = await supabase.functions.invoke("approve-plan", {
    body: { planId },
  });
  if (error) throw error;
}

// ── Mesajlaşma ─────────────────────────────────────────────────────────────

export interface ConversationThread {
  conversation: ConversationRow;
  messages: MessageRow[];
}

/**
 * Hastanın (tek) konuşmasını ve mesajlarını (eski → yeni) döner.
 * Konuşma yoksa null (henüz hemşire atanmamış / mesaj başlamamış).
 */
export async function getConversationThread(
  patientId: string,
): Promise<ConversationThread | null> {
  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("patient_id", patientId)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!conversation) return null;

  const { data: messages, error: msgError } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true });

  if (msgError) throw msgError;

  return { conversation, messages: messages ?? [] };
}

/** Konuşmaya hasta adına metin mesajı ekler ve eklenen satırı döner. */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
): Promise<MessageRow> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      type: "text",
      content,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

// ── Kayıt / giriş ──────────────────────────────────────────────────────────

export interface RegisterInput {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

/**
 * Hasta kaydı. DB trigger'ı (`raw_user_meta_data`) profili + patient kaydını
 * otomatik açar. role/kvkk_consent metadata olarak geçilir.
 */
export async function registerPatient(input: RegisterInput) {
  return supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        phone: input.phone,
        role: "patient",
        kvkk_consent: "true",
      },
    },
  });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

// ── Atanmış hemşire çözümleme ──────────────────────────────────────────────

/**
 * Hastanın atanmış hemşiresini döner. Önce aktif/atanmış yaranın
 * `assigned_nurse_id`'sine, yoksa konuşmadaki `nurse_id`'ye bakar.
 * Hiçbiri yoksa null (henüz değerlendirme yapılmamış / hemşire atanmamış).
 */
export async function getAssignedNurseId(patientId: string): Promise<string | null> {
  const { data: wounds, error } = await supabase
    .from("wounds")
    .select("assigned_nurse_id")
    .eq("patient_id", patientId)
    .is("deleted_at", null)
    .not("assigned_nurse_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  const fromWound = wounds?.[0]?.assigned_nurse_id ?? null;
  if (fromWound) return fromWound;

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("nurse_id")
    .eq("patient_id", patientId)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (convError) throw convError;
  return conversation?.nurse_id ?? null;
}

// ── Randevular ─────────────────────────────────────────────────────────────

/** Oturum hastasının randevularını (yakın → uzak) döner. */
export async function getAppointments(patientId: string): Promise<AppointmentRow[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", patientId)
    .order("scheduled_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export interface CreateAppointmentInput {
  patientId: string;
  nurseId: string;
  woundId?: string | null;
  type: AppointmentType;
  scheduledAt: string;
  durationMin?: number;
}

/** Hastanın atanmış hemşiresiyle yeni bir randevu talebi oluşturur. */
export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<AppointmentRow> {
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      patient_id: input.patientId,
      nurse_id: input.nurseId,
      wound_id: input.woundId ?? null,
      type: input.type,
      scheduled_at: input.scheduledAt,
      ...(input.durationMin != null ? { duration_min: input.durationMin } : {}),
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

// ── Ödemeler / Makbuz ──────────────────────────────────────────────────────

export interface PaymentReceipt {
  payment: PaymentRow;
  plan: PlanRow | null;
}

/**
 * Oturum hastasının ödenmiş (paid) ödemelerini, ilgili planlarıyla birlikte
 * (yeni → eski) döner. Veri yoksa boş dizi (ekran boş durum gösterir).
 */
export async function getPaidReceipts(patientId: string): Promise<PaymentReceipt[]> {
  const { data: payments, error } = await supabase
    .from("payments")
    .select("*")
    .eq("patient_id", patientId)
    .eq("status", "paid")
    .order("paid_at", { ascending: false, nullsFirst: false });

  if (error) throw error;
  if (!payments || payments.length === 0) return [];

  const planIds = Array.from(new Set(payments.map((p) => p.plan_id)));
  const { data: plans, error: planError } = await supabase
    .from("plans")
    .select("*")
    .in("id", planIds);
  if (planError) throw planError;

  return payments.map((payment) => ({
    payment,
    plan: plans?.find((p) => p.id === payment.plan_id) ?? null,
  }));
}

// ── Acil bildirim ──────────────────────────────────────────────────────────

/**
 * Atanmış hemşireyle olan konuşmaya acil bildirim mesajı gönderir ve
 * `access_logs`'a bir kayıt düşer. Konuşma yoksa null döner (ekran 112'ye
 * yönlendirir). Mesaj gönderildiyse eklenen satırı döner.
 */
export async function sendEmergencyAlert(
  patientId: string,
  content: string,
): Promise<MessageRow | null> {
  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("id")
    .eq("patient_id", patientId)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!conversation) return null;

  const message = await sendMessage(conversation.id, patientId, content);

  // Erişim kaydı — başarısız olsa bile bildirim mesajı zaten gitti.
  const { error: logError } = await supabase.from("access_logs").insert({
    actor_id: patientId,
    resource_type: "emergency",
    resource_id: conversation.id,
    action: "alert",
  });
  if (logError) {
    console.warn("[saran] acil erişim kaydı yazılamadı:", logError.message);
  }

  return message;
}

// ── Bildirimler (türetilmiş akış — ayrı tablo yok) ─────────────────────────

export type NotificationKind = "plan" | "message" | "payment";

/**
 * Türetilmiş bildirim öğesi. AYRI bir `notifications` tablosu olmadığından,
 * bildirimler hastanın mevcut verilerinden (plan/mesaj/ödeme) üretilir.
 * Salt-okunur; tıklanınca ilgili ekrana yönlendirilir.
 */
export interface DerivedNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** ISO tarih — sıralama + ekranda görüntüleme için. */
  createdAt: string;
  /** Tıklanınca yönlendirilecek expo-router rotası. */
  route: string;
  unread: boolean;
}

/**
 * Hastanın verilerinden bildirim listesi türetir (yeni → eski):
 *  - plans status='proposed'  → "Plan öneriniz hazır"      → /plan-proposal
 *  - plans status='active'    → "Planınız aktif"           → /plan-active
 *  - okunmamış messages       → "Yeni mesaj"               → /(tabs)/messages
 *  - paid payments            → "Ödeme makbuzunuz hazır"   → /invoice
 */
export async function getNotifications(
  patientId: string,
): Promise<DerivedNotification[]> {
  const [plansRes, paymentsRes, convRes] = await Promise.all([
    supabase
      .from("plans")
      .select("*")
      .eq("patient_id", patientId)
      .in("status", ["proposed", "active"])
      .order("created_at", { ascending: false }),
    supabase
      .from("payments")
      .select("*")
      .eq("patient_id", patientId)
      .eq("status", "paid")
      .order("paid_at", { ascending: false, nullsFirst: false }),
    supabase
      .from("conversations")
      .select("id")
      .eq("patient_id", patientId)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (plansRes.error) throw plansRes.error;
  if (paymentsRes.error) throw paymentsRes.error;
  if (convRes.error) throw convRes.error;

  const items: DerivedNotification[] = [];

  for (const plan of plansRes.data ?? []) {
    if (plan.status === "proposed") {
      items.push({
        id: `plan-${plan.id}`,
        kind: "plan",
        title: "Plan öneriniz hazır",
        body: "Hemşireniz bir bakım planı önerdi. Görüntüleyip onaylayabilirsiniz.",
        createdAt: plan.created_at,
        route: "/plan-proposal",
        unread: true,
      });
    } else if (plan.status === "active") {
      items.push({
        id: `plan-${plan.id}`,
        kind: "plan",
        title: "Planınız aktif",
        body: "Ödemeniz onaylandı; takibiniz başladı.",
        createdAt: plan.started_at ?? plan.created_at,
        route: "/plan-active",
        unread: false,
      });
    }
  }

  for (const payment of paymentsRes.data ?? []) {
    items.push({
      id: `payment-${payment.id}`,
      kind: "payment",
      title: "Ödeme makbuzunuz hazır",
      body: "Ödemeniz alındı. Makbuzunuzu görüntüleyebilirsiniz.",
      createdAt: payment.paid_at ?? payment.created_at,
      route: "/invoice",
      unread: false,
    });
  }

  // Okunmamış (read_at null) ve hastanın GÖNDERMEDİĞİ mesajlar → "Yeni mesaj".
  const conversationId = convRes.data?.id ?? null;
  if (conversationId) {
    const { data: unread, error: unreadError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .neq("sender_id", patientId)
      .is("read_at", null)
      .order("created_at", { ascending: false });
    if (unreadError) throw unreadError;

    for (const msg of unread ?? []) {
      items.push({
        id: `message-${msg.id}`,
        kind: "message",
        title: "Yeni mesaj",
        body: msg.content.length > 80 ? `${msg.content.slice(0, 80)}…` : msg.content,
        createdAt: msg.created_at,
        route: "/(tabs)/messages",
        unread: true,
      });
    }
  }

  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return items;
}

// ── Yorumlar (reviews) ──────────────────────────────────────────────────────

export interface ReviewSummary {
  average: number;
  count: number;
  /** 5★ → 1★ sırasıyla her yıldız için oran (0–1). */
  distribution: { stars: number; ratio: number }[];
}

/** Herkese açık yorumları (yeni → eski) döner. */
export async function getReviews(): Promise<ReviewRow[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Yorum listesinden puan ortalaması + dağılımı (5★→1★) türetir. */
export function summarizeReviews(reviews: ReviewRow[]): ReviewSummary {
  const count = reviews.length;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const average = count > 0 ? Math.round((total / count) * 10) / 10 : 0;

  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const n = reviews.filter((r) => r.rating === stars).length;
    return { stars, ratio: count > 0 ? n / count : 0 };
  });

  return { average, count, distribution };
}

export interface CreateReviewInput {
  patientId: string;
  rating: number;
  text: string;
  woundType: WoundType;
  durationLabel?: string | null;
  beforeImageUrl?: string | null;
  afterImageUrl?: string | null;
}

/** Hastanın kendi yorumunu ekler ve eklenen satırı döner. */
export async function createReview(input: CreateReviewInput): Promise<ReviewRow> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      patient_id: input.patientId,
      rating: input.rating,
      text: input.text,
      wound_type: input.woundType,
      duration_label: input.durationLabel ?? null,
      before_image_url: input.beforeImageUrl ?? null,
      after_image_url: input.afterImageUrl ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export { PlanType };
