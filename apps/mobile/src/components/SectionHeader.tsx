import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@saran/tokens";
import { Heading } from "./Typography";
import { sansFont } from "../lib/theme";

interface Props {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Bölüm başlığı + opsiyonel "Tümü ›" aksiyonu. */
export function SectionHeader({ title, actionLabel, onAction }: Props) {
  return (
    <View style={styles.row}>
      <Heading style={styles.title}>{title}</Heading>
      {actionLabel ? (
        <Pressable onPress={onAction}>
          <Text style={styles.action}>{actionLabel} ›</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: { fontSize: 19 },
  action: { fontFamily: sansFont, color: colors.primary, fontWeight: "700", fontSize: 13 },
});
