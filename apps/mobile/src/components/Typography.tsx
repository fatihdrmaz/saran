import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";
import { colors } from "@saran/tokens";
import { sansFont, serifFont } from "../lib/theme";

interface TypoProps extends TextProps {
  children: React.ReactNode;
  color?: string;
  italic?: boolean;
  center?: boolean;
  style?: TextStyle | TextStyle[];
}

/** Serif (Newsreader hissi) hero başlık. README §5. */
export function Hero({ children, color, italic, center, style, ...rest }: TypoProps) {
  return (
    <Text
      {...rest}
      style={[
        styles.hero,
        { color: color ?? colors.textHeading },
        italic && styles.italic,
        center && styles.center,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/** Serif bölüm/ekran başlığı. */
export function Heading({ children, color, italic, center, style, ...rest }: TypoProps) {
  return (
    <Text
      {...rest}
      style={[
        styles.heading,
        { color: color ?? colors.textHeading },
        italic && styles.italic,
        center && styles.center,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/** Sans gövde metni. */
export function Body({ children, color, center, style, ...rest }: TypoProps) {
  return (
    <Text
      {...rest}
      style={[styles.body, { color: color ?? colors.textBody }, center && styles.center, style]}
    >
      {children}
    </Text>
  );
}

/** Soluk ikincil metin. */
export function Muted({ children, color, center, style, ...rest }: TypoProps) {
  return (
    <Text
      {...rest}
      style={[styles.muted, { color: color ?? colors.textMuted }, center && styles.center, style]}
    >
      {children}
    </Text>
  );
}

/** Büyük harfli üst etiket (kicker). */
export function Kicker({ children, color, style, ...rest }: TypoProps) {
  return (
    <Text {...rest} style={[styles.kicker, { color: color ?? colors.primary }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  hero: { fontFamily: serifFont, fontSize: 30, fontWeight: "500", lineHeight: 38 },
  heading: { fontFamily: serifFont, fontSize: 22, fontWeight: "500", lineHeight: 29 },
  body: { fontFamily: sansFont, fontSize: 14, lineHeight: 21 },
  muted: { fontFamily: sansFont, fontSize: 13, lineHeight: 19 },
  kicker: {
    fontFamily: sansFont,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  italic: { fontStyle: "italic" },
  center: { textAlign: "center" },
});
