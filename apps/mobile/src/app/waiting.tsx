import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing } from "@saran/tokens";
import {
  Body,
  Button,
  Card,
  Heading,
  InfoBanner,
  NurseCard,
  ScreenContainer,
  Timeline,
  type TimelineStep,
} from "../components";

const STEPS: TimelineStep[] = [
  { title: "Gönderildi", subtitle: "Fotoğrafınız hemşireye iletildi.", state: "done" },
  { title: "Hemşire değerlendiriyor", subtitle: "Hem. Ayşe fotoğrafınızı inceliyor.", state: "active" },
  { title: "Bakım planı önerisi", subtitle: "Bekleniyor — hazır olunca haber vereceğiz.", state: "pending" },
];

/** README §6A-5: Bekleme — "Fotoğrafınız iletildi" + durum çizelgesi + hemşire kartı. */
export default function Waiting() {
  const router = useRouter();
  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <View style={styles.iconCircle}>
          <Body style={styles.icon}>✓</Body>
        </View>
        <Heading center style={styles.title}>
          Fotoğrafınız iletildi
        </Heading>
        <Body center color={colors.textMuted} style={styles.sub}>
          Hem. Ayşe değerlendiriyor. Plan önerisi geldiğinde haber vereceğiz.
        </Body>
      </View>

      <Card style={styles.timelineCard}>
        <Timeline steps={STEPS} />
      </Card>

      <View style={styles.nurse}>
        <NurseCard />
      </View>

      <InfoBanner tone="info" icon="⏱️" text="Genelde 1 saat içinde dönüş yapılır. Bildirim alacaksınız." />

      <Button label="Plan önerisini gör" onPress={() => router.push("/plan-proposal")} style={styles.cta} />
      <Button label="Ana sayfaya dön" variant="ghost" onPress={() => router.replace("/(tabs)")} style={styles.cta} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", marginTop: spacing.xl, gap: spacing.sm },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.successBg,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 32, color: colors.successText, fontWeight: "800" },
  title: { marginTop: spacing.sm },
  sub: { marginTop: spacing.xs, paddingHorizontal: spacing.lg },
  timelineCard: { marginTop: spacing.xl },
  nurse: { marginTop: spacing.lg },
  cta: { marginTop: spacing.xl },
});
