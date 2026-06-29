import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@saran/tokens";
import { sansFont } from "../lib/theme";

interface Props {
  /** 0–100. */
  percent: number;
  label?: string;
  /** Sağda yüzde rakamı. */
  showValue?: boolean;
  onDark?: boolean;
  color?: string;
}

/** İyileşme/ilerleme çubuğu. */
export function ProgressBar({ percent, label, showValue = true, onDark = false, color }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  const fill = color ?? colors.primaryMid;
  return (
    <View style={styles.wrap}>
      {(label || showValue) ? (
        <View style={styles.head}>
          {label ? (
            <Text style={[styles.label, { color: onDark ? colors.tealLight : colors.textBody }]}>{label}</Text>
          ) : <View />}
          {showValue ? (
            <Text style={[styles.value, { color: onDark ? "#fff" : colors.primaryDark }]}>%{clamped}</Text>
          ) : null}
        </View>
      ) : null}
      <View style={[styles.track, { backgroundColor: onDark ? "rgba(127,216,196,0.25)" : colors.surfaceGreen }]}>
        <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: fill }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontFamily: sansFont, fontSize: 13, fontWeight: "600" },
  value: { fontFamily: sansFont, fontSize: 14, fontWeight: "800" },
  track: { height: 10, borderRadius: radius.pill, overflow: "hidden" },
  fill: { height: "100%", borderRadius: radius.pill },
});
