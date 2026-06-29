/**
 * Mock veri — Supabase ÇALIŞMIYOR. Ekranlar bu mock'larla beslenir.
 * @saran/shared'tan domain tipleri/enum'ları kullanılır ki tutarlı kalsın.
 */
import {
  AppointmentType,
  PainLevel,
  PaymentStatus,
  PlanStatus,
  PlanType,
  WoundType,
  PLAN_PRICES,
  PLAN_DURATION_DAYS,
  type EmergencyFlag,
} from "@saran/shared";

export interface MockNurse {
  id: string;
  fullName: string;
  title: string;
  specialty: string;
  experienceYears: number;
  patientCount: string;
  rating: number;
  reviewCount: number;
  online: boolean;
  bio: string;
  certificates: string[];
}

export const nurse: MockNurse = {
  id: "nurse-1",
  fullName: "Ayşe Yılmaz",
  title: "Sertifikalı Yara Bakım Hemşiresi",
  specialty: "Kronik yara & diyabetik ayak bakımı",
  experienceYears: 12,
  patientCount: "1.200+",
  rating: 4.9,
  reviewCount: 312,
  online: true,
  bio: "12 yıldır yara bakım alanında çalışıyorum. Diyabetik ayak, bası ve cerrahi yaraların uzaktan takibinde uzmanım. Amacım, iyileşme sürecinizde size güvenli ve düzenli bir destek sunmak.",
  certificates: [
    "Yara Bakım Hemşireliği Sertifikası",
    "Türk Hemşireler Derneği üyesi",
    "Diyabetik Ayak Bakımı İleri Eğitimi",
  ],
};

export interface MockUser {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  memberSince: string;
}

export const user: MockUser = {
  id: "patient-1",
  fullName: "Mehmet Demir",
  phone: "+90 532 123 45 67",
  email: "mehmet.demir@example.com",
  memberSince: "Mart 2025",
};

export interface MockPlan {
  id: string;
  type: PlanType;
  name: string;
  priceKurus: number;
  durationDays: number | null;
  status: PlanStatus;
  features: string[];
  popular?: boolean;
  progressDay?: number;
}

export const proposedPlan: MockPlan = {
  id: "plan-1",
  type: PlanType.MONTHLY,
  name: "Aylık Takip",
  priceKurus: PLAN_PRICES[PlanType.MONTHLY],
  durationDays: PLAN_DURATION_DAYS[PlanType.MONTHLY],
  status: PlanStatus.PROPOSED,
  popular: true,
  features: [
    "Sınırsız fotoğraf gönderimi",
    "Haftalık hemşire değerlendirmesi",
    "Anlık mesajlaşma",
    "İyileşme zaman çizelgesi",
  ],
};

export const activePlan: MockPlan = {
  ...proposedPlan,
  status: PlanStatus.ACTIVE,
  progressDay: 20,
};

export const allPlans: MockPlan[] = [
  {
    id: "plan-week1",
    type: PlanType.WEEK_1,
    name: "1 Haftalık",
    priceKurus: PLAN_PRICES[PlanType.WEEK_1],
    durationDays: PLAN_DURATION_DAYS[PlanType.WEEK_1],
    status: PlanStatus.PROPOSED,
    features: ["7 gün takip", "Sınırsız fotoğraf", "Mesajlaşma"],
  },
  {
    id: "plan-week3",
    type: PlanType.WEEK_3,
    name: "3 Haftalık",
    priceKurus: PLAN_PRICES[PlanType.WEEK_3],
    durationDays: PLAN_DURATION_DAYS[PlanType.WEEK_3],
    status: PlanStatus.PROPOSED,
    features: ["21 gün takip", "Sınırsız fotoğraf", "Haftalık değerlendirme", "Mesajlaşma"],
  },
  {
    id: "plan-monthly",
    type: PlanType.MONTHLY,
    name: "Aylık Takip",
    priceKurus: PLAN_PRICES[PlanType.MONTHLY],
    durationDays: PLAN_DURATION_DAYS[PlanType.MONTHLY],
    status: PlanStatus.PROPOSED,
    popular: true,
    features: [
      "30 gün takip",
      "Sınırsız fotoğraf gönderimi",
      "Haftalık değerlendirme",
      "Anlık mesajlaşma",
      "Randevu hakkı",
    ],
  },
  {
    id: "plan-onetime",
    type: PlanType.ONE_TIME,
    name: "Tek Seferlik",
    priceKurus: PLAN_PRICES[PlanType.ONE_TIME],
    durationDays: PLAN_DURATION_DAYS[PlanType.ONE_TIME],
    status: PlanStatus.PROPOSED,
    features: ["Tek bakım talimatı", "Pansuman önerisi"],
  },
];

export interface MockWound {
  id: string;
  type: WoundType;
  typeLabel: string;
  region: string;
  healingPercent: number;
  startedAt: string;
  clinicalStatusLabel: string;
}

export const wound: MockWound = {
  id: "wound-1",
  type: WoundType.DIABETIC_FOOT,
  typeLabel: "Diyabetik ayak yarası",
  region: "Sağ ayak topuğu",
  healingPercent: 68,
  startedAt: "12 Mart 2025",
  clinicalStatusLabel: "İyileşiyor",
};

export const woundTypeOptions: { value: WoundType; label: string; desc: string }[] = [
  { value: WoundType.PRESSURE, label: "Bası yarası", desc: "Yatak / oturma kaynaklı" },
  { value: WoundType.DIABETIC_FOOT, label: "Diyabetik ayak", desc: "Şeker hastalığına bağlı" },
  { value: WoundType.SURGICAL, label: "Cerrahi yara", desc: "Ameliyat sonrası" },
  { value: WoundType.VENOUS, label: "Venöz ülser", desc: "Damar kaynaklı" },
];

export interface MockTimelineEntry {
  id: string;
  dayLabel: string;
  date: string;
  healingPercent: number;
  note: string;
}

/** Yeni → eski. Yara detayı zaman çizelgesi. */
export const woundTimeline: MockTimelineEntry[] = [
  { id: "t-1", dayLabel: "Bugün", date: "26 Haz", healingPercent: 68, note: "Doku belirgin iyileşme gösteriyor." },
  { id: "t-2", dayLabel: "1. gün", date: "25 Haz", healingPercent: 60, note: "Akıntı azaldı, kızarıklık geriledi." },
  { id: "t-3", dayLabel: "7. gün", date: "19 Haz", healingPercent: 42, note: "Granülasyon dokusu oluşmaya başladı." },
  { id: "t-4", dayLabel: "14. gün", date: "12 Haz", healingPercent: 20, note: "İlk değerlendirme yapıldı." },
];

export interface MockArchivePhoto {
  id: string;
  date: string;
  healingPercent: number;
}

export const woundArchive: MockArchivePhoto[] = [
  { id: "a-1", date: "26 Haz", healingPercent: 68 },
  { id: "a-2", date: "22 Haz", healingPercent: 60 },
  { id: "a-3", date: "19 Haz", healingPercent: 42 },
  { id: "a-4", date: "16 Haz", healingPercent: 34 },
  { id: "a-5", date: "12 Haz", healingPercent: 20 },
  { id: "a-6", date: "8 Haz", healingPercent: 12 },
];

export const painLevelOptions: { value: PainLevel; label: string }[] = [
  { value: PainLevel.NONE, label: "Yok" },
  { value: PainLevel.MILD, label: "Hafif" },
  { value: PainLevel.MODERATE, label: "Orta" },
  { value: PainLevel.SEVERE, label: "Şiddetli" },
];

export interface MockMessage {
  id: string;
  fromNurse: boolean;
  type: "text" | "image";
  content: string;
  time: string;
}

export const messages: MockMessage[] = [
  { id: "m-1", fromNurse: true, type: "text", content: "Merhaba Mehmet Bey, bugünkü fotoğrafınızı bekliyorum.", time: "09:12" },
  { id: "m-2", fromNurse: false, type: "image", content: "", time: "09:40" },
  { id: "m-3", fromNurse: false, type: "text", content: "Bugünkü fotoğrafım. Biraz kaşıntı var.", time: "09:40" },
  { id: "m-4", fromNurse: true, type: "text", content: "Teşekkürler, iyileşme çok güzel ilerliyor. Kaşıntı normal, pansumanı bugün yenileyin.", time: "10:05" },
  { id: "m-5", fromNurse: true, type: "text", content: "Akıntı artarsa hemen bana yazın.", time: "10:06" },
];

export const quickReplies: string[] = [
  "Teşekkürler 🙏",
  "Tamam, yenileyeceğim",
  "Ağrım arttı",
  "Fotoğraf gönderiyorum",
];

export interface MockReview {
  id: string;
  authorLabel: string;
  rating: number;
  text: string;
  woundLabel: string;
  durationLabel: string;
}

export const reviews: MockReview[] = [
  {
    id: "r-1",
    authorLabel: "S.K.",
    rating: 5,
    text: "Annemin diyabetik ayak yarası 6 haftada belirgin iyileşti. Hemşiremiz her gün ilgilendi.",
    woundLabel: "Annesi için",
    durationLabel: "6 hafta takip",
  },
  {
    id: "r-2",
    authorLabel: "A.T.",
    rating: 5,
    text: "Ameliyat sonrası yaramı evden takip ettirdim, hastaneye gitmeme gerek kalmadı. Çok rahatım.",
    woundLabel: "Cerrahi yara",
    durationLabel: "3 hafta takip",
  },
  {
    id: "r-3",
    authorLabel: "M.Y.",
    rating: 4,
    text: "Bası yarası için aldım, düzenli geri bildirim çok değerliydi. Mesajlara hızlı dönüldü.",
    woundLabel: "Bası yarası",
    durationLabel: "1 ay takip",
  },
];

export const ratingDistribution: { stars: number; ratio: number }[] = [
  { stars: 5, ratio: 0.86 },
  { stars: 4, ratio: 0.1 },
  { stars: 3, ratio: 0.03 },
  { stars: 2, ratio: 0.005 },
  { stars: 1, ratio: 0.005 },
];

export interface MockNotification {
  id: string;
  kind: "plan" | "message" | "payment" | "emergency";
  title: string;
  body: string;
  time: string;
  unread: boolean;
  route: string;
}

export const notifications: MockNotification[] = [
  {
    id: "n-1",
    kind: "plan",
    title: "Bakım planı önerisi hazır",
    body: "Hemşireniz değerlendirmenizi tamamladı →",
    time: "5 dk önce",
    unread: true,
    route: "/plan-proposal",
  },
  {
    id: "n-2",
    kind: "message",
    title: "Hem. Ayşe size mesaj gönderdi",
    body: "Akıntı artarsa hemen bana yazın.",
    time: "1 saat önce",
    unread: true,
    route: "/(tabs)/messages",
  },
  {
    id: "n-3",
    kind: "payment",
    title: "Ödemeniz onaylandı",
    body: "Aylık Takip planınız başladı · makbuz hazır →",
    time: "2 gün önce",
    unread: false,
    route: "/invoice",
  },
];

export interface MockAppointmentSlot {
  time: string;
  available: boolean;
}

export const appointmentDays: { id: string; dayLabel: string; date: string }[] = [
  { id: "d-1", dayLabel: "Pzt", date: "30 Haz" },
  { id: "d-2", dayLabel: "Sal", date: "1 Tem" },
  { id: "d-3", dayLabel: "Çar", date: "2 Tem" },
  { id: "d-4", dayLabel: "Per", date: "3 Tem" },
  { id: "d-5", dayLabel: "Cum", date: "4 Tem" },
];

export const appointmentSlots: MockAppointmentSlot[] = [
  { time: "09:00", available: true },
  { time: "10:00", available: false },
  { time: "11:00", available: true },
  { time: "13:30", available: true },
  { time: "15:00", available: true },
  { time: "16:30", available: false },
  { time: "18:00", available: true },
  { time: "19:00", available: true },
];

export const appointmentTypes: { value: AppointmentType; label: string; icon: string }[] = [
  { value: AppointmentType.VIDEO, label: "Görüntülü", icon: "🎥" },
  { value: AppointmentType.VOICE, label: "Sesli", icon: "📞" },
];

export interface MockPayment {
  receiptNo: string;
  planName: string;
  amountKurus: number;
  vatKurus: number;
  totalKurus: number;
  paidAt: string;
  status: PaymentStatus;
  method: string;
}

export const payment: MockPayment = {
  receiptNo: "SRN-2025-004821",
  planName: "Aylık Takip",
  amountKurus: 74992,
  vatKurus: 14998,
  totalKurus: 89990,
  paidAt: "26 Haziran 2025, 14:32",
  status: PaymentStatus.PAID,
  method: "•••• 4242 (Visa)",
};

export interface MockEmergencyFlag {
  flag: EmergencyFlag;
  label: string;
  detected: boolean;
}

export const emergencyFlags: MockEmergencyFlag[] = [
  { flag: "increasing_redness", label: "Artan kızarıklık", detected: true },
  { flag: "fever", label: "Ateş (38°C üzeri)", detected: true },
  { flag: "foul_odor", label: "Kötü koku", detected: false },
  { flag: "severe_pain", label: "Şiddetli ağrı", detected: true },
];

export const trustStats: { value: string; label: string }[] = [
  { value: "4,9★", label: "312 yorum" },
  { value: "%91", label: "planını tamamladı" },
  { value: "1.200+", label: "iyileşen yara" },
];

export const howItWorks: { step: string; title: string; desc: string }[] = [
  { step: "1", title: "Fotoğrafınızı gönderin", desc: "Yaranızın fotoğrafını çekip kısa soruları yanıtlayın." },
  { step: "2", title: "Hemşire değerlendirir", desc: "Uzman hemşireniz inceler ve bakım planı önerir." },
  { step: "3", title: "İyileşmeyi takip edin", desc: "Plan onayından sonra düzenli takip ve mesajlaşma başlar." },
];

export const successStories: { id: string; label: string; duration: string }[] = [
  { id: "s-1", label: "Diyabetik ayak", duration: "8 hafta" },
  { id: "s-2", label: "Bası yarası", duration: "5 hafta" },
  { id: "s-3", label: "Cerrahi yara", duration: "3 hafta" },
];
