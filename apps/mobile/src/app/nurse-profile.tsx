import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, radius, spacing } from "@saran/tokens";
import {
  Avatar,
  Body,
  Button,
  Card,
  Heading,
  ScreenContainer,
  SectionHeader,
  StatRow,
} from "../components";
import { sansFont } from "../lib/theme";
import { nurse } from "../lib/mock-data";

/** README §6A-18: Hemşire Profili — portre, istatistik, hakkında, sertifikalar. */
export default function NurseProfile() {
  const router = useRouter();
  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Avatar name={nurse.fullName} size={88} online={nurse.online} dark />
        <Heading center style={styles.name}>Hem. {nurse.fullName}</Heading>
        <Body center color={colors.textMuted}>{nurse.title}</Body>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓ Doğrulanmış hemşire</Text>
        </View>
      </View>

      <Card style={styles.statsCard} padded>
        <StatRow
          items={[
            { value: `${nurse.experienceYears} yıl`, label: "deneyim" },
            { value: nurse.patientCount, label: "hasta" },
            { value: `${nurse.rating}★`, label: `${nurse.reviewCount} yorum` },
          ]}
        />
      </Card>

      <View style={styles.section}>
        <SectionHeader title="Hakkında" />
        <Card>
          <Body color={colors.textBody} style={styles.bio}>{nurse.bio}</Body>
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Uzmanlık" />
        <Card>
          <Body color={colors.textBody}>{nurse.specialty}</Body>
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Sertifikalar" />
        <View style={{ gap: spacing.sm }}>
          {nurse.certificates.map((c) => (
            <View key={c} style={styles.certRow}>
              <Text style={styles.certIcon}>📜</Text>
              <Text style={styles.certText}>{c}</Text>
            </View>
          ))}
        </View>
      </View>

      <Button label="Mesaj gönder" icon="💬" onPress={() => router.push("/(tabs)/messages")} style={styles.cta} />
      <Button label="Yorumları gör" variant="outline" onPress={() => router.push("/reviews")} style={styles.alt} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", gap: spacing.sm, marginTop: spacing.md },
  name: { marginTop: spacing.sm },
  badge: { backgroundColor: colors.successBg, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 5, marginTop: spacing.xs },
  badgeText: { fontFamily: sansFont, color: colors.successText, fontWeight: "700", fontSize: 12 },
  statsCard: { marginTop: spacing.xl },
  section: { marginTop: spacing.xl },
  bio: { lineHeight: 21 },
  certRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  certIcon: { fontSize: 18 },
  certText: { fontFamily: sansFont, color: colors.textBody, fontSize: 13, flex: 1 },
  cta: { marginTop: spacing.xl },
  alt: { marginTop: spacing.md },
});
