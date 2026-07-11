import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { colors, radius, spacing } from "@saran/tokens";
import { ExudateLevel, isTrackingUnlocked, PainLevel } from "@saran/shared";
import {
  Body,
  Button,
  ChipGroup,
  Heading,
  InfoBanner,
  ScreenContainer,
  TextArea,
} from "../components";
import { sansFont } from "../lib/theme";
import { useAuth } from "../lib/auth";
import { createSubmission, getWoundDetail, type WoundDetail } from "../lib/queries";
import { pickWoundPhoto, type PickedPhoto } from "../lib/photo";

const painLevelOptions: { value: PainLevel; label: string }[] = [
  { value: PainLevel.NONE, label: "Yok" },
  { value: PainLevel.MILD, label: "Hafif" },
  { value: PainLevel.MODERATE, label: "Orta" },
  { value: PainLevel.SEVERE, label: "Şiddetli" },
];

const exudateOptions: { value: ExudateLevel; label: string }[] = [
  { value: ExudateLevel.NONE, label: "Yok" },
  { value: ExudateLevel.LIGHT, label: "Az" },
  { value: ExudateLevel.MODERATE, label: "Orta" },
  { value: ExudateLevel.HEAVY, label: "Çok" },
];

/** README §6A-11: Fotoğraf Gönder — MEVCUT yaraya yeni gönderim (CANLI). */
export default function PhotoSubmit() {
  const router = useRouter();
  const { user } = useAuth();
  const { woundId } = useLocalSearchParams<{ woundId?: string }>();
  const [detail, setDetail] = useState<WoundDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Kamera/galeriden seçilen GERÇEK fotoğraf (bkz. lib/photo.ts).
  const [photo, setPhoto] = useState<PickedPhoto | null>(null);
  const [pain, setPain] = useState<PainLevel | null>(null);
  const [exudate, setExudate] = useState<ExudateLevel | null>(null);
  const [note, setNote] = useState("");

  const onPickPhoto = async () => {
    const picked = await pickWoundPhoto();
    if (picked) setPhoto(picked);
  };

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      setLoading(true);
      getWoundDetail(user.id, woundId ?? null)
        .then((data) => {
          if (active) setDetail(data);
        })
        .catch((e) => console.warn("[saran] yara yüklenemedi:", e?.message))
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [user, woundId]),
  );

  const wound = detail?.wound ?? null;
  const unlocked = isTrackingUnlocked(detail?.plan?.status);

  async function handleSubmit() {
    if (!wound || !photo) return;
    setSubmitting(true);
    try {
      await createSubmission({
        woundId: wound.id,
        photo,
        painLevel: pain ?? PainLevel.NONE,
        exudate,
        patientNote: note.trim() ? note.trim() : null,
      });
      // Başarıda yara detayına dön (yeni gönderim listede görünür).
      router.replace({ pathname: "/wound-detail", params: { woundId: wound.id } });
    } catch (e) {
      Alert.alert("Gönderilemedi", (e as Error)?.message ?? "Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!wound) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🩹</Text>
          <Heading center style={styles.emptyTitle}>Takip edilecek yara yok</Heading>
          <Body center color={colors.textMuted}>
            Önce ücretsiz değerlendirme gönderin; ardından bu yaraya fotoğraf ekleyebilirsiniz.
          </Body>
          <Button label="Değerlendirme başlat" onPress={() => router.push("/assessment")} style={styles.cta} />
        </View>
      </ScreenContainer>
    );
  }

  // Takip kilidi: aktif plan yoksa yeni gönderim alınmaz (nazik uyarı).
  if (!unlocked) {
    return (
      <ScreenContainer>
        <Heading style={styles.title}>Yeni fotoğraf gönder</Heading>
        <InfoBanner
          tone="info"
          icon="🔒"
          text="Takip kilitli. Yeni fotoğraf gönderebilmek için önce bakım planınızın onaylanması gerekir."
        />
        <Button label="Plan önerimi gör" onPress={() => router.push("/plan-proposal")} style={styles.cta} />
        <Button label="Geri dön" variant="secondary" onPress={() => router.back()} style={styles.altCta} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Heading style={styles.title}>Yeni fotoğraf gönder</Heading>
      <Body color={colors.textMuted} style={styles.sub}>
        Yaranızın güncel halini paylaşın; hemşireniz değerlendirsin.
      </Body>

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

      <Text style={styles.label}>Ağrı seviyeniz?</Text>
      <ChipGroup options={painLevelOptions} value={pain} onChange={setPain} />

      <Text style={styles.label}>Akıntı durumu?</Text>
      <ChipGroup options={exudateOptions} value={exudate} onChange={setExudate} />

      <View style={styles.noteWrap}>
        <TextArea
          label="Not (opsiyonel)"
          placeholder="Kaşıntı, akıntı, kızarıklık gibi belirtileri yazın..."
          value={note}
          onChangeText={setNote}
        />
      </View>

      <InfoBanner tone="success" icon="🔒" text="Fotoğrafınız şifrelenir; yalnızca atanmış hemşireniz açabilir." />

      <Button
        label="Hemşireye gönder"
        disabled={!photo || submitting}
        loading={submitting}
        onPress={handleSubmit}
        style={styles.cta}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.sm, minHeight: 320 },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { marginTop: spacing.sm },
  title: { fontSize: 20 },
  sub: { marginTop: spacing.xs, marginBottom: spacing.lg },
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
  label: { fontFamily: sansFont, color: colors.textBody, fontWeight: "700", fontSize: 14, marginTop: spacing.xl, marginBottom: spacing.md },
  noteWrap: { marginTop: spacing.xl },
  cta: { marginTop: spacing.lg },
  altCta: { marginTop: spacing.md },
});
