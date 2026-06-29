import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@saran/tokens";
import { sansFont } from "../lib/theme";

export interface TimelineStep {
  title: string;
  subtitle?: string;
  /** done = ✓ yeşil, active = vurgulu nokta, pending = soluk. */
  state: "done" | "active" | "pending";
}

/** Dikey durum zaman çizelgesi (bekleme ekranı, ödeme akışı). */
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <View>
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        const dotColor =
          s.state === "done" ? colors.primaryMid : s.state === "active" ? colors.primary : colors.cardBorder;
        return (
          <View key={s.title} style={styles.row}>
            <View style={styles.gutter}>
              <View style={[styles.dot, { backgroundColor: dotColor }]}>
                {s.state === "done" ? <Text style={styles.dotCheck}>✓</Text> : null}
              </View>
              {!last ? (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: s.state === "done" ? colors.primaryMid : colors.cardBorder },
                  ]}
                />
              ) : null}
            </View>
            <View style={[styles.content, last && styles.contentLast]}>
              <Text
                style={[
                  styles.title,
                  s.state === "pending" && styles.titleMuted,
                  s.state === "active" && styles.titleActive,
                ]}
              >
                {s.title}
              </Text>
              {s.subtitle ? <Text style={styles.subtitle}>{s.subtitle}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.md },
  gutter: { alignItems: "center", width: 24 },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  dotCheck: { color: "#fff", fontSize: 12, fontWeight: "800" },
  line: { width: 2, flex: 1, marginTop: 2, minHeight: 22 },
  content: { flex: 1, paddingBottom: spacing.lg, gap: 2 },
  contentLast: { paddingBottom: 0 },
  title: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "700", fontSize: 14 },
  titleMuted: { color: colors.textMutedAlt, fontWeight: "600" },
  titleActive: { color: colors.primary },
  subtitle: { fontFamily: sansFont, color: colors.textMuted, fontSize: 12, lineHeight: 17 },
});
