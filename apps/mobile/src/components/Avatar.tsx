import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors } from "@saran/tokens";
import { sansFont } from "../lib/theme";

interface Props {
  /** Tam ad — baş harfleri çıkarılır. */
  name: string;
  size?: number;
  online?: boolean;
  /** Portre placeholder (gri blok) — README §3 gerçek portre yok. */
  dark?: boolean;
}

/** Portre placeholder. Gerçek görsel yok; baş harf + gri/teal blok. */
export function Avatar({ name, size = 48, online, dark = false }: Props) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const dotSize = Math.max(10, size * 0.22);

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: dark ? colors.primary : colors.surfaceGreen,
          },
        ]}
      >
        <Text style={[styles.initials, { fontSize: size * 0.36, color: dark ? "#fff" : colors.primary }]}>
          {initials}
        </Text>
      </View>
      {online !== undefined ? (
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: online ? colors.primaryMid : colors.textMutedAlt,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center" },
  initials: { fontFamily: sansFont, fontWeight: "800" },
  dot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: colors.bgCream,
  } as ViewStyle,
});
