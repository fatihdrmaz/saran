import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius, spacing } from "@saran/tokens";
import { PlanStatus, VAT_RATE } from "@saran/shared";
import {
  Body,
  Button,
  Card,
  Heading,
  InfoBanner,
  ScreenContainer,
  TextField,
} from "../components";
import { formatKurus, sansFont } from "../lib/theme";
import { useAuth } from "../lib/auth";
import { approvePlan, getPlanByStatus } from "../lib/queries";
import type { Database } from "@saran/supabase";

type PlanRow = Database["public"]["Tables"]["plans"]["Row"];

/** README §6A-7: Ödeme — sipariş özeti + "Planı onayla" → approve-plan Edge Function. */
export default function Checkout() {
  const router = useRouter();
  const { user } = useAuth();
  const { planId } = useLocalSearchParams<{ planId?: string }>();
  const [plan, setPlan] = useState<PlanRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      setLoading(true);
      // planId yoksa proposed plan'ı bul.
      getPlanByStatus(user.id, PlanStatus.PROPOSED)
        .then((p) => {
          if (active) setPlan(p);
        })
        .catch((e) => console.warn("[saran] plan yüklenemedi:", e?.message))
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [user]),
  );

  const onApprove = async () => {
    const id = planId ?? plan?.id;
    if (!id) return;
    setSubmitting(true);
    setError(null);
    try {
      await approvePlan(id);
      router.replace("/plan-active");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Plan onayı sırasında bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  const total = plan?.price_kurus ?? 0;
  const net = Math.round(total / (1 + VAT_RATE));
  const vat = total - net;

  return (
    <ScreenContainer>
      <Heading style={styles.title}>Sipariş özeti</Heading>
      <Card style={styles.summary}>
        <Row label="Bakım planı" value={formatKurus(net)} />
        <Row label={`KDV (%${Math.round(VAT_RATE * 100)})`} value={formatKurus(vat)} muted />
        <View style={styles.divider} />
        <Row label="Toplam" value={formatKurus(total)} bold />
      </Card>

      <Heading style={styles.title}>Kart bilgileri</Heading>
      <View style={styles.form}>
        <TextField label="Kart üzerindeki isim" placeholder="Ad Soyad" />
        <TextField label="Kart numarası" placeholder="0000 0000 0000 0000" keyboardType="phone-pad" />
        <View style={styles.cardRow}>
          <View style={styles.flex}>
            <TextField label="Son kullanma" placeholder="AA/YY" keyboardType="phone-pad" />
          </View>
          <View style={styles.flex}>
            <TextField label="CVV" placeholder="123" keyboardType="phone-pad" secureTextEntry />
          </View>
        </View>
      </View>

      <InfoBanner tone="info" icon="🔒" text="Ödeme iyzico ile 3D Secure üzerinden alınır. Kart bilgileriniz saklanmaz." />

      {error ? <InfoBanner tone="danger" icon="⚠️" text={error} /> : null}

      <Button
        label={`Güvenli öde · ${formatKurus(total)}`}
        loading={submitting}
        disabled={submitting || !(planId ?? plan?.id)}
        onPress={onApprove}
        style={styles.cta}
      />
      <Body center color={colors.textMuted} style={styles.note}>
        Onayladığınızda planınız aktifleşir ve takip akışı açılır.
      </Body>
    </ScreenContainer>
  );
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, muted && styles.rowMuted, bold && styles.rowBold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingBox: { alignItems: "center", paddingVertical: spacing["2xl"] },
  title: { fontSize: 18, marginTop: spacing.md, marginBottom: spacing.md },
  summary: { gap: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLabel: { fontFamily: sansFont, color: colors.textBody, fontSize: 14 },
  rowValue: { fontFamily: sansFont, color: colors.textHeading, fontSize: 14, fontWeight: "600" },
  rowMuted: { color: colors.textMuted, fontSize: 13 },
  rowBold: { fontWeight: "800", fontSize: 16, color: colors.primaryDark },
  divider: { height: 1, backgroundColor: colors.cardBorder, marginVertical: spacing.xs },
  form: { gap: spacing.md },
  cardRow: { flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },
  cta: { marginTop: spacing.lg },
  note: { marginTop: spacing.md },
});
