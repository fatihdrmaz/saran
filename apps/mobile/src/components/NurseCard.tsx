import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@saran/tokens";
import { Avatar } from "./Avatar";
import { Card } from "./Card";
import { Body } from "./Typography";
import { sansFont } from "../lib/theme";
import { nurse } from "../lib/mock-data";

interface Props {
  onPress?: () => void;
  /** Sağda küçük aksiyon (mesaj/profil). */
  compact?: boolean;
}

/** Atanmış hemşire kartı: portre + çevrimiçi durumu + puan. */
export function NurseCard({ onPress, compact = false }: Props) {
  return (
    <Card onPress={onPress} padded>
      <View style={styles.row}>
        <Avatar name={nurse.fullName} size={compact ? 46 : 56} online={nurse.online} />
        <View style={styles.info}>
          <Text style={styles.name}>Hem. {nurse.fullName}</Text>
          <Body color={colors.textMuted} numberOfLines={1}>
            {nurse.title}
          </Body>
          <View style={styles.metaRow}>
            <View style={[styles.dot, { backgroundColor: nurse.online ? colors.primaryMid : colors.textMutedAlt }]} />
            <Text style={styles.meta}>
              {nurse.online ? "Çevrimiçi" : "Çevrimdışı"} · {nurse.rating}★
            </Text>
          </View>
        </View>
        {onPress ? <Pressable onPress={onPress}><Text style={styles.chevron}>›</Text></Pressable> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  info: { flex: 1, gap: 2 },
  name: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "800", fontSize: 15 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  meta: { fontFamily: sansFont, color: colors.textMuted, fontSize: 12, fontWeight: "600" },
  chevron: { fontSize: 26, color: colors.textMutedAlt, paddingHorizontal: spacing.xs },
});
