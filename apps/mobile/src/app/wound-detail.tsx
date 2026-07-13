import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius, spacing } from "@saran/tokens";
import { isTrackingUnlocked } from "@saran/shared";
import {
  Body,
  Button,
  Card,
  Heading,
  InfoBanner,
  ProgressBar,
  ScreenContainer,
  SectionHeader,
  StatusBadge,
  WoundPhoto,
} from "../components";
import { sansFont } from "../lib/theme";
import { useAuth } from "../lib/auth";
import {
  clinicalStatusLabel,
  getWoundDetail,
  getWoundThread,
  planTypeLabel,
  woundTypeLabel,
  type WoundDetail as WoundDetailData,
} from "../lib/queries";
import type { Database } from "@saran/supabase";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

function formatShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  } catch {
    return iso.slice(0, 10);
  }
}

/** Aktif plan için kalan gün (bitiş yoksa null; süre geçtiyse 0). */
function remainingDays(endsAt: string | null): number | null {
  if (!endsAt) return null;
  const diff = Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86_400_000);
  return diff > 0 ? diff : 0;
}

/** README §6A-10: Yara Detayı — önce/sonra + iyileşme zaman çizelgesi (CANLI). */
export default function WoundDetail() {
  const router = useRouter();
  const { user } = useAuth();
  const { woundId } = useLocalSearchParams<{ woundId?: string }>();
  const [detail, setDetail] = useState<WoundDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [threadPreview, setThreadPreview] = useState<MessageRow[]>([]);
  const [threadUnavailable, setThreadUnavailable] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      setLoading(true);
      getWoundDetail(user.id, woundId ?? null)
        .then((data) => {
          if (active) setDetail(data);
        })
        .catch((e) => console.warn("[saran] yara detayı yüklenemedi:", e?.message))
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [user, woundId]),
  );

  // Yaranın sohbetinden son mesajlar (önizleme). Yara atanmamışsa RPC hata verir
  // → mesajlaşma henüz açılmamış notu gösterilir.
  const activeWoundId = detail?.wound.id ?? null;
  useFocusEffect(
    useCallback(() => {
      if (!activeWoundId) {
        setThreadPreview([]);
        setThreadUnavailable(false);
        return;
      }
      let active = true;
      setThreadUnavailable(false);
      getWoundThread(activeWoundId)
        .then((thread) => {
          if (active) setThreadPreview(thread.messages.slice(-3));
        })
        .catch((e) => {
          console.warn("[saran] yara sohbeti önizlenemedi:", (e as Error)?.message);
          if (active) {
            setThreadPreview([]);
            setThreadUnavailable(true);
          }
        });
      return () => {
        active = false;
      };
    }, [activeWoundId]),
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

  if (!detail) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🩹</Text>
          <Heading center style={styles.emptyTitle}>Yara bulunamadı</Heading>
          <Body center color={colors.textMuted}>
            Ücretsiz değerlendirme gönderdiğinizde yaranız burada görünür.
          </Body>
          <Button label="Değerlendirme başlat" onPress={() => router.push("/assessment")} style={styles.cta} />
        </View>
      </ScreenContainer>
    );
  }

  const { wound, submissions, plan } = detail;
  const unlocked = isTrackingUnlocked(plan?.status);
  // Gönderimler yeni → eski; ilk = en yeni (sonra), son = en eski (önce).
  const last = submissions[0] ?? null;
  const first = submissions[submissions.length - 1] ?? null;
  const totalPercent = last?.healing_percent ?? null;

  return (
    <ScreenContainer>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Heading style={styles.title}>{woundTypeLabel(wound.type)}</Heading>
          <Body color={colors.textMuted}>
            {wound.region ?? "Bölge belirtilmedi"} · {clinicalStatusLabel(wound.clinical_status)}
          </Body>
        </View>
        <StatusBadge status={unlocked ? "active" : "pending"} />
      </View>

      {first && last ? (
        <>
          <SectionHeader title="Önce / Sonra" />
          <View style={styles.compare}>
            <View style={styles.compareCell}>
              <WoundPhoto height={150} compact label="Önce" healingPercent={first.healing_percent ?? undefined} />
              <Text style={styles.compareLabel}>İlk gün · {formatShort(first.created_at)}</Text>
            </View>
            <View style={styles.compareCell}>
              <WoundPhoto height={150} compact showReveal label="Sonra" healingPercent={last.healing_percent ?? undefined} />
              <Text style={styles.compareLabel}>Son · {formatShort(last.created_at)}</Text>
            </View>
          </View>
        </>
      ) : null}

      {totalPercent != null ? (
        <Card style={styles.progressCard}>
          <ProgressBar percent={totalPercent} label="Toplam iyileşme" />
        </Card>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="Bakım planı" />
        {plan == null ? (
          <Card>
            <Body color={colors.textMuted}>
              Bu yara için henüz bir plan yok. Hemşireniz değerlendirdikten sonra plan önerisi burada görünür.
            </Body>
          </Card>
        ) : plan.status === "proposed" ? (
          <Card>
            <Text style={styles.planTitle}>{planTypeLabel(plan.type)}</Text>
            <Body color={colors.textMuted} style={styles.planNote}>
              Plan önerisi geldi. Uygulamadan/hesabınızdan onaylayın.
            </Body>
            <Button
              label="Plan önerisini gör"
              onPress={() => router.push({ pathname: "/plan-proposal", params: { woundId: wound.id } })}
              style={styles.planCta}
            />
          </Card>
        ) : plan.status === "active" ? (
          <Card>
            <Text style={styles.planTitle}>{planTypeLabel(plan.type)}</Text>
            <Body color={colors.textMuted} style={styles.planNote}>
              {(() => {
                const days = remainingDays(plan.ends_at);
                if (days == null) return "Aktif takip sürüyor.";
                return days > 0 ? `Aktif takip · ${days} gün kaldı` : "Aktif takip · son gün";
              })()}
            </Body>
          </Card>
        ) : (
          <Card>
            <Text style={styles.planTitle}>{planTypeLabel(plan.type)}</Text>
            <Body color={colors.textMuted} style={styles.planNote}>
              {plan.status === "expired" ? "Takip süresi doldu." : "Plan iptal edildi."}
            </Body>
          </Card>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Mesajlar"
          actionLabel="Mesajları aç"
          onAction={() => router.push({ pathname: "/(tabs)/messages", params: { woundId: wound.id } })}
        />
        {threadUnavailable ? (
          <Card>
            <Body color={colors.textMuted}>
              Bu yara bir hemşireye atandığında mesajlaşma açılır.
            </Body>
          </Card>
        ) : threadPreview.length === 0 ? (
          <Card>
            <Body color={colors.textMuted}>
              Henüz mesaj yok. Hemşirenize yazmak için mesajları açın.
            </Body>
          </Card>
        ) : (
          <Card>
            <View style={{ gap: spacing.sm }}>
              {threadPreview.map((m) => (
                <View key={m.id} style={styles.msgRow}>
                  <Text style={styles.msgSender}>
                    {m.sender_id === user?.id ? "Siz" : "Hemşire"}
                  </Text>
                  <Text style={styles.msgText} numberOfLines={1}>
                    {m.type === "image" ? "Fotoğraf" : m.content}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="İyileşme zaman çizelgesi"
          actionLabel="Arşiv"
          onAction={() => router.push({ pathname: "/wound-archive", params: { woundId: wound.id } })}
        />
        {submissions.length === 0 ? (
          <Card>
            <Body color={colors.textMuted} center>
              Henüz gönderim yok. Yeni fotoğraf ekleyerek takibi başlatın.
            </Body>
          </Card>
        ) : (
          <View style={{ gap: spacing.md }}>
            {submissions.map((s) => (
              <Card key={s.id}>
                <View style={styles.entryRow}>
                  <WoundPhoto height={70} compact label="" style={styles.entryThumb} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.entryHead}>
                      <Text style={styles.entryDay}>{formatDate(s.created_at)}</Text>
                      {s.healing_percent != null ? (
                        <Text style={styles.entryPct}>%{s.healing_percent}</Text>
                      ) : null}
                    </View>
                    <Body color={colors.textBody} style={styles.entryNote}>
                      {s.patient_note ?? "Gönderim alındı."}
                    </Body>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>

      <InfoBanner tone="success" icon="🔒" text="Tüm görseller şifrelidir; yalnızca atanmış hemşireniz açabilir." />

      <Button
        label="Yeni fotoğraf ekle"
        icon="📷"
        onPress={() => router.push({ pathname: "/photo-submit", params: { woundId: wound.id } })}
        style={styles.cta}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.sm, minHeight: 320 },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { marginTop: spacing.sm },
  head: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg },
  title: { fontSize: 20 },
  compare: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  compareCell: { flex: 1, gap: spacing.xs },
  compareLabel: { fontFamily: sansFont, color: colors.textMuted, fontSize: 11, textAlign: "center" },
  progressCard: {},
  section: { marginTop: spacing.xl },
  planTitle: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "800", fontSize: 15 },
  planNote: { marginTop: spacing.xs },
  planCta: { marginTop: spacing.md },
  msgRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  msgSender: { fontFamily: sansFont, color: colors.primary, fontWeight: "700", fontSize: 12, width: 56 },
  msgText: { flex: 1, fontFamily: sansFont, color: colors.textBody, fontSize: 13 },
  entryRow: { flexDirection: "row", gap: spacing.md },
  entryThumb: { width: 70, borderRadius: radius.sm },
  entryHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  entryDay: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "700", fontSize: 14 },
  entryPct: { fontFamily: sansFont, color: colors.primary, fontWeight: "800", fontSize: 14 },
  entryNote: { marginTop: 4, fontSize: 13 },
  cta: { marginTop: spacing.lg },
});
