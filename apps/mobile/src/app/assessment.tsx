import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, radius, spacing } from "@saran/tokens";
import { PainLevel, WoundType } from "@saran/shared";
import {
  Body,
  Button,
  ChipGroup,
  Heading,
  InfoBanner,
  ScreenContainer,
  TextArea,
  TextField,
  WoundPhoto,
} from "../components";
import { sansFont } from "../lib/theme";
import { createAssessment, woundTypeLabel } from "../lib/queries";
import { useAuth } from "../lib/auth";

const woundTypeOptions: { value: WoundType; label: string; desc: string }[] = [
  { value: WoundType.PRESSURE, label: "Bası yarası", desc: "Yatak / oturma kaynaklı" },
  { value: WoundType.DIABETIC_FOOT, label: "Diyabetik ayak", desc: "Şeker hastalığına bağlı" },
  { value: WoundType.SURGICAL, label: "Cerrahi yara", desc: "Ameliyat sonrası" },
  { value: WoundType.VENOUS, label: "Venöz ülser", desc: "Damar kaynaklı" },
];

const painLevelOptions: { value: PainLevel; label: string }[] = [
  { value: PainLevel.NONE, label: "Yok" },
  { value: PainLevel.MILD, label: "Hafif" },
  { value: PainLevel.MODERATE, label: "Orta" },
  { value: PainLevel.SEVERE, label: "Şiddetli" },
];

/** README §6A-4: Ücretsiz Değerlendirme — foto + yara tipi + ağrı + not → DB. */
export default function Assessment() {
  const router = useRouter();
  const { user } = useAuth();
  const [type, setType] = useState<WoundType | null>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [region, setRegion] = useState("");
  const [pain, setPain] = useState<PainLevel | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!type || !hasPhoto || !user) return;
    setLoading(true);
    setError(null);
    try {
      await createAssessment({
        patientId: user.id,
        type,
        region: region.trim() || null,
        painLevel: pain ?? PainLevel.NONE,
        patientNote: note.trim() || null,
      });
      router.replace("/waiting");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gönderim sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <InfoBanner tone="info" icon="✓" text="İlk değerlendirme ücretsiz · Plan önerilene kadar ödeme alınmaz." />

      <View style={styles.stepRow}>
        <Text style={styles.step}>Adım 1 / 2</Text>
        <Text style={styles.stepLabel}>Fotoğraf & yara tipi</Text>
      </View>

      <Heading style={styles.title}>Yara fotoğrafını ekleyin</Heading>

      {hasPhoto ? (
        <WoundPhoto height={200} showReveal label="Yüklenen fotoğraf" />
      ) : (
        <Pressable style={styles.uploader} onPress={() => setHasPhoto(true)}>
          <Text style={styles.uploaderIcon}>📷</Text>
          <Text style={styles.uploaderTitle}>Fotoğraf çek veya yükle</Text>
          <Text style={styles.uploaderSub}>Kamera · Galeri</Text>
        </Pressable>
      )}

      {/* TODO: expo-image-picker kurulu degil — gerçek kamera/galeri eklenemiyor.
          Şimdilik placeholder foto gönderilir (bkz. createAssessment). */}
      {hasPhoto ? (
        <View style={styles.photoActions}>
          <Button label="Kamera" variant="secondary" full={false} icon="📷" onPress={() => {}} style={styles.flexBtn} />
          <Button label="Galeri" variant="secondary" full={false} icon="🖼️" onPress={() => {}} style={styles.flexBtn} />
        </View>
      ) : null}

      <Heading style={styles.title}>Yara tipi</Heading>
      <View style={styles.types}>
        {woundTypeOptions.map((o) => {
          const active = o.value === type;
          return (
            <Pressable
              key={o.value}
              onPress={() => setType(o.value)}
              style={[styles.typeCard, active && styles.typeCardActive]}
            >
              <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>{woundTypeLabel(o.value)}</Text>
              <Text style={[styles.typeDesc, active && styles.typeDescActive]}>{o.desc}</Text>
            </Pressable>
          );
        })}
      </View>

      <Heading style={styles.title}>Bölge & ağrı</Heading>
      <View style={styles.form}>
        <TextField label="Yara bölgesi" placeholder="Örn. sağ ayak topuğu" value={region} onChangeText={setRegion} />
        <View style={styles.painField}>
          <Text style={styles.painLabel}>Ağrı seviyesi</Text>
          <ChipGroup options={painLevelOptions} value={pain} onChange={setPain} />
        </View>
        <TextArea label="Notunuz (opsiyonel)" placeholder="Şikâyet, süre, ek bilgi..." value={note} onChangeText={setNote} />
      </View>

      <InfoBanner tone="success" icon="🔒" text="Fotoğrafınız şifrelenir; yalnızca atanmış hemşireniz açabilir." />

      {error ? <InfoBanner tone="danger" icon="⚠️" text={error} /> : null}

      <Button
        label="Hemşireye gönder"
        disabled={!hasPhoto || !type || loading}
        loading={loading}
        onPress={onSubmit}
        style={styles.cta}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stepRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.lg },
  step: { fontFamily: sansFont, color: colors.primary, fontWeight: "800", fontSize: 12 },
  stepLabel: { fontFamily: sansFont, color: colors.textMuted, fontSize: 12 },
  title: { fontSize: 18, marginTop: spacing.lg, marginBottom: spacing.md },
  uploader: {
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderStyle: "dashed",
    borderRadius: radius.md,
    paddingVertical: spacing["2xl"],
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
  },
  uploaderIcon: { fontSize: 36 },
  uploaderTitle: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "700", fontSize: 15 },
  uploaderSub: { fontFamily: sansFont, color: colors.textMuted, fontSize: 12 },
  photoActions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  flexBtn: { flex: 1 },
  types: { gap: spacing.md },
  typeCard: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  typeCardActive: { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.surfaceGreenAlt },
  typeLabel: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "700", fontSize: 15 },
  typeLabelActive: { color: colors.primary },
  typeDesc: { fontFamily: sansFont, color: colors.textMuted, fontSize: 12, marginTop: 2 },
  typeDescActive: { color: colors.primaryMid },
  form: { gap: spacing.md },
  painField: { gap: spacing.sm },
  painLabel: { fontFamily: sansFont, color: colors.textBody, fontWeight: "700", fontSize: 13 },
  cta: { marginTop: spacing.lg },
});
