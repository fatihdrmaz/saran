import type {
  AppointmentStatus,
  AppointmentType,
  CareTemplateCategory,
  ExudateLevel,
  Locale,
  MessageType,
  NurseDocumentType,
  NurseStatus,
  PainLevel,
  PaymentStatus,
  PlanStatus,
  PlanType,
  UserRole,
  VerificationStatus,
  WoundClinicalStatus,
  WoundType,
} from "./enums";

/**
 * Alan (domain) tipleri — camelCase. DB satır tipleri (snake_case) ayrıdır ve
 * @saran/supabase içinde üretilir; eşleme (mapper) ön yüzde yapılır.
 */

type Id = string; // uuid
type ISODate = string; // ISO 8601 timestamp

export interface Profile {
  id: Id; // = auth.users.id
  role: UserRole;
  fullName: string;
  phone: string;
  email: string;
  locale: Locale;
  kvkkConsentAt: ISODate | null;
  createdAt: ISODate;
  deletedAt: ISODate | null;
}

export interface Patient {
  id: Id; // = profile.id
  age: number | null;
  diagnoses: string[];
  allergies: string[];
  emergencyContact: string | null;
}

export interface Nurse {
  id: Id; // = profile.id
  specialty: string;
  experienceYears: number;
  diplomaNo: string;
  status: NurseStatus; // verified olmadan hasta atanamaz
  rating: number; // 0–5
  activePatientCount: number;
  bio: string | null;
}

export interface NurseDocument {
  id: Id;
  nurseId: Id;
  type: NurseDocumentType;
  url: string;
  verificationStatus: VerificationStatus;
  createdAt: ISODate;
}

export interface Wound {
  id: Id;
  patientId: Id;
  /** KARAR: havuz modeli — atanana kadar null. RLS bununla kilitlenir. */
  assignedNurseId: Id | null;
  type: WoundType;
  region: string; // bölge
  clinicalStatus: WoundClinicalStatus;
  startedAt: ISODate;
  createdAt: ISODate;
  deletedAt: ISODate | null;
}

export interface Submission {
  id: Id;
  woundId: Id;
  imageUrl: string; // şifreli storage yolu
  patientNote: string | null;
  painLevel: PainLevel;
  exudate: ExudateLevel | null;
  /** o anki iyileşme snapshot'ı (arşiv grafiği bundan çizilir) */
  healingPercent: number | null;
  createdAt: ISODate;
}

/** Hemşire değerlendirmesi — bir gönderime bağlı, plan önerisini tetikler. */
export interface Assessment {
  id: Id;
  submissionId: Id;
  nurseId: Id;
  tissueType: string | null;
  estimatedHealingDays: number | null;
  prognosisNote: string; // öngörü notu (evre + tahmini süre)
  careInstruction: string | null;
  dressingSuggestion: string | null;
  createdAt: ISODate;
}

export interface Plan {
  id: Id;
  woundId: Id; // KARAR: plan yara başına
  patientId: Id;
  proposedByNurseId: Id;
  type: PlanType;
  priceKurus: number;
  status: PlanStatus; // proposed → active → expired / cancelled
  prognosisNote: string | null;
  startedAt: ISODate | null;
  endsAt: ISODate | null;
  progressDay: number | null; // X/30 gün
  createdAt: ISODate;
}

export interface Payment {
  id: Id;
  patientId: Id;
  planId: Id;
  amountKurus: number;
  vatKurus: number;
  status: PaymentStatus;
  receiptNo: string | null;
  paidAt: ISODate | null;
  createdAt: ISODate;
}

/** Hasta ↔ hemşire sohbeti (yara üstünden değil, kişi çifti). */
export interface Conversation {
  id: Id;
  patientId: Id;
  nurseId: Id;
  lastMessageAt: ISODate | null;
  createdAt: ISODate;
}

export interface Message {
  id: Id;
  conversationId: Id;
  senderId: Id; // patient veya nurse profile id
  type: MessageType;
  content: string; // metin veya görsel url
  readAt: ISODate | null;
  createdAt: ISODate;
}

export interface Appointment {
  id: Id;
  patientId: Id;
  nurseId: Id;
  woundId: Id | null;
  type: AppointmentType;
  scheduledAt: ISODate;
  durationMin: number;
  status: AppointmentStatus;
  createdAt: ISODate;
}

export interface Review {
  id: Id;
  patientId: Id;
  rating: number; // 1–5
  text: string;
  beforeImageUrl: string | null; // hasta onaylı
  afterImageUrl: string | null;
  woundType: WoundType;
  durationLabel: string | null; // ör. "6 hafta"
  createdAt: ISODate;
}

export interface CareTemplate {
  id: Id;
  nurseId: Id | null; // null = global şablon
  category: CareTemplateCategory;
  title: string;
  content: string;
  usageCount: number;
  createdAt: ISODate;
}

export interface Article {
  id: Id;
  category: string;
  title: string;
  slug: string;
  intro: string;
  body: string; // markdown / yapılandırılmış gövde
  authorNurseId: Id | null;
  readingMinutes: number;
  locale: Locale;
  publishedAt: ISODate | null;
  createdAt: ISODate;
}

export interface AccessLog {
  id: Id;
  actorId: Id; // erişen profile
  resourceType: string; // ör. "submission_image"
  resourceId: Id;
  action: string; // ör. "view" / "decrypt"
  createdAt: ISODate;
}
