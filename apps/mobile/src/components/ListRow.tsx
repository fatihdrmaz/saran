import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@saran/tokens";
import { sansFont } from "../lib/theme";

interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
  rightText?: string;
  onPress?: () => void;
  danger?: boolean;
  /** Sağda ok göster. */
  chevron?: boolean;
}

/** Menü/ayar satırı (Profil menüsü vb.). */
export function ListRow({ icon, title, subtitle, rightText, onPress, danger = false, chevron = true }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {icon ? (
        <View style={[styles.iconWrap, danger && styles.iconDanger]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
      ) : null}
      <View style={styles.body}>
        <Text style={[styles.title, danger && { color: colors.danger }]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {rightText ? <Text style={styles.rightText}>{rightText}</Text> : null}
      {chevron && onPress ? <Text style={styles.chevron}>›</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
  },
  pressed: { opacity: 0.85 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  iconDanger: { backgroundColor: colors.dangerBg },
  icon: { fontSize: 18 },
  body: { flex: 1, gap: 2 },
  title: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "700", fontSize: 14 },
  subtitle: { fontFamily: sansFont, color: colors.textMuted, fontSize: 12 },
  rightText: { fontFamily: sansFont, color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  chevron: { fontSize: 22, color: colors.textMutedAlt },
});
