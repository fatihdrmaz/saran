import { useState } from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, radius, spacing } from "@saran/tokens";
import { EMERGENCY_FLAGS, type EmergencyFlag } from "@saran/shared";
import { Button, ScreenContainer } from "../components";
import { sansFont, serifFont } from "../lib/theme";
import { useAuth } from "../lib/auth";
import { sendEmergencyAlert } from "../lib/queries";

/** Acil risk işaretleri etiketleri (README §7). */
const FLAG_LABELS: Record<EmergencyFlag, string> = {
  increasing_redness: "Artan kızarıklık",
  fever: "Ateş (38°C üzeri)",
  foul_odor: "Kötü koku",
  severe_pain: "Şiddetli ağrı",
};

const ALERT_MESSAGE =
  "🚨 ACİL BİLDİRİM: Yaramda acil müdahale gerektirebilecek belirtiler var. Lütfen en kısa sürede dönüş yapın.";

function call112() {
  Linking.openURL("tel:112").catch(() => {
    Alert.alert("Arama başlatılamadı", "Lütfen telefonunuzdan 112'yi arayın.");
  });
}

/** README §6A-21: Acil Uyarı — kırmızı tema, risk işaretleri, 112 + acil bildir + yasal uyarı. */
export default function Emergency() {
  const router = useRouter();
  const { user } = useAuth();
  const [sending, setSending] = useState(false);

  const onNotifyNurse = async () => {
    if (!user || sending) return;
    setSending(true);
    try {
      const sent = await sendEmergencyAlert(user.id, ALERT_MESSAGE);
      if (sent) {
        Alert.alert(
          "Hemşirenize bildirildi",
          "Acil bildiriminiz hemşirenize iletildi. Durumunuz ağırlaşırsa derhal 112'yi arayın.",
          [{ text: "Mesajlara git", onPress: () => router.push("/(tabs)/messages") }, { text: "Tamam" }],
        );
      } else {
        // Atanmış hemşire/konuşma yok → doğrudan 112'ye yönlendir.
        Alert.alert(
          "Atanmış hemşireniz yok",
          "Henüz size atanmış bir hemşire yok. Acil durumda lütfen 112'yi arayın.",
          [{ text: "112'yi ara", onPress: call112 }, { text: "Vazgeç" }],
        );
      }
    } catch (e) {
      Alert.alert("Bildirim gönderilemedi", e instanceof Error ? e.message : "Acil durumda 112'yi arayın.");
    } finally {
      setSending(false);
    }
  };

  return (
    <ScreenContainer danger>
      <View style={styles.hero}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>⚠️</Text>
        </View>
        <Text style={styles.title}>Acil durum belirtileri</Text>
        <Text style={styles.sub}>
          Aşağıdaki işaretlerden biri varsa acil müdahale gerekebilir. Lütfen vakit
          kaybetmeyin.
        </Text>
      </View>

      <View style={styles.flagsCard}>
        <Text style={styles.flagsTitle}>Dikkat edilmesi gereken işaretler</Text>
        {EMERGENCY_FLAGS.map((flag) => (
          <View key={flag} style={styles.flagRow}>
            <Text style={styles.flagDot}>●</Text>
            <Text style={styles.flagLabel}>{FLAG_LABELS[flag]}</Text>
          </View>
        ))}
        <Text style={styles.flagsMeta}>
          {EMERGENCY_FLAGS.length} acil risk işareti — herhangi biri varsa hemen bildirin.
        </Text>
      </View>

      <Button label="112'yi ara" variant="danger" icon="📞" onPress={call112} style={styles.cta} />
      <Button
        label="Hemşireme acil bildir"
        variant="light"
        icon="🩺"
        loading={sending}
        onPress={onNotifyNurse}
        style={styles.altCta}
      />

      <View style={styles.legal}>
        <Text style={styles.legalText}>
          ⚖️ Bu uygulama bir takip ve danışmanlık aracıdır. Acil tıbbi yardımın yerini tutmaz.
          Acil bir durumda derhal 112'yi arayın veya en yakın sağlık kuruluşuna başvurun.
        </Text>
      </View>

      <Button label="Anladım, geri dön" variant="ghost" onPress={() => router.back()} style={styles.back} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", gap: spacing.sm, marginTop: spacing.md },
  iconCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 38 },
  title: { fontFamily: serifFont, color: colors.danger, fontSize: 24, fontWeight: "500", textAlign: "center", lineHeight: 30, marginTop: spacing.sm },
  sub: { fontFamily: sansFont, color: colors.textBody, fontSize: 14, textAlign: "center", lineHeight: 21, paddingHorizontal: spacing.sm },
  flagsCard: {
    backgroundColor: "#fff",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#F2C7BD",
    padding: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  flagsTitle: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "800", fontSize: 14, marginBottom: spacing.xs },
  flagRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  flagDot: { fontSize: 12, color: colors.danger },
  flagLabel: { fontFamily: sansFont, color: colors.danger, fontSize: 14, fontWeight: "700" },
  flagsMeta: { fontFamily: sansFont, color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
  cta: { marginTop: spacing.xl },
  altCta: { marginTop: spacing.md },
  legal: {
    backgroundColor: colors.dangerBgAlt,
    borderRadius: radius.sm,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  legalText: { fontFamily: sansFont, color: colors.textBody, fontSize: 12, lineHeight: 18 },
  back: { marginTop: spacing.md },
});
