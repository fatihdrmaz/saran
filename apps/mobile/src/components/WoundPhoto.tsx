import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors, radius, spacing } from "@saran/tokens";
import { sansFont } from "../lib/theme";

interface Props {
  /** Yükseklik. Kareler için width=height gibi davranır (flex doldurma). */
  height?: number;
  /** Köşe altında % rozeti (iyileşme yüzdesi). */
  healingPercent?: number;
  /** Köşe altında tarih. */
  date?: string;
  /** "Netleştir" butonunu göster (yalnızca atanmış hemşire UI'da; burada demo). */
  showReveal?: boolean;
  /** Küçük (mesaj baloncuğu / ızgara) varyant. */
  compact?: boolean;
  style?: ViewStyle;
  label?: string;
}

/**
 * MAHREMİYET KURALI (README §5, kritik): yara fotoğrafları HER ZAMAN
 * bulanık gri blok + 🔒 rozeti olarak gösterilir. Gerçek görsel YOK.
 */
export function WoundPhoto({
  height = 180,
  healingPercent,
  date,
  showReveal = false,
  compact = false,
  style,
  label = "Yara fotoğrafı",
}: Props) {
  return (
    <View style={[styles.wrap, { height }, style]}>
      {/* bulanık gri doku taklidi — üst üste yarı saydam bantlar */}
      <View style={styles.blurLayer}>
        <View style={[styles.blob, styles.blobA]} />
        <View style={[styles.blob, styles.blobB]} />
        <View style={[styles.blob, styles.blobC]} />
      </View>

      <View style={styles.lockBadge}>
        <Text style={styles.lockText}>🔒</Text>
        {!compact ? <Text style={styles.lockLabel}>Gizli</Text> : null}
      </View>

      {!compact ? (
        <View style={styles.centerLabel}>
          <Text style={styles.centerText}>🔒 {label}</Text>
          <Text style={styles.centerSub}>Mahremiyet için bulanık</Text>
        </View>
      ) : null}

      {showReveal ? (
        <Pressable style={styles.reveal}>
          <Text style={styles.revealText}>Netleştir</Text>
        </Pressable>
      ) : null}

      {(healingPercent !== undefined || date) ? (
        <View style={styles.footer}>
          {date ? <Text style={styles.footerText}>{date}</Text> : <View />}
          {healingPercent !== undefined ? (
            <Text style={styles.footerPct}>%{healingPercent}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    backgroundColor: "#C8CCC9",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  blurLayer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  blob: { position: "absolute", borderRadius: 999, opacity: 0.5 },
  blobA: { width: 160, height: 160, backgroundColor: "#AEB4B0", top: -30, left: -20 },
  blobB: { width: 140, height: 140, backgroundColor: "#D6D9D6", bottom: -20, right: -10 },
  blobC: { width: 110, height: 110, backgroundColor: "#9BA29D", top: 40, right: 30 },
  lockBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(24,48,42,0.55)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  lockText: { fontSize: 11 },
  lockLabel: { fontFamily: sansFont, color: "#fff", fontSize: 11, fontWeight: "700" },
  centerLabel: { alignItems: "center", gap: 2 },
  centerText: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "700", fontSize: 13 },
  centerSub: { fontFamily: sansFont, color: colors.textBody, fontSize: 11 },
  reveal: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  revealText: { fontFamily: sansFont, color: colors.primary, fontWeight: "700", fontSize: 12 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: "rgba(24,48,42,0.45)",
  },
  footerText: { fontFamily: sansFont, color: "#fff", fontSize: 11, fontWeight: "600" },
  footerPct: { fontFamily: sansFont, color: "#fff", fontSize: 11, fontWeight: "800" },
});
