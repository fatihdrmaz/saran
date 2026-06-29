import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@saran/tokens";
import { sansFont } from "../lib/theme";

interface Props {
  value: string;
  label: string;
  /** Koyu zemin üstünde mi gösteriliyor. */
  onDark?: boolean;
}

/** İstatistik kutucuğu (güven çubuğu, hemşire profili). */
export function StatTile({ value, label, onDark = false }: Props) {
  return (
    <View style={styles.tile}>
      <Text style={[styles.value, { color: onDark ? "#fff" : colors.primaryDark }]}>{value}</Text>
      <Text style={[styles.label, { color: onDark ? colors.tealLight : colors.textMuted }]}>{label}</Text>
    </View>
  );
}

/** Yatay istatistik şeridi (3-4 tile). */
export function StatRow({
  items,
  onDark = false,
}: {
  items: { value: string; label: string }[];
  onDark?: boolean;
}) {
  return (
    <View style={[styles.rowWrap, !onDark && styles.rowSurface]}>
      {items.map((it, i) => (
        <View key={it.label} style={styles.rowItem}>
          {i > 0 ? <View style={[styles.sep, onDark && styles.sepDark]} /> : null}
          <StatTile value={it.value} label={it.label} onDark={onDark} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: "center", gap: 2, flex: 1, paddingHorizontal: spacing.xs },
  value: { fontFamily: sansFont, fontWeight: "800", fontSize: 18 },
  label: { fontFamily: sansFont, fontSize: 11, textAlign: "center", lineHeight: 14 },
  rowWrap: { flexDirection: "row", alignItems: "center" },
  rowSurface: {
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  rowItem: { flex: 1, flexDirection: "row", alignItems: "center" },
  sep: { width: 1, height: 28, backgroundColor: colors.cardBorder },
  sepDark: { backgroundColor: "rgba(127,216,196,0.3)" },
});
