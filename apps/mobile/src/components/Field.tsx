import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, spacing } from "@saran/tokens";
import { sansFont } from "../lib/theme";

interface FieldProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  prefix?: string;
}

/** Etiketli metin girişi. */
export function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = "default",
  prefix,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textMutedAlt}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

/** Çok satırlı not alanı. */
export function TextArea({ label, placeholder, value, onChangeText }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, styles.area]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMutedAlt}
        value={value}
        onChangeText={onChangeText}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}

/** Tek seçim çip grubu (yara tipi, ağrı seviyesi, hızlı yanıt). */
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Kontrollü onay kutusu satırı (KVKK). */
export function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable style={styles.checkRow} onPress={onToggle}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Text style={styles.boxCheck}>✓</Text> : null}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </Pressable>
  );
}

/** Demo amaçlı dahili state'li onay kutusu (form değeri gerekmiyorsa). */
export function CheckRowUncontrolled({ label }: { label: string }) {
  const [checked, setChecked] = useState(false);
  return <CheckRow label={label} checked={checked} onToggle={() => setChecked((c) => !c)} />;
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  label: { fontFamily: sansFont, color: colors.textBody, fontWeight: "700", fontSize: 13 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  prefix: { fontFamily: sansFont, color: colors.textMuted, fontSize: 14, fontWeight: "600", marginRight: spacing.xs },
  input: {
    flex: 1,
    fontFamily: sansFont,
    color: colors.textHeading,
    fontSize: 14,
    paddingVertical: spacing.md,
  },
  area: {
    minHeight: 92,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: sansFont, color: colors.textBody, fontWeight: "600", fontSize: 13 },
  chipTextActive: { color: "#fff" },
  checkRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  boxCheck: { color: "#fff", fontSize: 13, fontWeight: "800" },
  checkLabel: { fontFamily: sansFont, color: colors.textBody, fontSize: 13, flex: 1, lineHeight: 19 },
});
