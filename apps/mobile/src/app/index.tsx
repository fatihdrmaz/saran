import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { colors } from "@saran/tokens";
import { useAuth } from "../lib/auth";

/**
 * Uygulama girişi. Oturum AsyncStorage'dan okunurken yükleme göstergesi;
 * oturum varsa (tabs), yoksa onboarding'e yönlendirilir.
 */
export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bgCream }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <Redirect href={session ? "/(tabs)" : "/onboarding"} />;
}
