import { getSupabase } from "./supabase";

/**
 * Hasta bildirimleri — ayrı tablo YOK, mevcut verilerden türetilir (mobil ile
 * aynı desen): plans(proposed) → "Bakım planı öneriniz hazır",
 * messages(hemşireden, read_at null) → "Hemşirenizden N yeni mesaj",
 * son 30 gün payments(paid) → "Ödemeniz alındı",
 * son 30 gün payments(rejected) → "Havale bildiriminiz doğrulanamadı"
 * (yalnızca listede görünür — okunmamış sayacına dahil edilmez).
 */

export type NotificationKind = "plan" | "message" | "payment";

export type PatientNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  detail?: string;
  /** ISO tarih — listede sıralama ve gösterim için. */
  date: string;
  href: string;
};

/* ---------- Lokal "görüldü" fallback'i ----------
 * messages.read_at güncellemesi RLS nedeniyle başarısız olursa rozet takılı
 * kalmasın diye görülen mesaj id'leri localStorage'da tutulur. */

const SEEN_MSG_KEY = "yt-seen-msg-ids";
const SEEN_MSG_CAP = 300;

export function getSeenMessageIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(SEEN_MSG_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(
      Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [],
    );
  } catch {
    return new Set();
  }
}

export function addSeenMessageIds(ids: string[]): void {
  if (typeof window === "undefined" || ids.length === 0) return;
  try {
    const merged = [...getSeenMessageIds(), ...ids];
    window.localStorage.setItem(SEEN_MSG_KEY, JSON.stringify(merged.slice(-SEEN_MSG_CAP)));
  } catch {
    // storage kullanılamıyorsa (private mod vb.) sessizce geç.
  }
}

/* ---------- Kaynak sorguları ---------- */

/** İlgili mesajın ait olduğu yaranın id'si (varsa) href için taşınır. */
type UnreadMessage = { id: string; created_at: string; woundId: string | null };

/** Hemşireden gelen, okunmamış ve lokal olarak da "görülmemiş" mesajlar. */
async function fetchUnreadNurseMessages(userId: string): Promise<UnreadMessage[]> {
  const supabase = getSupabase();
  const { data: convs, error: convErr } = await supabase
    .from("conversations")
    .select("id,wound_id")
    .eq("patient_id", userId);
  if (convErr || !convs || convs.length === 0) return [];

  // Konuşma → yara eşlemesi (mesaj href'i yaraya yönlensin diye).
  const woundByConv = new Map<string, string | null>();
  for (const c of convs) woundByConv.set(c.id, c.wound_id);

  const { data: msgs, error: msgErr } = await supabase
    .from("messages")
    .select("id,created_at,conversation_id")
    .in(
      "conversation_id",
      convs.map((c) => c.id),
    )
    .neq("sender_id", userId)
    .is("read_at", null)
    .order("created_at", { ascending: false });
  if (msgErr || !msgs) return [];

  const seen = getSeenMessageIds();
  return msgs
    .filter((m) => !seen.has(m.id))
    .map((m) => ({
      id: m.id,
      created_at: m.created_at,
      woundId: woundByConv.get(m.conversation_id) ?? null,
    }));
}

type ProposedPlanRow = {
  id: string;
  wound_id: string;
  created_at: string;
  product: { title: string } | null;
};

async function fetchProposedPlans(): Promise<ProposedPlanRow[]> {
  const { data, error } = await getSupabase()
    .from("plans")
    .select("id,wound_id,created_at,product:plan_products(title)")
    .eq("status", "proposed")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as unknown as ProposedPlanRow[];
}

type PaidPaymentRow = {
  id: string;
  receipt_no: string | null;
  paid_at: string;
  plan: { wound_id: string } | null;
};

async function fetchRecentPaidPayments(): Promise<PaidPaymentRow[]> {
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data, error } = await getSupabase()
    .from("payments")
    .select("id,receipt_no,paid_at,plan:plans(wound_id)")
    .eq("status", "paid")
    .gte("paid_at", since)
    .order("paid_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as PaidPaymentRow[]).filter((p) => p.paid_at != null);
}

type RejectedPaymentRow = {
  id: string;
  created_at: string;
  plan: { wound_id: string } | null;
};

/** Son 30 günde reddedilmiş havale bildirimleri (hasta yeniden bildirebilir). */
async function fetchRecentRejectedPayments(): Promise<RejectedPaymentRow[]> {
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data, error } = await getSupabase()
    .from("payments")
    .select("id,created_at,plan:plans(wound_id)")
    .eq("status", "rejected")
    .gte("created_at", since)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as unknown as RejectedPaymentRow[];
}

/* ---------- Dışa açık API ---------- */

/** Üç kaynaktan türetilmiş bildirim listesi (tarihe göre yeniden eskiye). */
export async function getPatientNotifications(userId: string): Promise<PatientNotification[]> {
  const [plans, payments, rejectedPayments, unreadMsgs] = await Promise.all([
    fetchProposedPlans(),
    fetchRecentPaidPayments(),
    fetchRecentRejectedPayments(),
    fetchUnreadNurseMessages(userId),
  ]);

  const items: PatientNotification[] = [];

  for (const plan of plans) {
    items.push({
      id: `plan-${plan.id}`,
      kind: "plan",
      title: "Bakım planı öneriniz hazır",
      detail: plan.product?.title ?? "Onayınızı bekliyor",
      date: plan.created_at,
      href: `/hesabim/yara/${plan.wound_id}`,
    });
  }

  if (unreadMsgs.length > 0) {
    // En yeni okunmamış mesajın ait olduğu yaranın dosyasına yönlendir.
    const woundId = unreadMsgs.find((m) => m.woundId)?.woundId ?? null;
    items.push({
      id: "unread-messages",
      kind: "message",
      title: `Hemşirenizden ${unreadMsgs.length} yeni mesaj`,
      date: unreadMsgs[0].created_at,
      href: woundId ? `/hesabim/yara/${woundId}#mesajlar` : "/hesabim",
    });
  }

  for (const pay of payments) {
    items.push({
      id: `payment-${pay.id}`,
      kind: "payment",
      title: pay.receipt_no ? `Ödemeniz alındı — makbuz ${pay.receipt_no}` : "Ödemeniz alındı",
      date: pay.paid_at,
      href: pay.plan?.wound_id ? `/hesabim/yara/${pay.plan.wound_id}` : "/hesabim",
    });
  }

  for (const pay of rejectedPayments) {
    items.push({
      id: `payment-rejected-${pay.id}`,
      kind: "payment",
      title: "Havale bildiriminiz doğrulanamadı",
      detail: "Tutarı ve IBAN'ı kontrol edip yeniden bildirebilirsiniz",
      date: pay.created_at,
      href: pay.plan?.wound_id ? `/hesabim/yara/${pay.plan.wound_id}` : "/hesabim",
    });
  }

  items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return items;
}

/** Rozet sayısı: bekleyen plan önerisi + okunmamış hemşire mesajı. */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = getSupabase();
  const [plansRes, unreadMsgs] = await Promise.all([
    supabase
      .from("plans")
      .select("id", { count: "exact", head: true })
      .eq("status", "proposed"),
    fetchUnreadNurseMessages(userId),
  ]);
  return (plansRes.count ?? 0) + unreadMsgs.length;
}
