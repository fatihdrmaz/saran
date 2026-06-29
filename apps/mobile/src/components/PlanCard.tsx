import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@saran/tokens";
import { Badge } from "./Badge";
import { sansFont } from "../lib/theme";
import { formatKurus } from "../lib/theme";
import type { MockPlan } from "../lib/mock-data";

interface Props {
  plan: MockPlan;
  /** Koyu yeşil öne çıkan kart (önerilen plan). */
  highlighted?: boolean;
  selected?: boolean;
  onPress?: () => void;
}

/** Plan kartı: fiyat + özellik listesi. Önerilen plan koyu yeşil. */
export function PlanCard({ plan, highlighted = false, selected = false, onPress }: Props) {
  const dark = highlighted;
  const fg = dark ? "#fff" : colors.textHeading;
  const sub = dark ? colors.tealLight : colors.textMuted;

  return (
    <View
      style={[
        styles.card,
        dark ? styles.dark : styles.light,
        selected && !dark && styles.selected,
      ]}
      onTouchEnd={onPress}
    >
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: fg }]}>{plan.name}</Text>
          {plan.durationDays ? (
            <Text style={[styles.duration, { color: sub }]}>{plan.durationDays} gün takip</Text>
          ) : (
            <Text style={[styles.duration, { color: sub }]}>Tek seferlik</Text>
          )}
        </View>
        {plan.popular ? <Badge label="Popüler" fg="#fff" bg={colors.warm} /> : null}
      </View>

      <View style={styles.priceRow}>
        <Text style={[styles.price, { color: fg }]}>{formatKurus(plan.priceKurus)}</Text>
        {plan.type === "monthly" ? <Text style={[styles.per, { color: sub }]}>/ ay</Text> : null}
      </View>

      <View style={styles.features}>
        {plan.features.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Text style={[styles.check, { color: dark ? colors.tealLight : colors.primaryMid }]}>✓</Text>
            <Text style={[styles.feature, { color: dark ? "#E7F4EF" : colors.textBody }]}>{f}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, gap: spacing.md },
  light: { backgroundColor: colors.surface, borderColor: colors.cardBorder },
  dark: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  selected: { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.surfaceGreenAlt },
  head: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  name: { fontFamily: sansFont, fontWeight: "800", fontSize: 18 },
  duration: { fontFamily: sansFont, fontSize: 12, marginTop: 2 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  price: { fontFamily: sansFont, fontWeight: "800", fontSize: 26 },
  per: { fontFamily: sansFont, fontSize: 13 },
  features: { gap: spacing.sm, marginTop: spacing.xs },
  featureRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  check: { fontFamily: sansFont, fontWeight: "800", fontSize: 14 },
  feature: { fontFamily: sansFont, fontSize: 13, flex: 1, lineHeight: 19 },
});
