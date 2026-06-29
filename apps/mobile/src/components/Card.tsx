import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { colors, radius, spacing } from "@saran/tokens";

interface Props {
  children: ReactNode;
  onPress?: () => void;
  /** Koyu yeşil kart (önerilen plan, başarı). */
  dark?: boolean;
  style?: ViewStyle;
  padded?: boolean;
}

/** Standart kart: krem/koyu zemin, ince kenarlık, yumuşak köşe. */
export function Card({ children, onPress, dark = false, style, padded = true }: Props) {
  const content = (
    <View
      style={[
        styles.base,
        dark ? styles.dark : styles.light,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, borderWidth: 1 },
  light: { backgroundColor: colors.surface, borderColor: colors.cardBorder },
  dark: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  padded: { padding: spacing.lg },
  pressed: { opacity: 0.9 },
});
