import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
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
} from "../components";
import { sansFont } from "../lib/theme";
import { createAssessment, woundTypeLabel } from "../lib/queries";
import { pickWoundPhoto, type PickedPhoto } from "../lib/photo";
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
  const [photo, setPhoto] = useState<PickedPhoto | null>(null);
  const [region, setRegion] = useState("");
  const [pain, setPain] = useState<PainLevel | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPickPhoto = async () => {
    const picked = await pickWoundPhoto();
    if (picked) setPhoto(picked);
  };

  const onSubmit = async () => {
    if (!type || !photo || !user) return;
    setLoading(true);
    setError(null);
    try {
      await createAssessment({
        patientId: user.id,
        type,
        photo,
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

      {photo ? (
        <View>
          <Image source={{ uri: photo.uri }} style={styles.preview} contentFit="cover" />
          <Text style={styles.fileName} numberOfLines={1}>
            {photo.fileName}
          </Text>
          <Button
            label="Fotoğrafı değiştir"
            variant="secondary"
            onPress={onPickPhoto}
            style={styles.changeBtn}
          />
        </View>
      ) : (
        <Pressable style={styles.uploader} onPress={onPickPhoto}>
          <Text style={styles.uploaderTitle}>Fotoğraf çek veya yükle</Text>
          <Text style={styles.uploaderSub}>Kamera · Galeri</Text>
        </Pressable>
      )}

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
        disabled={!photo || !type || loading}
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
  uploaderTitle: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "700", fontSize: 15 },
  uploaderSub: { fontFamily: sansFont, color: colors.textMuted, fontSize: 12 },
  preview: { height: 200, borderRadius: radius.md, backgroundColor: colors.surface },
  fileName: { fontFamily: sansFont, color: colors.textMuted, fontSize: 12, marginTop: spacing.sm },
  changeBtn: { marginTop: spacing.md },
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
