import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors, radius, spacing } from "@saran/tokens";
import { sansFont } from "../lib/theme";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "light";

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
  /** Sol tarafta küçük ikon/emoji. */
  icon?: string;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  full = true,
  icon,
  style,
}: Props) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: v.bg, borderColor: v.border ?? v.bg },
        full && styles.full,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Text style={[styles.icon, { color: v.fg }]}>{icon}</Text> : null}
          <Text style={[styles.label, { color: v.fg }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const VARIANTS: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.primary, fg: "#FFFFFF" },
  secondary: { bg: colors.surface, fg: colors.textHeading, border: colors.cardBorder },
  outline: { bg: "transparent", fg: colors.primary, border: colors.primary },
  ghost: { bg: "transparent", fg: colors.textBody },
  danger: { bg: colors.danger, fg: "#FFFFFF" },
  light: { bg: "#FFFFFF", fg: colors.primaryDark },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  full: { alignSelf: "stretch" },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.85 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  icon: { fontSize: 16 },
  label: { fontFamily: sansFont, fontWeight: "700", fontSize: 15 },
});
