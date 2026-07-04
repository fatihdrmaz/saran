/**
 * Mock veri — Supabase çalışmadığı için tüm panel ekranları bundan beslenir.
 * Tipler @saran/shared'den; enum/iş-kuralı sabitleri tek kaynak.
 * NOT: supabase.ts'i ekranlarda IMPORT ETME.
 */
import {
  AppointmentStatus,
  AppointmentType,
  CareTemplateCategory,
  NurseStatus,
  PainLevel,
  PaymentStatus,
  PlanStatus,
  PlanType,
  WoundClinicalStatus,
  WoundType,
} from "@saran/shared";

/** Yara tipi → TR etiket. */
export const woundTypeLabel: Record<WoundType, string> = {
  [WoundType.PRESSURE]: "Bası yarası",
  [WoundType.DIABETIC_FOOT]: "Diyabetik ayak",
  [WoundType.SURGICAL]: "Cerrahi yara",
  [WoundType.VENOUS]: "Venöz ülser",
  [WoundType.BURN]: "Yanık",
};

export const painLevelLabel: Record<PainLevel, string> = {
  [PainLevel.NONE]: "Yok",
  [PainLevel.MILD]: "Hafif",
  [PainLevel.MODERATE]: "Orta",
  [PainLevel.SEVERE]: "Şiddetli",
};

export const planTypeLabel: Record<PlanType, string> = {
  [PlanType.ONE_TIME]: "Tek seferlik",
  [PlanType.WEEK_1]: "1 haftalık",
  [PlanType.WEEK_2]: "2 Haftalık Takip",
  [PlanType.WEEK_3]: "3 haftalık",
  [PlanType.MONTHLY]: "Aylık takip",
};

export const planDurationLabel: Record<PlanType, string> = {
  [PlanType.ONE_TIME]: "Süresiz",
  [PlanType.WEEK_1]: "7 gün",
  [PlanType.WEEK_2]: "14 gün",
  [PlanType.WEEK_3]: "21 gün",
  [PlanType.MONTHLY]: "30 gün",
};

export const careCategoryLabel: Record<CareTemplateCategory, string> = {
  [CareTemplateCategory.PRESSURE]: "Bası yarası",
  [CareTemplateCategory.DIABETIC_FOOT]: "Diyabetik ayak",
  [CareTemplateCategory.SURGICAL]: "Cerrahi",
  [CareTemplateCategory.EMERGENCY_REFERRAL]: "Acil yönlendirme",
  [CareTemplateCategory.BURN]: "Yanık",
};

/** Para biçimlendirme (kuruş integer → ₺). */
export function formatKurus(kurus: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(kurus / 100);
}

export type Priority = "high" | "medium" | "low";

/** Havuz/değerlendirme önceliği rengi (README §6C-1 öncelik renkleri). */
export const priorityStyle: Record<
  Priority,
  { label: string; fg: string; bg: string; dot: string }
> = {
  high: { label: "Acil", fg: "#c2553b", bg: "#fbe3e2", dot: "#c2553b" },
  medium: { label: "Yüksek", fg: "#c07a2e", bg: "#fdebd8", dot: "#d98456" },
  low: { label: "Normal", fg: "#1fa37a", bg: "#e3f4ec", dot: "#1fa37a" },
};

/* ----------------------------- HASTALAR ----------------------------- */

export interface MockPatient {
  id: string;
  name: string;
  initials: string;
  age: number;
  woundType: WoundType;
  region: string;
  clinicalStatus: WoundClinicalStatus;
  /** null = henüz plan yok (değerlendirme), aksi PlanStatus */
  planStatus: PlanStatus | null;
  planType: PlanType | null;
  healingPercent: number | null;
  progressDay: number | null;
  planDurationDays: number | null;
  lastUpdate: string;
  priority: Priority;
  patientNote: string;
  diagnoses: string[];
  allergies: string[];
}

export const patients: MockPatient[] = [
  {
    id: "p1",
    name: "Ayşe Yılmaz",
    initials: "AY",
    age: 64,
    woundType: WoundType.DIABETIC_FOOT,
    region: "Sağ ayak topuk",
    clinicalStatus: WoundClinicalStatus.IMPROVING,
    planStatus: PlanStatus.ACTIVE,
    planType: PlanType.MONTHLY,
    healingPercent: 68,
    progressDay: 14,
    planDurationDays: 30,
    lastUpdate: "Bugün 09:12",
    priority: "low",
    patientNote: "Bugünkü fotoğrafım. Biraz kaşıntı var ama akıntı azaldı.",
    diagnoses: ["Tip 2 Diyabet", "Hipertansiyon"],
    allergies: ["Penisilin"],
  },
  {
    id: "p2",
    name: "Mehmet Demir",
    initials: "MD",
    age: 58,
    woundType: WoundType.PRESSURE,
    region: "Sakral bölge",
    clinicalStatus: WoundClinicalStatus.MONITORING,
    planStatus: PlanStatus.ACTIVE,
    planType: PlanType.WEEK_3,
    healingPercent: 41,
    progressDay: 9,
    planDurationDays: 21,
    lastUpdate: "Dün 18:40",
    priority: "low",
    patientNote: "Pansumanı değiştirdim, talimatları uyguladım.",
    diagnoses: ["Yatağa bağımlılık"],
    allergies: [],
  },
  {
    id: "p3",
    name: "Fatma Kaya",
    initials: "FK",
    age: 47,
    woundType: WoundType.SURGICAL,
    region: "Karın orta hat",
    clinicalStatus: WoundClinicalStatus.MONITORING,
    planStatus: PlanStatus.PROPOSED,
    planType: PlanType.WEEK_1,
    healingPercent: null,
    progressDay: null,
    planDurationDays: 7,
    lastUpdate: "Bugün 08:05",
    priority: "medium",
    patientNote: "Ameliyat bölgesinde hafif kızarıklık fark ettim.",
    diagnoses: ["Post-operatif"],
    allergies: [],
  },
  {
    id: "p4",
    name: "Hasan Şahin",
    initials: "HŞ",
    age: 71,
    woundType: WoundType.VENOUS,
    region: "Sol bacak iç malleol",
    clinicalStatus: WoundClinicalStatus.MONITORING,
    planStatus: null,
    planType: null,
    healingPercent: null,
    progressDay: null,
    planDurationDays: null,
    lastUpdate: "Bugün 07:30",
    priority: "high",
    patientNote: "Şiddetli ağrı ve artan kızarıklık var, koku da geldi.",
    diagnoses: ["Venöz yetmezlik"],
    allergies: ["Lateks"],
  },
  {
    id: "p5",
    name: "Elif Aydın",
    initials: "EA",
    age: 33,
    woundType: WoundType.BURN,
    region: "Sağ ön kol",
    clinicalStatus: WoundClinicalStatus.MONITORING,
    planStatus: null,
    planType: null,
    healingPercent: null,
    progressDay: null,
    planDurationDays: null,
    lastUpdate: "Bugün 06:55",
    priority: "medium",
    patientNote: "Kaynar su ile haşlandı, kabarcıklar oluştu.",
    diagnoses: [],
    allergies: [],
  },
  {
    id: "p6",
    name: "Ali Vural",
    initials: "AV",
    age: 52,
    woundType: WoundType.DIABETIC_FOOT,
    region: "Sol ayak başparmak",
    clinicalStatus: WoundClinicalStatus.IMPROVING,
    planStatus: PlanStatus.ACTIVE,
    planType: PlanType.MONTHLY,
    healingPercent: 82,
    progressDay: 24,
    planDurationDays: 30,
    lastUpdate: "2 gün önce",
    priority: "low",
    patientNote: "İyileşme çok iyi gidiyor, teşekkürler.",
    diagnoses: ["Tip 1 Diyabet"],
    allergies: [],
  },
];

export function getPatient(id: string): MockPatient | undefined {
  return patients.find((p) => p.id === id);
}

/** Havuz/değerlendirme kuyruğu: planı olmayan veya onay öncesi gönderimler. */
export const assessmentQueue = patients.filter(
  (p) => p.planStatus === null || p.planStatus === PlanStatus.PROPOSED,
);

/* ----------------------------- AKIŞ / FOTOĞRAF / MESAJ ----------------------------- */

export interface FeedItem {
  id: string;
  patientId: string;
  kind: "photo" | "message" | "assessment";
  day: string;
  title: string;
  body: string;
  healingPercent?: number;
}

export const feed: Record<string, FeedItem[]> = {
  p1: [
    {
      id: "f1",
      patientId: "p1",
      kind: "photo",
      day: "14. gün · Bugün 09:12",
      title: "Görsel + not",
      body: "Bugünkü fotoğrafım. Biraz kaşıntı var ama akıntı azaldı.",
      healingPercent: 68,
    },
    {
      id: "f2",
      patientId: "p1",
      kind: "message",
      day: "13. gün · Dün 20:10",
      title: "Mesaj",
      body: "Pansumanı akşam değiştirdim, talimatlara uydum.",
    },
    {
      id: "f3",
      patientId: "p1",
      kind: "assessment",
      day: "10. gün",
      title: "Hemşire değerlendirmesi",
      body: "Granülasyon dokusu artmış, enfeksiyon belirtisi yok. Pansuman aralığı korunsun.",
      healingPercent: 55,
    },
    {
      id: "f4",
      patientId: "p1",
      kind: "photo",
      day: "7. gün",
      title: "Görsel + not",
      body: "Akıntı biraz var, ağrı azaldı.",
      healingPercent: 42,
    },
  ],
};

export interface PhotoItem {
  id: string;
  day: string;
  healingPercent: number;
}

export const photos: Record<string, PhotoItem[]> = {
  p1: [
    { id: "ph1", day: "14. gün · Bugün", healingPercent: 68 },
    { id: "ph2", day: "10. gün", healingPercent: 55 },
    { id: "ph3", day: "7. gün", healingPercent: 42 },
    { id: "ph4", day: "3. gün", healingPercent: 22 },
    { id: "ph5", day: "1. gün", healingPercent: 0 },
  ],
};

export interface ChatMessage {
  id: string;
  dir: "in" | "out";
  text: string;
  time: string;
  isPhoto?: boolean;
}

export const chats: Record<string, ChatMessage[]> = {
  p1: [
    { id: "m1", dir: "in", text: "Merhaba, bugünkü fotoğrafımı gönderdim.", time: "09:12", isPhoto: true },
    { id: "m2", dir: "out", text: "Teşekkürler Ayşe Hanım, iyileşme iyi gidiyor. Pansumanı 2 günde bir değiştirin.", time: "09:30" },
    { id: "m3", dir: "in", text: "Tamam, kaşıntı için bir önerin var mı?", time: "09:34" },
    { id: "m4", dir: "out", text: "Kaşıntı iyileşmenin normal bir parçası. Bölgeyi kaşımayın, nemli tutun.", time: "09:40" },
  ],
  p2: [
    { id: "m1", dir: "in", text: "Pansumanı değiştirdim, fotoğraf ekledim.", time: "18:40", isPhoto: true },
    { id: "m2", dir: "out", text: "Çok iyi. Bası bölgesine basıncı azaltmaya devam edin.", time: "18:55" },
  ],
  p3: [
    { id: "m1", dir: "in", text: "Ameliyat bölgesinde kızarıklık var.", time: "08:05", isPhoto: true },
  ],
};

/** Gelen kutusu konuşma listesi. */
export interface Conversation {
  patientId: string;
  name: string;
  initials: string;
  preview: string;
  time: string;
  unread: number;
  planStatus: PlanStatus | null;
}

export const conversations: Conversation[] = [
  { patientId: "p1", name: "Ayşe Yılmaz", initials: "AY", preview: "Tamam, kaşıntı için bir önerin var mı?", time: "09:34", unread: 1, planStatus: PlanStatus.ACTIVE },
  { patientId: "p3", name: "Fatma Kaya", initials: "FK", preview: "Ameliyat bölgesinde kızarıklık var.", time: "08:05", unread: 2, planStatus: PlanStatus.PROPOSED },
  { patientId: "p2", name: "Mehmet Demir", initials: "MD", preview: "Pansumanı değiştirdim, fotoğraf ekledim.", time: "Dün", unread: 0, planStatus: PlanStatus.ACTIVE },
];

/* ----------------------------- ÖDEMELER ----------------------------- */

export interface MockPayment {
  id: string;
  patientId: string;
  patientName: string;
  planType: PlanType;
  amountKurus: number;
  status: PaymentStatus;
  date: string;
  receiptNo: string | null;
}

export const payments: MockPayment[] = [
  { id: "pay1", patientId: "p1", patientName: "Ayşe Yılmaz", planType: PlanType.MONTHLY, amountKurus: 89990, status: PaymentStatus.PAID, date: "12 Haz 2026", receiptNo: "SR-2026-0412" },
  { id: "pay2", patientId: "p6", patientName: "Ali Vural", planType: PlanType.MONTHLY, amountKurus: 89990, status: PaymentStatus.PAID, date: "8 Haz 2026", receiptNo: "SR-2026-0398" },
  { id: "pay3", patientId: "p2", patientName: "Mehmet Demir", planType: PlanType.WEEK_3, amountKurus: 69990, status: PaymentStatus.PAID, date: "5 Haz 2026", receiptNo: "SR-2026-0377" },
  { id: "pay4", patientId: "p3", patientName: "Fatma Kaya", planType: PlanType.WEEK_1, amountKurus: 29990, status: PaymentStatus.AWAITING_APPROVAL, date: "Bugün", receiptNo: null },
  { id: "pay5", patientId: "p1", patientName: "Ayşe Yılmaz", planType: PlanType.MONTHLY, amountKurus: 89990, status: PaymentStatus.PENDING, date: "12 Tem 2026", receiptNo: null },
];

export function patientPayments(patientId: string): MockPayment[] {
  return payments.filter((p) => p.patientId === patientId);
}

/** Aylık gelir (brüt kuruş) — bar grafiği için. */
export const monthlyRevenue: { month: string; grossKurus: number }[] = [
  { month: "Oca", grossKurus: 1849900 },
  { month: "Şub", grossKurus: 2199800 },
  { month: "Mar", grossKurus: 2699700 },
  { month: "Nis", grossKurus: 3149600 },
  { month: "May", grossKurus: 3599500 },
  { month: "Haz", grossKurus: 4049300 },
];

/* ----------------------------- RANDEVULAR ----------------------------- */

export interface MockAppointment {
  id: string;
  patientId: string;
  patientName: string;
  initials: string;
  type: AppointmentType;
  time: string;
  durationMin: number;
  status: AppointmentStatus;
}

export const appointments: MockAppointment[] = [
  { id: "a1", patientId: "p1", patientName: "Ayşe Yılmaz", initials: "AY", type: AppointmentType.VIDEO, time: "10:30", durationMin: 15, status: AppointmentStatus.CONFIRMED },
  { id: "a2", patientId: "p6", patientName: "Ali Vural", initials: "AV", type: AppointmentType.VOICE, time: "13:00", durationMin: 15, status: AppointmentStatus.CONFIRMED },
  { id: "a3", patientId: "p2", patientName: "Mehmet Demir", initials: "MD", type: AppointmentType.VIDEO, time: "15:45", durationMin: 20, status: AppointmentStatus.CONFIRMED },
];

export const appointmentRequests: MockAppointment[] = [
  { id: "r1", patientId: "p3", patientName: "Fatma Kaya", initials: "FK", type: AppointmentType.VIDEO, time: "Yarın 11:00", durationMin: 15, status: AppointmentStatus.REQUESTED },
  { id: "r2", patientId: "p5", patientName: "Elif Aydın", initials: "EA", type: AppointmentType.VOICE, time: "Yarın 16:30", durationMin: 15, status: AppointmentStatus.REQUESTED },
];

export const weekDays = [
  { label: "Pzt", date: "23", active: false },
  { label: "Sal", date: "24", active: false },
  { label: "Çar", date: "25", active: false },
  { label: "Per", date: "26", active: false },
  { label: "Cum", date: "27", active: false },
  { label: "Cmt", date: "28", active: false },
  { label: "Paz", date: "29", active: true },
];

/* ----------------------------- ŞABLONLAR ----------------------------- */

export interface MockTemplate {
  id: string;
  category: CareTemplateCategory;
  title: string;
  content: string;
  usageCount: number;
}

export const templates: MockTemplate[] = [
  { id: "t1", category: CareTemplateCategory.PRESSURE, title: "Bası yarası — günlük pansuman", content: "Yarayı serum fizyolojik ile temizleyin, basınç dağıtıcı yastık kullanın, 2 saatte bir pozisyon değiştirin.", usageCount: 34 },
  { id: "t2", category: CareTemplateCategory.DIABETIC_FOOT, title: "Diyabetik ayak — bakım talimatı", content: "Kan şekerini kontrol altında tutun, ayağa yük bindirmeyin, nemli yara örtüsü uygulayın.", usageCount: 51 },
  { id: "t3", category: CareTemplateCategory.SURGICAL, title: "Cerrahi yara — ilk hafta", content: "Bölgeyi kuru tutun, dikiş hattını kontrol edin, kızarıklık/ısı artışında bildirin.", usageCount: 22 },
  { id: "t4", category: CareTemplateCategory.EMERGENCY_REFERRAL, title: "Acil yönlendirme — risk işaretleri", content: "Ateş, artan kızarıklık, kötü koku veya şiddetli ağrıda derhal 112 / acil servise yönlendirin.", usageCount: 9 },
  { id: "t5", category: CareTemplateCategory.BURN, title: "Yanık — soğutma ve örtü", content: "Bölgeyi 10-20 dk soğuk suyla soğutun, kabarcıkları patlatmayın, steril örtü uygulayın.", usageCount: 14 },
];

/* ----------------------------- HEMŞİRELER (ADMIN) ----------------------------- */

export interface MockNurse {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  status: NurseStatus;
  activePatientCount: number;
  rating: number;
  experienceYears: number;
}

export const nurses: MockNurse[] = [
  { id: "n1", name: "Zeynep Başak", initials: "ZB", specialty: "Yara bakım uzmanı", status: NurseStatus.VERIFIED, activePatientCount: 12, rating: 4.9, experienceYears: 12 },
  { id: "n2", name: "Murat Çelik", initials: "MÇ", specialty: "Diyabetik ayak", status: NurseStatus.VERIFIED, activePatientCount: 8, rating: 4.7, experienceYears: 9 },
  { id: "n3", name: "Selin Arı", initials: "SA", specialty: "Stoma & yara", status: NurseStatus.VERIFIED, activePatientCount: 6, rating: 4.8, experienceYears: 7 },
  { id: "n4", name: "Burak Yıldız", initials: "BY", specialty: "Cerrahi yara", status: NurseStatus.PENDING, activePatientCount: 0, rating: 0, experienceYears: 5 },
];
