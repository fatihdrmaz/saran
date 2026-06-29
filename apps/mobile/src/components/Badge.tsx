import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, statusColors, type StatusKey } from "@saran/tokens";
import { sansFont } from "../lib/theme";

interface Props {
  label: string;
  /** README §7 tutarlı durum rozetleri. */
  status?: StatusKey;
  /** Serbest renk (özel rozetler için). */
  fg?: string;
  bg?: string;
  icon?: string;
}

const STATUS_LABELS: Record<StatusKey, string> = {
  active: "Aktif takip ✓",
  pending: "Onay bekliyor",
  assessment: "Değerlendirme",
  emergency: "Acil",
};

const STATUS_ICONS: Record<StatusKey, string> = {
  active: "✓",
  pending: "•",
  assessment: "•",
  emergency: "⚠",
};

/** Durum/etiket rozeti. status verilirse statusColors'tan renk + varsayılan metin. */
export function Badge({ label, status, fg, bg, icon }: Props) {
  const colorFg = status ? statusColors[status].fg : (fg ?? colors.textBody);
  const colorBg = status ? statusColors[status].bg : (bg ?? colors.surfaceGreen);
  const text = label ?? (status ? STATUS_LABELS[status] : "");
  const ic = icon ?? (status ? STATUS_ICONS[status] : undefined);

  return (
    <View style={[styles.base, { backgroundColor: colorBg }]}>
      {ic ? <Text style={[styles.text, { color: colorFg }]}>{ic}</Text> : null}
      <Text style={[styles.text, { color: colorFg }]}>{text}</Text>
    </View>
  );
}

/** Sadece status anahtarı vererek standart metinli rozet. */
export function StatusBadge({ status }: { status: StatusKey }) {
  return <Badge label={STATUS_LABELS[status]} status={status} />;
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  text: { fontFamily: sansFont, fontWeight: "700", fontSize: 12 },
});
