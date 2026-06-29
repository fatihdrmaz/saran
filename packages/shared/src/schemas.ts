import { z } from "zod";
import {
  AppointmentType,
  ExudateLevel,
  NurseDocumentType,
  PainLevel,
  PlanType,
  WoundType,
} from "./enums";

/** Yardımcı: enum const objesinden zod enum. */
const fromConst = <T extends Record<string, string>>(obj: T) =>
  z.enum(Object.values(obj) as [string, ...string[]]);

const phoneTR = z
  .string()
  .regex(/^\+90\d{10}$/, "Telefon +90 ile başlamalı ve 10 hane olmalı");

/** Kayıt — README §6A-2. KVKK onayı zorunlu. */
export const registerSchema = z.object({
  fullName: z.string().min(2, "Ad Soyad girin"),
  phone: phoneTR,
  email: z.string().email("Geçerli e-posta girin"),
  password: z.string().min(8, "En az 8 karakter"),
  kvkkConsent: z.literal(true, {
    errorMap: () => ({ message: "KVKK onayı zorunludur" }),
  }),
});
export type RegisterInput = z.infer<typeof registerSchema>;

/** Ücretsiz değerlendirme gönderimi — README §6A-4 (fotoğraf + yara tipi). */
export const submissionSchema = z.object({
  woundType: fromConst(WoundType),
  imageUrl: z.string().min(1, "Fotoğraf gerekli"),
  region: z.string().optional(),
  painLevel: fromConst(PainLevel).default(PainLevel.NONE),
  exudate: fromConst(ExudateLevel).optional(),
  patientNote: z.string().max(1000).optional(),
});
export type SubmissionInput = z.infer<typeof submissionSchema>;

/**
 * Hemşire değerlendirmesi + plan önerisi — README §6C-3.
 * Hemşire bir öngörü yapar ve hastaya bir plan önerir; hasta onaylamadan akış açılmaz.
 */
export const assessmentSchema = z.object({
  submissionId: z.string().uuid(),
  tissueType: z.string().optional(),
  estimatedHealingDays: z.number().int().positive().optional(),
  prognosisNote: z.string().min(3, "Öngörü notu girin"),
  careInstruction: z.string().optional(),
  dressingSuggestion: z.string().optional(),
  /** önerilen plan */
  proposedPlanType: fromConst(PlanType),
});
export type AssessmentInput = z.infer<typeof assessmentSchema>;

/** Mesaj gönderimi. */
export const messageSchema = z.object({
  conversationId: z.string().uuid(),
  type: z.enum(["text", "image"]).default("text"),
  content: z.string().min(1),
});
export type MessageInput = z.infer<typeof messageSchema>;

/** Randevu talebi — README §6A-14. */
export const appointmentSchema = z.object({
  nurseId: z.string().uuid(),
  woundId: z.string().uuid().optional(),
  type: fromConst(AppointmentType),
  scheduledAt: z.string().datetime(),
  durationMin: z.number().int().positive().default(15),
});
export type AppointmentInput = z.infer<typeof appointmentSchema>;

/** Hemşire ekleme (admin) — README §6C-11, 3 adımlı form. */
export const nurseOnboardingSchema = z.object({
  fullName: z.string().min(2),
  phone: phoneTR,
  email: z.string().email(),
  specialty: z.string().min(2),
  experienceYears: z.number().int().min(0),
  diplomaNo: z.string().min(3),
  documents: z
    .array(
      z.object({
        type: fromConst(NurseDocumentType),
        url: z.string().min(1),
      }),
    )
    .min(1, "En az bir belge yükleyin"),
  kvkkConsent: z.literal(true),
});
export type NurseOnboardingInput = z.infer<typeof nurseOnboardingSchema>;
