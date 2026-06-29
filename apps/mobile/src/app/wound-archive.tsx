import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing } from "@saran/tokens";
import {
  Body,
  Button,
  Card,
  HealingChart,
  Heading,
  InfoBanner,
  ProgressBar,
  ScreenContainer,
  SectionHeader,
  WoundPhoto,
} from "../components";
import { sansFont } from "../lib/theme";
import { useAuth } from "../lib/auth";
import { getWoundDetail, woundTypeLabel, type WoundDetail as WoundDetailData } from "../lib/queries";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  } catch {
    return iso.slice(0, 10);
  }
}

/** README §6A-12: Yara Arşivi — toplam iyileşme + grafik + foto ızgarası (CANLI). */
export default function WoundArchive() {
  const router = useRouter();
  const { user } = useAuth();
  const { woundId } = useLocalSearchParams<{ woundId?: string }>();
  const [detail, setDetail] = useState<WoundDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      setLoading(true);
      getWoundDetail(user.id, woundId ?? null)
        .then((data) => {
          if (active) setDetail(data);
        })
        .catch((e) => console.warn("[saran] yara arşivi yüklenemedi:", e?.message))
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [user, woundId]),
  );

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!detail) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🗂️</Text>
          <Heading center style={styles.emptyTitle}>Arşiv boş</Heading>
          <Body center color={colors.textMuted}>
            Yara gönderdiğinizde tüm fotoğraflarınız burada arşivlenir.
          </Body>
          <Button label="Değerlendirme başlat" onPress={() => router.push("/assessment")} style={styles.cta} />
        </View>
      </ScreenContainer>
    );
  }

  const { wound, submissions } = detail;
  // Gönderimler yeni → eski; en yeni gönderimin yüzdesi = toplam iyileşme.
  const totalPercent = submissions[0]?.healing_percent ?? null;
  const chartData = [...submissions]
    .reverse()
    .filter((s) => s.healing_percent != null)
    .map((s) => ({ label: formatDate(s.created_at), value: s.healing_percent as number }));

  return (
    <ScreenContainer>
      <Heading style={styles.title}>{woundTypeLabel(wound.type)}</Heading>
      <Body color={colors.textMuted} style={styles.sub}>{wound.region ?? "Bölge belirtilmedi"}</Body>

      <Card style={styles.totalCard}>
        {totalPercent != null ? (
          <ProgressBar percent={totalPercent} label="Toplam iyileşme" />
        ) : (
          <Body color={colors.textMuted}>Henüz iyileşme yüzdesi girilmedi.</Body>
        )}
        <View style={styles.totalMeta}>
          <Text style={styles.metaItem}>{submissions.length} fotoğraf</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaItem}>Başlangıç {formatDate(wound.started_at)}</Text>
        </View>
      </Card>

      {chartData.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="İyileşme grafiği" />
          <HealingChart data={chartData} />
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="Tüm fotoğraflar" />
        {submissions.length === 0 ? (
          <Card>
            <Body color={colors.textMuted} center>Henüz fotoğraf yok.</Body>
          </Card>
        ) : (
          <View style={styles.grid}>
            {submissions.map((s) => (
              <View key={s.id} style={styles.cell}>
                <WoundPhoto
                  height={120}
                  compact
                  showReveal
                  label=""
                  date={formatDate(s.created_at)}
                  healingPercent={s.healing_percent ?? undefined}
                />
              </View>
            ))}
          </View>
        )}
      </View>

      <InfoBanner tone="success" icon="🔒" text="Arşivdeki tüm görseller şifrelidir; yalnızca atanmış hemşireniz açabilir." />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.sm, minHeight: 320 },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { marginTop: spacing.sm },
  cta: { marginTop: spacing.lg },
  title: { fontSize: 20 },
  sub: { marginTop: 2, marginBottom: spacing.lg },
  totalCard: { gap: spacing.md },
  totalMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  metaItem: { fontFamily: sansFont, color: colors.textMuted, fontSize: 12 },
  metaDot: { color: colors.textMutedAlt },
  section: { marginTop: spacing.xl },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  cell: { width: "47%", flexGrow: 1 },
});
