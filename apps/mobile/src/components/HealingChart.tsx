import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@saran/tokens";
import { sansFont } from "../lib/theme";

interface Point {
  label: string;
  value: number; // 0–100
}

/**
 * Basit çubuk grafik taklidi (harici lib yok — sadece View).
 * İyileşme yüzdesini zaman içinde gösterir.
 */
export function HealingChart({ data }: { data: Point[] }) {
  const max = 100;
  return (
    <View style={styles.wrap}>
      <View style={styles.chart}>
        {data.map((p) => (
          <View key={p.label} style={styles.col}>
            <Text style={styles.pct}>%{p.value}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.bar, { height: `${(p.value / max) * 100}%` }]} />
            </View>
            <Text style={styles.xLabel}>{p.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  chart: { flexDirection: "row", height: 160, alignItems: "flex-end", justifyContent: "space-between", gap: spacing.sm },
  col: { flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 4 },
  barTrack: { width: "70%", flex: 1, justifyContent: "flex-end", backgroundColor: colors.surfaceGreen, borderRadius: radius.sm, overflow: "hidden" },
  bar: { width: "100%", backgroundColor: colors.primaryMid, borderRadius: radius.sm },
  pct: { fontFamily: sansFont, fontSize: 10, fontWeight: "800", color: colors.primaryDark },
  xLabel: { fontFamily: sansFont, fontSize: 10, color: colors.textMuted, marginTop: 2 },
});
