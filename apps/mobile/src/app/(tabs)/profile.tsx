import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@saran/tokens";
import {
  Avatar,
  Button,
  Card,
  ListRow,
  ScreenContainer,
  SectionHeader,
} from "../../components";
import { sansFont } from "../../lib/theme";
import { useAuth } from "../../lib/auth";

/** README §6A-19: Profil — kullanıcı kartı, istatistikler, menü, Acil yardım. */
export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  const fullName = user?.user_metadata?.full_name ?? "Kullanıcı";
  const phone = user?.user_metadata?.phone ?? user?.email ?? "";

  const onSignOut = async () => {
    await signOut();
    router.replace("/onboarding");
  };

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.title}>Profil</Text>
      </View>
      <ScreenContainer tabBarSpacing contentStyle={{ paddingTop: spacing.sm }}>
        <Card>
          <View style={styles.userRow}>
            <Avatar name={fullName} size={56} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{fullName}</Text>
              {phone ? <Text style={styles.meta}>{phone}</Text> : null}
              {user?.email ? <Text style={styles.meta}>{user.email}</Text> : null}
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <SectionHeader title="Hesabım" />
          <View style={styles.menu}>
            <ListRow icon="👤" title="Kişisel bilgiler" subtitle="Ad, telefon, e-posta" onPress={() => {}} />
            <ListRow icon="🩹" title="Yaralarım" subtitle="Aktif ve geçmiş yaralar" onPress={() => router.push("/wound-detail")} />
            <ListRow icon="💳" title="Ödeme & abonelik" subtitle="Plan ve makbuzlar" onPress={() => router.push("/packages")} />
            <ListRow icon="🔔" title="Bildirimler" onPress={() => router.push("/notifications")} />
            <ListRow icon="🩺" title="Hemşirem" subtitle="Hem. Ayşe Yılmaz" onPress={() => router.push("/nurse-profile")} />
            <ListRow icon="🧾" title="Fatura / Makbuz" onPress={() => router.push("/invoice")} />
          </View>
        </View>

        <View style={styles.section}>
          <Button label="Acil yardım" variant="danger" icon="🚨" onPress={() => router.push("/emergency")} />
          <Button label="Çıkış yap" variant="ghost" onPress={onSignOut} style={styles.logout} />
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bgCream },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  title: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "800", fontSize: 22 },
  userRow: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  name: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "800", fontSize: 17 },
  meta: { fontFamily: sansFont, color: colors.textMuted, fontSize: 12, marginTop: 1 },
  section: { marginTop: spacing.xl },
  menu: { gap: spacing.sm },
  logout: { marginTop: spacing.sm },
});
