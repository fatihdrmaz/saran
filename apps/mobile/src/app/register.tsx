import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { spacing } from "@saran/tokens";
import {
  Body,
  Button,
  CheckRow,
  Heading,
  InfoBanner,
  Kicker,
  ScreenContainer,
  TextField,
} from "../components";
import { colors, sansFont } from "../lib/theme";
import { registerPatient } from "../lib/queries";

/** README §6A-2: Kayıt — Ad Soyad, Telefon (+90), E-posta, Şifre, KVKK. */
export default function Register() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    kvkk && fullName.trim() && email.trim() && password.length >= 8 && !loading;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await registerPatient({
        fullName: fullName.trim(),
        phone: phone.trim() ? `+90${phone.replace(/\s/g, "")}` : "",
        email: email.trim(),
        password,
      });
      if (error) {
        setError(error.message);
        return;
      }
      // Oturum açıldıysa onAuthStateChange tabs'a yönlendirir; akışı sürdür.
      router.replace("/home-empty");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kayıt sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Kicker>Hesap oluştur</Kicker>
      <Heading style={styles.title}>Yara Takibi'ne hoş geldiniz</Heading>
      <Body color={colors.textMuted} style={styles.sub}>
        Fotoğrafınızı gönderin, uzman hemşireniz ücretsiz değerlendirsin.
      </Body>

      <View style={styles.form}>
        <TextField label="Ad Soyad" placeholder="Adınız ve soyadınız" value={fullName} onChangeText={setFullName} />
        <TextField label="Telefon" placeholder="5XX XXX XX XX" prefix="+90" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <TextField label="E-posta" placeholder="ornek@eposta.com" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextField label="Şifre" placeholder="En az 8 karakter" secureTextEntry value={password} onChangeText={setPassword} />
      </View>

      <CheckRow
        checked={kvkk}
        onToggle={() => setKvkk((c) => !c)}
        label="KVKK Aydınlatma Metni ve Kullanım Koşullarını okudum, onaylıyorum."
      />

      {error ? <InfoBanner tone="danger" icon="⚠️" text={error} /> : null}

      <Button label="Hesap oluştur" disabled={!canSubmit} loading={loading} onPress={onSubmit} style={styles.cta} />

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>veya</Text>
        <View style={styles.line} />
      </View>

      <Pressable style={styles.loginRow} onPress={() => router.push("/login")}>
        <Text style={styles.loginText}>
          Zaten hesabınız var mı? <Text style={styles.loginLink}>Giriş yapın</Text>
        </Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm },
  sub: { marginTop: spacing.xs, marginBottom: spacing.lg },
  form: { gap: spacing.md, marginBottom: spacing.lg },
  cta: { marginTop: spacing.lg },
  divider: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginVertical: spacing.lg },
  line: { flex: 1, height: 1, backgroundColor: colors.cardBorder },
  or: { fontFamily: sansFont, color: colors.textMuted, fontSize: 12 },
  loginRow: { alignItems: "center", marginTop: spacing.xl },
  loginText: { fontFamily: sansFont, color: colors.textMuted, fontSize: 13 },
  loginLink: { color: colors.primary, fontWeight: "700" },
});
