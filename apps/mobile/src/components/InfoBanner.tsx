import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@saran/tokens";
import { sansFont } from "../lib/theme";

type Tone = "success" | "info" | "warning" | "danger";

interface Props {
  text: string;
  icon?: string;
  tone?: Tone;
}

/** Bilgi/uyarı şeridi (ücretsiz değerlendirme, mahremiyet, yasal uyarı). */
export function InfoBanner({ text, icon, tone = "info" }: Props) {
  const t = TONES[tone];
  return (
    <View style={[styles.banner, { backgroundColor: t.bg }]}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={[styles.text, { color: t.fg }]}>{text}</Text>
    </View>
  );
}

const TONES: Record<Tone, { bg: string; fg: string }> = {
  success: { bg: colors.successBg, fg: colors.successText },
  info: { bg: colors.surfaceGreen, fg: colors.primary },
  warning: { bg: colors.warningBg, fg: colors.warningText },
  danger: { bg: colors.dangerBg, fg: colors.danger },
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  icon: { fontSize: 16 },
  text: { fontFamily: sansFont, fontSize: 13, fontWeight: "600", flex: 1, lineHeight: 18 },
});
