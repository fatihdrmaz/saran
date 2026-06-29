import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, radius, spacing } from "@saran/tokens";
import { PLAN_DURATION_DAYS, PLAN_PRICES, PlanStatus, PlanType } from "@saran/shared";
import {
  Body,
  Button,
  Heading,
  InfoBanner,
  PlanCard,
  ScreenContainer,
} from "../components";
import type { MockPlan } from "../lib/mock-data";
import { sansFont } from "../lib/theme";

type Tab = "subscription" | "onetime";

const PLAN_LABELS: Record<PlanType, string> = {
  [PlanType.ONE_TIME]: "Tek Seferlik",
  [PlanType.WEEK_1]: "1 Haftalık",
  [PlanType.WEEK_3]: "3 Haftalık",
  [PlanType.MONTHLY]: "Aylık Takip",
};

const PLAN_FEATURES: Record<PlanType, string[]> = {
  [PlanType.ONE_TIME]: ["Tek bakım talimatı", "Pansuman önerisi"],
  [PlanType.WEEK_1]: ["7 gün takip", "Sınırsız fotoğraf", "Mesajlaşma"],
  [PlanType.WEEK_3]: [
    "21 gün takip",
    "Sınırsız fotoğraf",
    "Haftalık değerlendirme",
    "Mesajlaşma",
  ],
  [PlanType.MONTHLY]: [
    "30 gün takip",
    "Sınırsız fotoğraf gönderimi",
    "Haftalık değerlendirme",
    "Anlık mesajlaşma",
    "Randevu hakkı",
  ],
};

/** `@saran/shared` fiyat/süre sabitlerinden gerçek plan kartı verisi üret. */
function planToCard(type: PlanType): MockPlan {
  return {
    id: type,
    type,
    name: PLAN_LABELS[type],
    priceKurus: PLAN_PRICES[type],
    durationDays: PLAN_DURATION_DAYS[type],
    status: PlanStatus.PROPOSED,
    popular: type === PlanType.MONTHLY,
    features: PLAN_FEATURES[type],
  };
}

/**
 * README §6A-15: Paketler — Aylık/Tek seferlik geçişi.
 * Bilgilendirme/upsell ekranı: gerçek fiyatları `@saran/shared`'tan gösterir.
 * Plan modeli hemşire önerir → CTA ücretsiz değerlendirmeye yönlendirir.
 */
export default function Packages() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("subscription");

  const subPlans = useMemo(
    () => [PlanType.WEEK_1, PlanType.WEEK_3, PlanType.MONTHLY].map(planToCard),
    [],
  );
  const oneTime = useMemo(() => [planToCard(PlanType.ONE_TIME)], []);
  const shown = tab === "subscription" ? subPlans : oneTime;

  return (
    <ScreenContainer>
      <Heading style={styles.title}>Bakım planları</Heading>
      <Body color={colors.textMuted} style={styles.sub}>
        İhtiyacınıza göre süreli takip veya tek seferlik bakım talimatı. Planı, ücretsiz
        değerlendirmenizden sonra hemşireniz önerir.
      </Body>

      <View style={styles.tabs}>
        <TabBtn label="Süreli takip" active={tab === "subscription"} onPress={() => setTab("subscription")} />
        <TabBtn label="Tek seferlik" active={tab === "onetime"} onPress={() => setTab("onetime")} />
      </View>

      <View style={styles.plans}>
        {shown.map((p) => (
          <PlanCard key={p.id} plan={p} highlighted={p.popular} />
        ))}
      </View>

      <InfoBanner tone="info" icon="ℹ️" text="Aylık plan manuel yenilenir; otomatik abonelik yoktur." />

      <Button
        label="Ücretsiz değerlendirme başlat"
        icon="📷"
        onPress={() => router.push("/assessment")}
        style={styles.cta}
      />
    </ScreenContainer>
  );
}

function TabBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tabBtn, active && styles.tabActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, marginTop: spacing.lg },
  sub: { marginTop: spacing.xs, marginBottom: spacing.lg },
  tabs: { flexDirection: "row", backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, padding: 4, marginBottom: spacing.lg },
  tabBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: "center", borderRadius: radius.pill },
  tabActive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
  tabText: { fontFamily: sansFont, color: colors.textMuted, fontWeight: "600", fontSize: 13 },
  tabTextActive: { color: colors.primary, fontWeight: "800" },
  plans: { gap: spacing.lg, marginBottom: spacing.lg },
  cta: { marginTop: spacing.lg },
});
