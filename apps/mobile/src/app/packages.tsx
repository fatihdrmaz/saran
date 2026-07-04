import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { colors, radius, spacing } from "@saran/tokens";
import { PlanStatus, PlanType } from "@saran/shared";
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
import { getProducts, type PlanProductRow } from "../lib/queries";

type Tab = "subscription" | "onetime";

/** `plan_products` satırını PlanCard'ın beklediği görünüme çevir. */
function productToCard(p: PlanProductRow): MockPlan {
  return {
    id: p.id,
    type: p.code as PlanType,
    name: p.title,
    priceKurus: p.price_kurus,
    durationDays: p.duration_days > 0 ? p.duration_days : null,
    status: PlanStatus.PROPOSED,
    popular: p.code === PlanType.MONTHLY,
    features: p.description
      ? p.description
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
  };
}

/**
 * README §6A-15: Paketler — süreli/tek seferlik geçişi.
 * Bilgilendirme/upsell ekranı: paketleri `plan_products` tablosundan CANLI okur
 * (active=true, sort_order sıralı). Plan modeli hemşire önerir → CTA ücretsiz
 * değerlendirmeye yönlendirir.
 */
export default function Packages() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("subscription");
  const [products, setProducts] = useState<PlanProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getProducts()
        .then((rows) => {
          if (active) setProducts(rows);
        })
        .catch((e) => console.warn("[saran] paketler yüklenemedi:", e?.message))
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const shown = products
    .filter((p) =>
      tab === "onetime" ? p.code === PlanType.ONE_TIME : p.code !== PlanType.ONE_TIME,
    )
    .map(productToCard);

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

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : shown.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Body color={colors.textMuted} center>
            Şu anda bu kategoride sunulan paket bulunmuyor.
          </Body>
        </View>
      ) : (
        <View style={styles.plans}>
          {shown.map((p) => (
            <PlanCard key={p.id} plan={p} highlighted={p.popular} />
          ))}
        </View>
      )}

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
  loadingBox: { alignItems: "center", paddingVertical: spacing["2xl"], marginBottom: spacing.lg },
  emptyBox: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xl, marginBottom: spacing.lg },
  emptyIcon: { fontSize: 32 },
  plans: { gap: spacing.lg, marginBottom: spacing.lg },
  cta: { marginTop: spacing.lg },
});
