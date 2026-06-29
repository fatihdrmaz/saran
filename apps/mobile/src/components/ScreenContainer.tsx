import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@saran/tokens";

interface Props {
  children: ReactNode;
  scroll?: boolean;
  /** Koyu yeşil zemin (onboarding, plan aktif, başarı ekranları). */
  dark?: boolean;
  /** Acil ekranı için kırmızımsı zemin. */
  danger?: boolean;
  padded?: boolean;
  contentStyle?: ViewStyle;
  /** Alt sekme çubuğu yüksekliği kadar boşluk bırak. */
  tabBarSpacing?: boolean;
}

/**
 * Tüm ekranların temel sarmalayıcısı. Krem (veya koyu) zemin + güvenli alan.
 */
export function ScreenContainer({
  children,
  scroll = true,
  dark = false,
  danger = false,
  padded = true,
  contentStyle,
  tabBarSpacing = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const bg = dark ? colors.primaryDark : danger ? colors.dangerBg : colors.bgCream;

  const inner: ViewStyle = {
    paddingTop: insets.top + spacing.sm,
    paddingBottom: insets.bottom + (tabBarSpacing ? 88 : spacing.xl),
    paddingHorizontal: padded ? spacing.lg : 0,
  };

  if (scroll) {
    return (
      <ScrollView
        style={[styles.flex, { backgroundColor: bg }]}
        contentContainerStyle={[inner, contentStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: bg }, inner, contentStyle]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
