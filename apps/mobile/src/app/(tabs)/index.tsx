import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@saran/tokens";
import { PlanStatus, isTrackingUnlocked } from "@saran/shared";
import {
  Body,
  Button,
  Card,
  NurseCard,
  ProgressBar,
  ScreenContainer,
  SectionHeader,
  StatusBadge,
  WoundPhoto,
} from "../../components";
import { sansFont } from "../../lib/theme";
import { useAuth } from "../../lib/auth";
import { getWoundOverviews, woundTypeLabel, type WoundOverview } from "../../lib/queries";

/** README §6A-9: Ana Sayfa — hemşire kartı + takip kartı + hızlı aksiyonlar (CANLI). */
export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [overviews, setOverviews] = useState<WoundOverview[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      setLoading(true);
      getWoundOverviews(user.id)
        .then((data) => {
          if (active) setOverviews(data);
        })
        .catch((e) => console.warn("[saran] yaralar yüklenemedi:", e?.message))
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [user]),
  );

  const primary = overviews[0] ?? null;
  const plan = primary?.plan ?? null;
  const unlocked = isTrackingUnlocked(plan?.status);
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? "";

  return (
    <View style={styles.flex}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <View>
          <Text style={styles.greet}>Merhaba,</Text>
          <Text style={styles.name}>{firstName}</Text>
        </View>
        <Pressable style={styles.bell} onPress={() => router.push("/notifications")}>
          <Text style={styles.bellIcon}>🔔</Text>
        </Pressable>
      </View>

      <ScreenContainer tabBarSpacing contentStyle={{ paddingTop: spacing.sm }}>
        <NurseCard onPress={() => router.push("/nurse-profile")} />

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : primary ? (
          <View style={styles.section}>
            <SectionHeader title="Takip edilen yaram" actionLabel="Detay" onAction={() => router.push("/wound-detail")} />
            <Card>
              <View style={styles.woundHead}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.woundTitle}>{woundTypeLabel(primary.wound.type)}</Text>
                  <Text style={styles.woundRegion}>{primary.wound.region ?? "Bölge belirtilmedi"}</Text>
                </View>
                <StatusBadge status={unlocked ? "active" : "pending"} />
              </View>
              <WoundPhoto
                height={150}
                showReveal
                healingPercent={primary.latestSubmission?.healing_percent ?? undefined}
                style={styles.woundPhoto}
              />
              {primary.latestSubmission?.healing_percent != null ? (
                <View style={styles.progress}>
                  <ProgressBar percent={primary.latestSubmission.healing_percent} label="İyileşme" />
                </View>
              ) : null}
            </Card>
          </View>
        ) : (
          <View style={styles.section}>
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🩹</Text>
              <Text style={styles.emptyTitle}>Henüz takip edilen yaranız yok</Text>
              <Body color={colors.textMuted} center>
                İlk değerlendirmeniz ücretsiz. Fotoğrafınızı gönderin, hemşireniz değerlendirsin.
              </Body>
              <Button label="Ücretsiz değerlendirme başlat" icon="📷" onPress={() => router.push("/assessment")} />
            </Card>
          </View>
        )}

        <View style={styles.section}>
          <SectionHeader title="Hızlı işlemler" />
          <View style={styles.actions}>
            <ActionTile icon="📷" label="Yeni fotoğraf" onPress={() => router.push("/photo-submit")} />
            <ActionTile icon="📅" label="Randevu al" onPress={() => router.push("/appointment")} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.shortcuts}>
            <Shortcut label="Planım & Paketler" icon="💳" onPress={() => router.push("/packages")} />
            <Shortcut label="Yorumlar" icon="⭐" onPress={() => router.push("/reviews")} />
            <Shortcut label="Yara arşivi" icon="🗂️" onPress={() => router.push("/wound-archive")} />
          </View>
        </View>

        {primary && plan?.status === PlanStatus.PROPOSED ? (
          <Card style={styles.lockedNote}>
            <Body color={colors.warningText}>
              Takibiniz onay bekliyor. Plan onaylanınca mesajlaşma ve fotoğraf gönderimi açılır.
            </Body>
            <Button label="Plan önerisini gör" variant="outline" onPress={() => router.push("/plan-proposal")} />
          </Card>
        ) : null}
      </ScreenContainer>
    </View>
  );
}

function ActionTile({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.actionTile} onPress={onPress}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function Shortcut({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.shortcut} onPress={onPress}>
      <Text style={styles.shortcutIcon}>{icon}</Text>
      <Text style={styles.shortcutLabel}>{label}</Text>
      <Text style={styles.shortcutChevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bgCream },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  greet: { fontFamily: sansFont, color: colors.textMuted, fontSize: 13 },
  name: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "800", fontSize: 20 },
  bell: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, alignItems: "center", justifyContent: "center" },
  bellIcon: { fontSize: 18 },
  section: { marginTop: spacing.xl },
  loadingBox: { marginTop: spacing.xl, alignItems: "center", paddingVertical: spacing.xl },
  woundHead: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md },
  woundTitle: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "700", fontSize: 15 },
  woundRegion: { fontFamily: sansFont, color: colors.textMuted, fontSize: 12 },
  woundPhoto: {},
  progress: { marginTop: spacing.md },
  emptyCard: { alignItems: "center", gap: spacing.md },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "800", fontSize: 16 },
  actions: { flexDirection: "row", gap: spacing.md },
  actionTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    gap: spacing.xs,
  },
  actionIcon: { fontSize: 24 },
  actionLabel: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "700", fontSize: 13 },
  shortcuts: { gap: spacing.sm },
  shortcut: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  shortcutIcon: { fontSize: 18 },
  shortcutLabel: { flex: 1, fontFamily: sansFont, color: colors.textHeading, fontWeight: "600", fontSize: 14 },
  shortcutChevron: { fontSize: 22, color: colors.textMutedAlt },
  lockedNote: { marginTop: spacing.xl, gap: spacing.md },
});
