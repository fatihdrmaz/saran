import { useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@saran/tokens";
import { Button } from "../components";
import { sansFont, serifFont } from "../lib/theme";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    icon: "📷",
    title: "Yaranızın fotoğrafını gönderin",
    body: "İlk değerlendirmeniz ücretsiz. Uzman hemşireniz fotoğrafınızı inceler.",
  },
  {
    icon: "🩺",
    title: "Hemşireniz bakım planı önerir",
    body: "Evre ve tahmini iyileşme süresi öngörülür, size uygun plan sunulur.",
  },
  {
    icon: "📈",
    title: "İyileşmenizi evden takip edin",
    body: "Plan onayından sonra sınırsız fotoğraf, mesajlaşma ve takip başlar.",
  },
];

/** README §6A-1: Onboarding 3 slayt, koyu yeşil karşılama. */
export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const ref = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const goRegister = () => router.replace("/register");
  const next = () => {
    if (index < SLIDES.length - 1) {
      ref.current?.scrollTo({ x: (index + 1) * width, animated: true });
    } else {
      goRegister();
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topRow}>
        <Text style={styles.brand}>YARA TAKİBİ</Text>
        <Pressable onPress={goRegister}>
          <Text style={styles.skip}>Atla</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((s) => (
          <View key={s.title} style={[styles.slide, { width }]}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>{s.icon}</Text>
            </View>
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <Button label={index === SLIDES.length - 1 ? "Hemen başla" : "Devam"} variant="light" onPress={next} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primaryDark },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  brand: { fontFamily: sansFont, color: colors.tealLight, fontWeight: "800", letterSpacing: 2, fontSize: 14 },
  skip: { fontFamily: sansFont, color: colors.tealLight, fontWeight: "600", fontSize: 14 },
  slide: { paddingHorizontal: spacing["2xl"], justifyContent: "center", alignItems: "center", gap: spacing.lg, flex: 1 },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(127,216,196,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  icon: { fontSize: 52 },
  title: { fontFamily: serifFont, color: "#fff", fontSize: 27, fontWeight: "500", textAlign: "center", lineHeight: 34 },
  body: { fontFamily: sansFont, color: colors.tealLight, fontSize: 15, textAlign: "center", lineHeight: 22 },
  footer: { paddingHorizontal: spacing["2xl"], gap: spacing.lg },
  dots: { flexDirection: "row", justifyContent: "center", gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(127,216,196,0.3)" },
  dotActive: { width: 22, backgroundColor: colors.tealLight },
});
