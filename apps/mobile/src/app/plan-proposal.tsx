import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { colors, radius, spacing } from "@saran/tokens";
import { PlanStatus, PlanType, PLAN_DURATION_DAYS } from "@saran/shared";
import {
  Body,
  Button,
  Card,
  Heading,
  InfoBanner,
  Kicker,
  PlanCard,
  ScreenContainer,
} from "../components";
import { sansFont } from "../lib/theme";
import { useAuth } from "../lib/auth";
import { getPlanByStatus } from "../lib/queries";
import type { Database } from "@saran/supabase";

type PlanRow = Database["public"]["Tables"]["plans"]["Row"];

const PLAN_TYPE_LABELS: Record<string, string> = {
  [PlanType.ONE_TIME]: "Tek Seferlik",
  [PlanType.WEEK_1]: "1 Haftalık",
  [PlanType.WEEK_3]: "3 Haftalık",
  [PlanType.MONTHLY]: "Aylık Takip",
};

function planFeatures(type: string): string[] {
  if (type === PlanType.MONTHLY)
    return ["30 gün takip", "Sınırsız fotoğraf gönderimi", "Haftalık değerlendirme", "Anlık mesajlaşma"];
  if (type === PlanType.WEEK_3)
    return ["21 gün takip", "Sınırsız fotoğraf", "Haftalık değerlendirme", "Mesajlaşma"];
  if (type === PlanType.WEEK_1) return ["7 gün takip", "Sınırsız fotoğraf", "Mesajlaşma"];
  return ["Tek bakım talimatı", "Pansuman önerisi"];
}

/** README §6A-6: Plan Önerisi ⭐ — proposed plan'ı CANLI oku. */
export default function PlanProposal() {
  const router = useRouter();
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanRow | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      setLoading(true);
      getPlanByStatus(user.id, PlanStatus.PROPOSED)
        .then((p) => {
          if (active) setPlan(p);
        })
        .catch((e) => console.warn("[saran] plan önerisi yüklenemedi:", e?.message))
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [user]),
  );

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!plan) {
    return (
      <ScreenContainer>
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>⏳</Text>
          <Heading center>Henüz plan önerisi yok</Heading>
          <Body color={colors.textMuted} center>
            Hemşireniz değerlendirmenizi tamamladığında plan öneriniz burada görünecek.
          </Body>
          <Button label="Ana sayfaya dön" variant="outline" onPress={() => router.replace("/(tabs)")} />
        </Card>
      </ScreenContainer>
    );
  }

  const planView = {
    id: plan.id,
    type: plan.type,
    name: PLAN_TYPE_LABELS[plan.type] ?? plan.type,
    priceKurus: plan.price_kurus,
    durationDays: PLAN_DURATION_DAYS[plan.type as PlanType] ?? null,
    status: plan.status,
    popular: plan.type === PlanType.MONTHLY,
    features: planFeatures(plan.type),
  };

  return (
    <ScreenContainer>
      <Kicker>Bakım planınız hazır</Kicker>
      <Heading style={styles.title}>Hemşireniz değerlendirmenizi tamamladı</Heading>

      {plan.prognosis_note ? (
        <Card style={styles.assessment}>
          <Body color={colors.textBody} style={styles.note}>
            "{plan.prognosis_note}"
          </Body>
        </Card>
      ) : null}

      <Heading style={styles.title}>Önerilen plan</Heading>
      <PlanCard plan={planView} highlighted />

      <Button
        label="Planı onayla & başla"
        onPress={() => router.push({ pathname: "/checkout", params: { planId: plan.id } })}
        style={styles.cta}
      />
      <Button
        label="Tek seferlik bakım talimatı al"
        variant="outline"
        onPress={() => router.push("/packages")}
        style={styles.altCta}
      />

      <InfoBanner tone="success" icon="🛡️" text="Onaylamazsanız hiçbir ücret alınmaz ve takip başlamaz." />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingBox: { alignItems: "center", paddingVertical: spacing["2xl"] },
  emptyCard: { alignItems: "center", gap: spacing.md, marginTop: spacing.xl },
  emptyIcon: { fontSize: 40 },
  title: { fontSize: 19, marginTop: spacing.md, marginBottom: spacing.md },
  assessment: { gap: spacing.md },
  note: { fontStyle: "italic", lineHeight: 21 },
  cta: { marginTop: spacing.lg },
  altCta: { marginTop: spacing.md, marginBottom: spacing.lg },
});
