import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, radius, spacing } from "@saran/tokens";
import {
  Body,
  Button,
  Card,
  Hero,
  InfoBanner,
  Kicker,
  ScreenContainer,
  SectionHeader,
  StatRow,
  WoundPhoto,
} from "../components";
import { sansFont } from "../lib/theme";
import { howItWorks, successStories, trustStats } from "../lib/mock-data";

/** README §6A-3: Boş Ana Sayfa — hero + güven çubuğu + nasıl çalışır + hikâyeler. */
export default function HomeEmpty() {
  const router = useRouter();
  const start = () => router.push("/assessment");

  return (
    <ScreenContainer>
      <Kicker>SARAN</Kicker>
      <Hero italic style={styles.hero}>
        Yaranız iyileşene kadar yanınızdayız
      </Hero>
      <Body color={colors.textMuted} style={styles.heroSub}>
        İlk değerlendirmeniz ücretsiz. Fotoğrafınızı gönderin, uzman hemşireniz değerlendirsin.
      </Body>

      <Button label="Ücretsiz değerlendirme başlat" icon="📷" onPress={start} style={styles.cta} />
      <Text style={styles.ctaNote}>Ödeme yok · planı görünce siz karar verin</Text>

      <View style={styles.section}>
        <StatRow items={trustStats} />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Nasıl çalışır?" />
        <View style={{ gap: spacing.md }}>
          {howItWorks.map((s) => (
            <Card key={s.step}>
              <View style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{s.step}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Body color={colors.textMuted}>{s.desc}</Body>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="İyileşme hikâyeleri" />
        <View style={styles.stories}>
          {successStories.map((s) => (
            <View key={s.id} style={styles.story}>
              <View style={styles.beforeAfter}>
                <WoundPhoto height={90} compact label="Önce" style={styles.baCell} />
                <WoundPhoto height={90} compact label="Sonra" style={styles.baCell} />
              </View>
              <Text style={styles.storyLabel}>{s.label}</Text>
              <Text style={styles.storyMeta}>{s.duration}</Text>
            </View>
          ))}
        </View>
      </View>

      <InfoBanner tone="success" icon="🔒" text="Yara fotoğraflarınız şifrelenir; yalnızca atanmış hemşireniz görebilir." />

      <Button label="Ücretsiz değerlendirme başlat" onPress={start} style={styles.bottomCta} />
      <Button label="Uygulamaya gir (demo)" variant="ghost" onPress={() => router.replace("/(tabs)")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { marginTop: spacing.sm },
  heroSub: { marginTop: spacing.sm },
  cta: { marginTop: spacing.lg },
  ctaNote: { fontFamily: sansFont, color: colors.textMuted, fontSize: 12, textAlign: "center", marginTop: spacing.sm },
  section: { marginTop: spacing["2xl"] },
  stepRow: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  stepNum: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surfaceGreen, alignItems: "center", justifyContent: "center" },
  stepNumText: { fontFamily: sansFont, color: colors.primary, fontWeight: "800", fontSize: 15 },
  stepTitle: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "700", fontSize: 14, marginBottom: 2 },
  stories: { flexDirection: "row", gap: spacing.md },
  story: { flex: 1, gap: spacing.xs },
  beforeAfter: { flexDirection: "row", gap: 4 },
  baCell: { flex: 1, borderRadius: radius.sm },
  storyLabel: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "700", fontSize: 12, marginTop: 4 },
  storyMeta: { fontFamily: sansFont, color: colors.textMuted, fontSize: 11 },
  bottomCta: { marginTop: spacing["2xl"] },
});
