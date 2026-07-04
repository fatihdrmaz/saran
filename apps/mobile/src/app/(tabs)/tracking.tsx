import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@saran/tokens";
import { isTrackingUnlocked } from "@saran/shared";
import {
  Body,
  Button,
  Card,
  HealingChart,
  ProgressBar,
  ScreenContainer,
  SectionHeader,
  StatusBadge,
  Timeline,
  type TimelineStep,
  WoundPhoto,
} from "../../components";
import { sansFont } from "../../lib/theme";
import { useAuth } from "../../lib/auth";
import {
  getWoundOverviews,
  getWoundSubmissions,
  planTypeLabel,
  woundTypeLabel,
  type WoundOverview,
} from "../../lib/queries";
import type { Database } from "@saran/supabase";

type SubmissionRow = Database["public"]["Tables"]["submissions"]["Row"];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  } catch {
    return iso.slice(0, 10);
  }
}

/** README §6A-9/10/12: Takip sekmesi — yara özeti, plan ilerlemesi, zaman çizelgesi (CANLI). */
export default function Tracking() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [overview, setOverview] = useState<WoundOverview | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      setLoading(true);
      getWoundOverviews(user.id)
        .then(async (data) => {
          if (!active) return;
          const primary = data[0] ?? null;
          setOverview(primary);
          if (primary) {
            const subs = await getWoundSubmissions(primary.wound.id);
            if (active) setSubmissions(subs);
          } else {
            setSubmissions([]);
          }
        })
        .catch((e) => console.warn("[saran] takip yüklenemedi:", e?.message))
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [user]),
  );

  const plan = overview?.plan ?? null;
  const unlocked = isTrackingUnlocked(plan?.status);
  const latestPercent = submissions[0]?.healing_percent ?? null;

  const steps: TimelineStep[] = submissions.map((s, i) => ({
    title: s.healing_percent != null ? `${formatDate(s.created_at)} · %${s.healing_percent}` : formatDate(s.created_at),
    subtitle: s.patient_note ?? "Gönderim alındı.",
    state: i === 0 ? "active" : "done",
  }));

  const chartData = [...submissions]
    .reverse()
    .filter((s) => s.healing_percent != null)
    .map((s) => ({ label: formatDate(s.created_at), value: s.healing_percent as number }));

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.title}>Takip</Text>
      </View>
      <ScreenContainer tabBarSpacing contentStyle={{ paddingTop: spacing.sm }}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : !overview ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📈</Text>
            <Text style={styles.emptyTitle}>Takip edilecek yara yok</Text>
            <Body color={colors.textMuted} center>
              Ücretsiz değerlendirme gönderdiğinizde yaranız burada görünür.
            </Body>
            <Button label="Değerlendirme başlat" onPress={() => router.push("/assessment")} />
          </Card>
        ) : (
          <>
            <Card>
              <View style={styles.head}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.woundTitle}>{woundTypeLabel(overview.wound.type)}</Text>
                  <Text style={styles.woundRegion}>
                    {overview.wound.region ?? "Bölge belirtilmedi"} · Başlangıç {formatDate(overview.wound.started_at)}
                  </Text>
                </View>
                <StatusBadge status={unlocked ? "active" : "pending"} />
              </View>
              <WoundPhoto height={160} showReveal healingPercent={latestPercent ?? undefined} style={styles.photo} />
              {latestPercent != null ? (
                <View style={styles.progress}>
                  <ProgressBar percent={latestPercent} label="Toplam iyileşme" />
                </View>
              ) : null}
              {plan ? (
                <View style={styles.planRow}>
                  <Text style={styles.planLabel}>{planTypeLabel(plan.type)}</Text>
                  <Text style={styles.planDays}>
                    {plan.progress_day != null ? `${plan.progress_day}. gün` : "—"}
                  </Text>
                </View>
              ) : null}
            </Card>

            <View style={styles.actions}>
              <Button label="Yeni fotoğraf ekle" icon="📷" full={false} onPress={() => router.push("/photo-submit")} style={styles.flex1} />
              <Button label="Arşiv" variant="secondary" full={false} onPress={() => router.push("/wound-archive")} style={styles.flex1} />
            </View>

            {chartData.length > 0 ? (
              <View style={styles.section}>
                <SectionHeader title="İyileşme grafiği" actionLabel="Tüm fotoğraflar" onAction={() => router.push("/wound-archive")} />
                <HealingChart data={chartData} />
              </View>
            ) : null}

            {steps.length > 0 ? (
              <View style={styles.section}>
                <SectionHeader title="Zaman çizelgesi" actionLabel="Detay" onAction={() => router.push("/wound-detail")} />
                <Card>
                  <Timeline steps={steps} />
                </Card>
              </View>
            ) : null}

            <Body color={colors.textMuted} center style={styles.foot}>
              Tüm fotoğraflar 🔒 şifreli saklanır; yalnızca atanmış hemşireniz açabilir.
            </Body>
          </>
        )}
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bgCream },
  flex1: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  title: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "800", fontSize: 22 },
  loadingBox: { alignItems: "center", paddingVertical: spacing["2xl"] },
  emptyCard: { alignItems: "center", gap: spacing.md, marginTop: spacing.lg },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "800", fontSize: 16 },
  head: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md },
  woundTitle: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "700", fontSize: 15 },
  woundRegion: { fontFamily: sansFont, color: colors.textMuted, fontSize: 12 },
  photo: {},
  progress: { marginTop: spacing.md },
  planRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  planLabel: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "700", fontSize: 13 },
  planDays: { fontFamily: sansFont, color: colors.primary, fontWeight: "800", fontSize: 13 },
  actions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  section: { marginTop: spacing.xl },
  foot: { marginTop: spacing.xl },
});
