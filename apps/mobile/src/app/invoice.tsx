import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { colors, radius, spacing } from "@saran/tokens";
import { PlanType, VAT_RATE } from "@saran/shared";
import {
  Body,
  Button,
  Card,
  Heading,
  ScreenContainer,
} from "../components";
import { formatKurus, sansFont } from "../lib/theme";
import { useAuth } from "../lib/auth";
import { getPaidReceipts, type PaymentReceipt } from "../lib/queries";

const PLAN_NAMES: Record<PlanType, string> = {
  [PlanType.ONE_TIME]: "Tek Seferlik",
  [PlanType.WEEK_1]: "1 Haftalık",
  [PlanType.WEEK_2]: "2 Haftalık Takip",
  [PlanType.WEEK_3]: "3 Haftalık",
  [PlanType.MONTHLY]: "Aylık Takip",
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/** README §6A-20: Fatura/Makbuz — ödenmiş ödeme + makbuz detayı + KDV (CANLI). */
export default function Invoice() {
  const { user } = useAuth();
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      setLoading(true);
      getPaidReceipts(user.id)
        .then((receipts) => {
          if (!active) return;
          setReceipt(receipts[0] ?? null);
        })
        .catch((e) => console.warn("[saran] makbuzlar yüklenemedi:", e?.message))
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
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!receipt) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🧾</Text>
          <Heading center style={styles.emptyTitle}>Henüz makbuz yok</Heading>
          <Body center color={colors.textMuted}>
            Bir plan onaylayıp ödeme yaptığınızda makbuzlarınız burada görünür.
          </Body>
        </View>
      </ScreenContainer>
    );
  }

  const { payment, plan } = receipt;
  const customerName =
    (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "—";
  const planName = plan ? PLAN_NAMES[plan.type] : "Bakım planı";
  // Ara toplam = toplam − KDV. vat_kurus kayıttan; yoksa orana göre türet.
  const vatKurus =
    payment.vat_kurus > 0
      ? payment.vat_kurus
      : Math.round(payment.amount_kurus - payment.amount_kurus / (1 + VAT_RATE));
  const subtotalKurus = payment.amount_kurus - vatKurus;

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>✓</Text>
        </View>
        <Heading center style={styles.title}>Ödemeniz başarılı</Heading>
        <Body center color={colors.textMuted}>{formatDate(payment.paid_at ?? payment.created_at)}</Body>
      </View>

      <Card style={styles.receipt}>
        <View style={styles.receiptHead}>
          <Text style={styles.brand}>YARA TAKİBİ</Text>
          <Text style={styles.receiptNo}>Makbuz No: {payment.receipt_no ?? payment.id.slice(0, 8).toUpperCase()}</Text>
        </View>
        <View style={styles.divider} />

        <Row label="Müşteri" value={customerName} />
        <Row label="Plan" value={planName} />
        <Row label="Tarih" value={formatDate(payment.paid_at ?? payment.created_at)} />

        <View style={styles.divider} />
        <Row label="Ara toplam" value={formatKurus(subtotalKurus)} />
        <Row label="KDV" value={formatKurus(vatKurus)} muted />
        <View style={styles.divider} />
        <Row label="Toplam" value={formatKurus(payment.amount_kurus)} bold />

        <View style={styles.paidBadge}>
          <Text style={styles.paidText}>ÖDENDİ ✓</Text>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button label="PDF indir" icon="⬇️" full={false} onPress={() => {}} style={styles.flex} />
        <Button label="E-posta gönder" variant="secondary" full={false} icon="✉️" onPress={() => {}} style={styles.flex} />
      </View>

      <Body center color={colors.textMuted} style={styles.note}>
        e-Arşiv faturanız e-posta adresinize gönderilir.
      </Body>
    </ScreenContainer>
  );
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, muted && styles.rowMuted]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.sm, minHeight: 320 },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { marginTop: spacing.sm },
  hero: { alignItems: "center", gap: spacing.xs, marginTop: spacing.md, marginBottom: spacing.xl },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.successBg, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 28, color: colors.successText, fontWeight: "800" },
  title: { marginTop: spacing.sm },
  receipt: { gap: spacing.sm },
  receiptHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { fontFamily: sansFont, color: colors.primary, fontWeight: "800", letterSpacing: 1.5, fontSize: 14 },
  receiptNo: { fontFamily: sansFont, color: colors.textMuted, fontSize: 11 },
  divider: { height: 1, backgroundColor: colors.cardBorder, marginVertical: spacing.xs },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 2 },
  rowLabel: { fontFamily: sansFont, color: colors.textBody, fontSize: 14 },
  rowValue: { fontFamily: sansFont, color: colors.textHeading, fontSize: 14, fontWeight: "600" },
  rowMuted: { color: colors.textMuted, fontSize: 13 },
  rowBold: { fontWeight: "800", fontSize: 17, color: colors.primaryDark },
  paidBadge: { alignSelf: "center", backgroundColor: colors.successBg, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: 6, marginTop: spacing.md },
  paidText: { fontFamily: sansFont, color: colors.successText, fontWeight: "800", fontSize: 13, letterSpacing: 1 },
  actions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xl },
  flex: { flex: 1 },
  note: { marginTop: spacing.lg },
});
