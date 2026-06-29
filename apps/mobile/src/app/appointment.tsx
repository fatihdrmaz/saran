import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { colors, radius, spacing } from "@saran/tokens";
import { AppointmentType } from "@saran/shared";
import { Body, Button, Heading, ScreenContainer } from "../components";
import { sansFont } from "../lib/theme";
import { useAuth } from "../lib/auth";
import {
  createAppointment,
  getAppointments,
  getAssignedNurseId,
} from "../lib/queries";
import type { Database } from "@saran/supabase";

type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];

const TYPES: { value: AppointmentType; label: string; icon: string }[] = [
  { value: AppointmentType.VIDEO, label: "Görüntülü", icon: "🎥" },
  { value: AppointmentType.VOICE, label: "Sesli", icon: "📞" },
];

const SLOTS = ["09:00", "10:00", "11:00", "13:30", "15:00", "16:30", "18:00", "19:00"];

const DAY_NAMES = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const MONTH_NAMES = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

/** Bugünden başlayarak 7 günlük tarih şeridi üret. */
function buildDays() {
  const out: { id: string; dayLabel: string; date: string; iso: string }[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push({
      id: d.toISOString().slice(0, 10),
      dayLabel: i === 0 ? "Bugün" : DAY_NAMES[d.getDay()],
      date: `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`,
      iso: d.toISOString().slice(0, 10),
    });
  }
  return out;
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const STATUS_LABELS: Record<AppointmentRow["status"], string> = {
  requested: "Onay bekliyor",
  confirmed: "Onaylandı",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

/** README §6A-14: Randevu — Görüntülü/Sesli + tarih + saat + onayla (CANLI). */
export default function Appointment() {
  const router = useRouter();
  const { user } = useAuth();
  const days = useMemo(buildDays, []);

  const [type, setType] = useState<AppointmentType>(TYPES[0].value);
  const [day, setDay] = useState(days[0].id);
  const [slot, setSlot] = useState<string | null>(null);

  const [nurseId, setNurseId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      setLoading(true);
      Promise.all([getAssignedNurseId(user.id), getAppointments(user.id)])
        .then(([resolvedNurse, list]) => {
          if (!active) return;
          setNurseId(resolvedNurse);
          setAppointments(list);
        })
        .catch((e) => console.warn("[saran] randevu verisi yüklenemedi:", e?.message))
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [user]),
  );

  const onConfirm = async () => {
    if (!user || !nurseId || !slot || submitting) return;
    const [h, m] = slot.split(":").map(Number);
    const scheduled = new Date(`${day}T00:00:00`);
    scheduled.setHours(h, m, 0, 0);

    setSubmitting(true);
    try {
      await createAppointment({
        patientId: user.id,
        nurseId,
        type,
        scheduledAt: scheduled.toISOString(),
        durationMin: 30,
      });
      Alert.alert(
        "Randevu talebiniz alındı",
        "Hemşireniz onayladığında bildirim alacaksınız.",
        [{ text: "Tamam", onPress: () => router.back() }],
      );
    } catch (e) {
      Alert.alert("Randevu oluşturulamadı", e instanceof Error ? e.message : "Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  // Atanmış hemşire yoksa: nazik uyarı + değerlendirmeye yönlendir, form kapalı.
  if (!nurseId) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🩺</Text>
          <Heading center style={styles.emptyTitle}>Henüz atanmış hemşireniz yok</Heading>
          <Body center color={colors.textMuted} style={styles.emptyText}>
            Randevu oluşturabilmek için önce ücretsiz bir değerlendirme başlatın. Hemşireniz
            atandığında randevu talebinde bulunabilirsiniz.
          </Body>
          <Button label="Ücretsiz değerlendirme başlat" icon="📷" onPress={() => router.push("/assessment")} style={styles.emptyCta} />
        </View>
      </ScreenContainer>
    );
  }

  const upcoming = appointments.filter((a) => a.status !== "cancelled");

  return (
    <ScreenContainer>
      {upcoming.length > 0 ? (
        <>
          <Heading style={styles.title}>Randevularınız</Heading>
          <View style={styles.list}>
            {upcoming.map((a) => (
              <View key={a.id} style={styles.apptRow}>
                <Text style={styles.apptIcon}>{a.type === "video" ? "🎥" : "📞"}</Text>
                <View style={styles.flex}>
                  <Text style={styles.apptWhen}>{formatWhen(a.scheduled_at)}</Text>
                  <Text style={styles.apptType}>{a.type === "video" ? "Görüntülü görüşme" : "Sesli görüşme"}</Text>
                </View>
                <Text style={styles.apptStatus}>{STATUS_LABELS[a.status]}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      <Heading style={styles.title}>Görüşme türü</Heading>
      <View style={styles.typeRow}>
        {TYPES.map((t) => {
          const active = t.value === type;
          return (
            <Pressable key={t.value} onPress={() => setType(t.value)} style={[styles.typeCard, active && styles.typeActive]}>
              <Text style={styles.typeIcon}>{t.icon}</Text>
              <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Heading style={styles.title}>Tarih</Heading>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayStrip}>
        {days.map((d) => {
          const active = d.id === day;
          return (
            <Pressable key={d.id} onPress={() => setDay(d.id)} style={[styles.dayCell, active && styles.dayActive]}>
              <Text style={[styles.dayLabel, active && styles.dayTextActive]}>{d.dayLabel}</Text>
              <Text style={[styles.dayDate, active && styles.dayTextActive]}>{d.date}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Heading style={styles.title}>Uygun saatler</Heading>
      <View style={styles.slots}>
        {SLOTS.map((s) => {
          const active = s === slot;
          return (
            <Pressable key={s} onPress={() => setSlot(s)} style={[styles.slot, active && styles.slotActive]}>
              <Text style={[styles.slotText, active && styles.slotTextActive]}>{s}</Text>
            </Pressable>
          );
        })}
      </View>

      <Body color={colors.textMuted} style={styles.note}>
        Randevu talebiniz hemşireye iletilir; onaylanınca bildirim alırsınız.
      </Body>

      <Button label="Randevuyu onayla" disabled={!slot} loading={submitting} onPress={onConfirm} style={styles.cta} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.sm, minHeight: 360 },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { marginTop: spacing.sm },
  emptyText: { paddingHorizontal: spacing.sm },
  emptyCta: { marginTop: spacing.lg, alignSelf: "stretch" },
  flex: { flex: 1 },
  title: { fontSize: 18, marginTop: spacing.xl, marginBottom: spacing.md },
  list: { gap: spacing.sm },
  apptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  apptIcon: { fontSize: 22 },
  apptWhen: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "700", fontSize: 14 },
  apptType: { fontFamily: sansFont, color: colors.textMuted, fontSize: 12, marginTop: 2 },
  apptStatus: { fontFamily: sansFont, color: colors.primaryMid, fontSize: 12, fontWeight: "700" },
  typeRow: { flexDirection: "row", gap: spacing.md },
  typeCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
  },
  typeActive: { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.surfaceGreenAlt },
  typeIcon: { fontSize: 24 },
  typeLabel: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "700", fontSize: 14 },
  typeLabelActive: { color: colors.primary },
  dayStrip: { gap: spacing.sm },
  dayCell: {
    width: 58,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: 2,
    backgroundColor: colors.surface,
  },
  dayActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayLabel: { fontFamily: sansFont, color: colors.textMuted, fontSize: 12, fontWeight: "600" },
  dayDate: { fontFamily: sansFont, color: colors.textHeading, fontSize: 13, fontWeight: "700" },
  dayTextActive: { color: "#fff" },
  slots: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  slot: {
    width: "30%",
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  slotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotText: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "700", fontSize: 14 },
  slotTextActive: { color: "#fff" },
  note: { marginTop: spacing.lg },
  cta: { marginTop: spacing.md },
});
