"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NurseDocumentType, nurseOnboardingSchema } from "@saran/shared";
import { Button, Card } from "../../../components/ui";
import { adminCreateNurse } from "../../../lib/queries";

const STEPS = ["Kişisel bilgiler", "Mesleki bilgiler", "Belge & KVKK"];

const labelStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text-heading)",
  marginBottom: 6,
  display: "block",
} as const;
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--card-border)",
  borderRadius: 10,
  background: "#fff",
} as const;

const DOC_TYPES: { type: (typeof NurseDocumentType)[keyof typeof NurseDocumentType]; label: string }[] = [
  { type: NurseDocumentType.DIPLOMA, label: "Diploma" },
  { type: NurseDocumentType.CERTIFICATE, label: "Sertifika" },
  { type: NurseDocumentType.ID, label: "Kimlik" },
];

export function NurseOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+90");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [diplomaNo, setDiplomaNo] = useState("");
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});
  const [kvkk, setKvkk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const next = () => {
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    const documents = DOC_TYPES.filter((d) => uploaded[d.type]).map((d) => ({
      type: d.type,
      url: `mock://${d.type}.pdf`,
    }));
    const result = nurseOnboardingSchema.safeParse({
      fullName,
      phone,
      email,
      specialty,
      experienceYears: Number(experienceYears),
      diplomaNo,
      documents,
      kvkkConsent: kvkk,
    });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Form geçersiz");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await adminCreateNurse({
        fullName: result.data.fullName,
        phone: result.data.phone,
        email: result.data.email,
        specialty: result.data.specialty,
        experienceYears: result.data.experienceYears,
        diplomaNo: result.data.diplomaNo,
        documents: result.data.documents,
      });
      router.push("/ekip/eklendi");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Hemşire oluşturulamadı. Bu işlem yalnızca yöneticilere açıktır.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card style={{ maxWidth: 620 }}>
      {/* Adım göstergesi */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1 }}>
            <div
              style={{
                height: 6,
                borderRadius: 999,
                background: i <= step ? "var(--primary)" : "var(--surface-alt)",
              }}
            />
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: i === step ? "var(--primary)" : "var(--text-muted)",
                marginTop: 8,
              }}
            >
              {i + 1}. {s}
            </div>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={labelStyle}>Ad Soyad</label>
            <input style={inputStyle} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Telefon</label>
            <input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+905XXXXXXXXX" />
          </div>
          <div>
            <label style={labelStyle}>E-posta</label>
            <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
        </div>
      )}

      {step === 1 && (
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={labelStyle}>Uzmanlık</label>
            <input style={inputStyle} value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="ör. Yara bakım uzmanı" />
          </div>
          <div>
            <label style={labelStyle}>Deneyim (yıl)</label>
            <input style={inputStyle} type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Diploma no</label>
            <input style={inputStyle} value={diplomaNo} onChange={(e) => setDiplomaNo(e.target.value)} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "grid", gap: 14 }}>
          <label style={labelStyle}>Belge yükleme</label>
          {DOC_TYPES.map((d) => (
            <button
              key={d.type}
              onClick={() => setUploaded((u) => ({ ...u, [d.type]: !u[d.type] }))}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: `1px dashed ${uploaded[d.type] ? "var(--primary)" : "var(--card-border)"}`,
                background: uploaded[d.type] ? "var(--surface-green)" : "var(--surface)",
                borderRadius: 12,
                padding: "12px 16px",
                textAlign: "left",
              }}
            >
              <span style={{ fontWeight: 700, color: "var(--text-heading)" }}>{d.label}</span>
              <span style={{ fontSize: 13, color: uploaded[d.type] ? "var(--primary)" : "var(--text-muted)", fontWeight: 700 }}>
                {uploaded[d.type] ? "✓ Yüklendi" : "+ Dosya seç"}
              </span>
            </button>
          ))}
          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              fontSize: 13,
              color: "var(--text-body)",
              marginTop: 4,
            }}
          >
            <input type="checkbox" checked={kvkk} onChange={(e) => setKvkk(e.target.checked)} style={{ marginTop: 3 }} />
            <span>
              KVKK kapsamında kişisel ve mesleki verilerin işlenmesini onaylıyorum.
            </span>
          </label>
        </div>
      )}

      {error && (
        <div style={{ color: "var(--danger)", fontSize: 13, marginTop: 14, fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <Button variant="ghost" onClick={back} disabled={step === 0}>
          Geri
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next}>Devam</Button>
        ) : (
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Gönderiliyor…" : "Doğrulamaya gönder"}
          </Button>
        )}
      </div>
    </Card>
  );
}
