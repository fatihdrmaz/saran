import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { spacing } from "@saran/tokens";
import {
  Body,
  Button,
  Heading,
  InfoBanner,
  Kicker,
  ScreenContainer,
  TextField,
} from "../components";
import { colors, sansFont } from "../lib/theme";
import { signIn } from "../lib/queries";

/** Giriş — e-posta + şifre ile oturum açma (signInWithPassword). */
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim() && password.length > 0 && !loading;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        setError(error.message);
        return;
      }
      // onAuthStateChange oturumu yayar; tabs'a geç.
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Giriş sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Kicker>Giriş yap</Kicker>
      <Heading style={styles.title}>Tekrar hoş geldiniz</Heading>
      <Body color={colors.textMuted} style={styles.sub}>
        Hesabınıza giriş yapın ve takibinize devam edin.
      </Body>

      <View style={styles.form}>
        <TextField label="E-posta" placeholder="ornek@eposta.com" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextField label="Şifre" placeholder="Şifreniz" secureTextEntry value={password} onChangeText={setPassword} />
      </View>

      {error ? <InfoBanner tone="danger" icon="⚠️" text={error} /> : null}

      <Button label="Giriş yap" disabled={!canSubmit} loading={loading} onPress={onSubmit} style={styles.cta} />

      <Pressable style={styles.registerRow} onPress={() => router.replace("/register")}>
        <Text style={styles.registerText}>
          Hesabınız yok mu? <Text style={styles.registerLink}>Kayıt olun</Text>
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
  registerRow: { alignItems: "center", marginTop: spacing.xl },
  registerText: { fontFamily: sansFont, color: colors.textMuted, fontSize: 13 },
  registerLink: { color: colors.primary, fontWeight: "700" },
});
