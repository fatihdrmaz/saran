import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { colors, radius, spacing } from "@saran/tokens";
import { WoundType } from "@saran/shared";
import type { Database } from "@saran/supabase";
import {
  Body,
  Button,
  Card,
  ChipGroup,
  Heading,
  ScreenContainer,
  SectionHeader,
  TextArea,
  WoundPhoto,
} from "../components";
import { sansFont } from "../lib/theme";
import { useAuth } from "../lib/auth";
import {
  createReview,
  getReviews,
  summarizeReviews,
  woundTypeLabel,
  type ReviewSummary,
} from "../lib/queries";

type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

const woundTypeOptions: { value: WoundType; label: string }[] = [
  { value: WoundType.PRESSURE, label: "Bası" },
  { value: WoundType.DIABETIC_FOOT, label: "Diyabetik ayak" },
  { value: WoundType.SURGICAL, label: "Cerrahi" },
  { value: WoundType.VENOUS, label: "Venöz" },
  { value: WoundType.BURN, label: "Yanık" },
];

function initials(id: string): string {
  return id.slice(0, 2).toUpperCase();
}

/** README §6A-16: Yorumlar — puan özeti + dağılım + yorum ekleme (CANLI). */
export default function Reviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({ average: 0, count: 0, distribution: [] });
  const [loading, setLoading] = useState(true);

  // Yorum ekleme formu
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [woundType, setWoundType] = useState<WoundType | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    getReviews()
      .then((data) => {
        if (!active) return;
        setReviews(data);
        setSummary(summarizeReviews(data));
      })
      .catch((e) => console.warn("[saran] yorumlar yüklenemedi:", e?.message))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(load);

  async function handleSubmit() {
    if (!user || !woundType || !text.trim()) {
      Alert.alert("Eksik bilgi", "Lütfen yara tipini seçin ve yorumunuzu yazın.");
      return;
    }
    setSubmitting(true);
    try {
      // before/after görseli opsiyonel; görsel seçici dep yok → placeholder (null).
      await createReview({
        patientId: user.id,
        rating,
        text: text.trim(),
        woundType,
      });
      setText("");
      setWoundType(null);
      setRating(5);
      setShowForm(false);
      load();
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

  return (
    <ScreenContainer>
      <Card style={styles.summary}>
        <View style={styles.summaryLeft}>
          <Text style={styles.bigRating}>{summary.count > 0 ? summary.average.toFixed(1) : "—"}</Text>
          <Text style={styles.stars}>★★★★★</Text>
          <Text style={styles.count}>{summary.count} yorum</Text>
        </View>
        <View style={styles.dist}>
          {summary.distribution.map((d) => (
            <View key={d.stars} style={styles.distRow}>
              <Text style={styles.distStar}>{d.stars}★</Text>
              <View style={styles.distTrack}>
                <View style={[styles.distFill, { width: `${Math.round(d.ratio * 100)}%` }]} />
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Button
        label={showForm ? "Vazgeç" : "Yorum yaz"}
        variant={showForm ? "secondary" : "primary"}
        icon={showForm ? undefined : "✍️"}
        onPress={() => setShowForm((s) => !s)}
        style={styles.addBtn}
      />

      {showForm ? (
        <Card style={styles.form}>
          <Text style={styles.formLabel}>Puanınız</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Pressable key={s} onPress={() => setRating(s)}>
                <Text style={[styles.ratingStar, s <= rating && styles.ratingStarActive]}>★</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.formLabel}>Yara tipi</Text>
          <ChipGroup options={woundTypeOptions} value={woundType} onChange={setWoundType} />

          <View style={styles.formField}>
            <TextArea
              label="Yorumunuz"
              placeholder="Deneyiminizi paylaşın..."
              value={text}
              onChangeText={setText}
            />
          </View>

          <Body color={colors.textMuted} style={styles.formNote}>
            Önce/sonra görseli eklemek ileride mümkün olacak; şimdilik gri yer tutucu gösterilir.
          </Body>

          <Button label="Yorumu gönder" loading={submitting} onPress={handleSubmit} />
        </Card>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="Hasta yorumları" />
        {reviews.length === 0 ? (
          <Card>
            <Body color={colors.textMuted} center>Henüz yorum yok. İlk yorumu siz yazın.</Body>
          </Card>
        ) : (
          <View style={{ gap: spacing.md }}>
            {reviews.map((r) => (
              <Card key={r.id}>
                <View style={styles.reviewHead}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials(r.display_name ?? "Hasta")}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.author}>{r.display_name ?? "Hasta"}</Text>
                    <Text style={styles.reviewMeta}>
                      {woundTypeLabel(r.wound_type)}
                      {r.duration_label ? ` · ${r.duration_label}` : ""}
                    </Text>
                  </View>
                  <Text style={styles.reviewStars}>{"★".repeat(r.rating)}</Text>
                </View>
                <Body color={colors.textBody} style={styles.reviewText}>{r.text}</Body>
                <View style={styles.beforeAfter}>
                  <WoundPhoto height={90} compact label="Önce" style={styles.baCell} />
                  <WoundPhoto height={90} compact label="Sonra" style={styles.baCell} />
                </View>
                <Text style={styles.approved}>✓ Hasta onaylı</Text>
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, minHeight: 320 },
  summary: { flexDirection: "row", gap: spacing.lg, alignItems: "center" },
  summaryLeft: { alignItems: "center", gap: 2 },
  bigRating: { fontFamily: sansFont, color: colors.primaryDark, fontWeight: "800", fontSize: 40 },
  stars: { color: colors.star, fontSize: 14 },
  count: { fontFamily: sansFont, color: colors.textMuted, fontSize: 11 },
  dist: { flex: 1, gap: 6 },
  distRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  distStar: { fontFamily: sansFont, color: colors.textMuted, fontSize: 11, width: 22 },
  distTrack: { flex: 1, height: 7, borderRadius: radius.pill, backgroundColor: colors.surfaceGreen, overflow: "hidden" },
  distFill: { height: "100%", backgroundColor: colors.star, borderRadius: radius.pill },
  addBtn: { marginTop: spacing.lg },
  form: { marginTop: spacing.lg, gap: spacing.sm },
  formLabel: { fontFamily: sansFont, color: colors.textBody, fontWeight: "700", fontSize: 14, marginTop: spacing.sm },
  ratingRow: { flexDirection: "row", gap: spacing.xs },
  ratingStar: { fontSize: 30, color: colors.cardBorder },
  ratingStarActive: { color: colors.star },
  formField: { marginTop: spacing.sm },
  formNote: { fontSize: 12, marginVertical: spacing.sm },
  section: { marginTop: spacing.xl },
  reviewHead: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surfaceGreen, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: sansFont, color: colors.primary, fontWeight: "800", fontSize: 12 },
  author: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "700", fontSize: 14 },
  reviewMeta: { fontFamily: sansFont, color: colors.textMuted, fontSize: 11 },
  reviewStars: { color: colors.star, fontSize: 13 },
  reviewText: { marginBottom: spacing.md, lineHeight: 20 },
  beforeAfter: { flexDirection: "row", gap: spacing.sm },
  baCell: { flex: 1, borderRadius: radius.sm },
  approved: { fontFamily: sansFont, color: colors.primary, fontSize: 11, fontWeight: "700", marginTop: spacing.sm },
});
