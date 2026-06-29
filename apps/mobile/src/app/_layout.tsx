import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { colors } from "@saran/tokens";
import { serifFont } from "../lib/theme";
import { AuthProvider } from "../lib/auth";

/**
 * Kök stack. Onboarding + Auth ekranları sekme dışı; (tabs) grubu alt sekme çubuğu.
 * Geri kalan ekranlar (yara detayı, ödeme, randevu vb.) stack route.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bgCream },
            headerTintColor: colors.textHeading,
            headerTitleStyle: { fontFamily: serifFont, fontWeight: "500" },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.bgCream },
            headerBackButtonDisplayMode: "minimal",
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="home-empty" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen name="assessment" options={{ title: "Ücretsiz değerlendirme" }} />
          <Stack.Screen name="waiting" options={{ title: "Değerlendirme" }} />
          <Stack.Screen name="plan-proposal" options={{ title: "Plan önerisi" }} />
          <Stack.Screen name="checkout" options={{ title: "Ödeme" }} />
          <Stack.Screen name="plan-active" options={{ headerShown: false }} />
          <Stack.Screen name="wound-detail" options={{ title: "Yara detayı" }} />
          <Stack.Screen name="photo-submit" options={{ title: "Fotoğraf gönder" }} />
          <Stack.Screen name="wound-archive" options={{ title: "Yara arşivi" }} />
          <Stack.Screen name="appointment" options={{ title: "Randevu" }} />
          <Stack.Screen name="packages" options={{ title: "Paketler" }} />
          <Stack.Screen name="reviews" options={{ title: "Yorumlar" }} />
          <Stack.Screen name="notifications" options={{ title: "Bildirimler" }} />
          <Stack.Screen name="nurse-profile" options={{ title: "Hemşire profili" }} />
          <Stack.Screen name="invoice" options={{ title: "Fatura / Makbuz" }} />
          <Stack.Screen
            name="emergency"
            options={{ title: "Acil uyarı", headerStyle: { backgroundColor: colors.dangerBg } }}
          />
        </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
