import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { colors, radius, spacing } from "@saran/tokens";
import { Body, Heading, ScreenContainer } from "../components";
import { sansFont } from "../lib/theme";
import { useAuth } from "../lib/auth";
import { getNotifications, type DerivedNotification, type NotificationKind } from "../lib/queries";

const ICONS: Record<NotificationKind, string> = {
  plan: "🩺",
  message: "💬",
  payment: "🧾",
};

const TINTS: Record<NotificationKind, string> = {
  plan: colors.surfaceGreen,
  message: colors.surfaceGreenAlt,
  payment: colors.starBg,
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso.slice(0, 10);
  }
}

/** README §6A-17: Bildirimler — plan/mesaj/ödeme; verilerden türetilir (CANLI). */
export default function Notifications() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<DerivedNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      setLoading(true);
      getNotifications(user.id)
        .then((data) => {
          if (active) setItems(data);
        })
        .catch((e) => console.warn("[saran] bildirimler yüklenemedi:", e?.message))
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [user]),
  );

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (items.length === 0) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Heading center style={styles.emptyTitle}>Henüz bildirim yok</Heading>
          <Body center color={colors.textMuted}>
            Plan önerileri, mesajlar ve ödeme onayları burada görünür.
          </Body>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Body color={colors.textMuted} style={styles.intro}>
        Plan önerileri, mesajlar ve ödeme onayları burada görünür.
      </Body>
      <View style={{ gap: spacing.md }}>
        {items.map((n) => (
          <Pressable
            key={n.id}
            onPress={() => router.push(n.route as never)}
            style={[styles.row, n.unread && styles.unread]}
          >
            <View style={[styles.iconWrap, { backgroundColor: TINTS[n.kind] }]}>
              <Text style={styles.icon}>{ICONS[n.kind]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{n.title}</Text>
              <Text style={styles.body}>{n.body}</Text>
              <Text style={styles.time}>{formatTime(n.createdAt)}</Text>
            </View>
            {n.unread ? <View style={styles.dot} /> : null}
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.sm, minHeight: 320 },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { marginTop: spacing.sm },
  intro: { marginBottom: spacing.lg },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: "center",
  },
  unread: { borderColor: colors.primary, backgroundColor: colors.surfaceGreenAlt },
  iconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 18 },
  title: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "700", fontSize: 14 },
  body: { fontFamily: sansFont, color: colors.textBody, fontSize: 13, marginTop: 2 },
  time: { fontFamily: sansFont, color: colors.textMutedAlt, fontSize: 11, marginTop: 4 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primary },
});
