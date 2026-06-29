import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@saran/tokens";
import { Body, Button } from "../components";
import { sansFont, serifFont } from "../lib/theme";

/** README §6A-8: Plan Aktif — koyu yeşil başarı ekranı + ilk kontrol kartı. */
export default function PlanActive() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl }]}>
      <View style={styles.body}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🎉</Text>
        </View>
        <Text style={styles.title}>Planınız aktif!</Text>
        <Text style={styles.sub}>
          Tebrikler! Takip akışınız açıldı. Artık sınırsız fotoğraf gönderebilir ve hemşirenizle
          mesajlaşabilirsiniz.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>İLK KONTROLÜNÜZ</Text>
          <Text style={styles.cardTitle}>Yarın · Hem. Ayşe değerlendirmesi</Text>
          <Text style={styles.cardSub}>İlk fotoğrafınızı bugün göndererek başlayabilirsiniz.</Text>
        </View>

        <View style={styles.bullets}>
          {["Sınırsız fotoğraf gönderimi", "Anlık mesajlaşma", "Haftalık değerlendirme"].map((b) => (
            <View key={b} style={styles.bulletRow}>
              <Text style={styles.check}>✓</Text>
              <Text style={styles.bulletText}>{b}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Uygulamaya gir" variant="light" onPress={() => router.replace("/(tabs)")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primaryDark, paddingHorizontal: spacing["2xl"], justifyContent: "space-between" },
  body: { alignItems: "center", gap: spacing.md, marginTop: spacing.xl },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(127,216,196,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 44 },
  title: { fontFamily: serifFont, color: "#fff", fontSize: 28, fontWeight: "500", textAlign: "center", marginTop: spacing.sm },
  sub: { fontFamily: sansFont, color: colors.tealLight, fontSize: 14, textAlign: "center", lineHeight: 21 },
  card: {
    alignSelf: "stretch",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(127,216,196,0.2)",
  },
  cardLabel: { fontFamily: sansFont, color: colors.tealLight, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  cardTitle: { fontFamily: sansFont, color: "#fff", fontWeight: "700", fontSize: 15 },
  cardSub: { fontFamily: sansFont, color: colors.tealLight, fontSize: 12 },
  bullets: { alignSelf: "stretch", gap: spacing.sm, marginTop: spacing.lg },
  bulletRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  check: { color: colors.tealLight, fontWeight: "800", fontSize: 14 },
  bulletText: { fontFamily: sansFont, color: "#E7F4EF", fontSize: 14 },
  footer: {},
});
