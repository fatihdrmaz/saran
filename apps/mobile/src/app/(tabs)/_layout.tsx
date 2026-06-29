import { Tabs } from "expo-router";
import { Platform, StyleSheet, Text, View, type ColorValue } from "react-native";
import { colors } from "@saran/tokens";
import { sansFont } from "../../lib/theme";

/** Alt sekme çubuğu — README §6A: Ana Sayfa / Takip / Mesaj / Profil. */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMutedAlt,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Ana Sayfa", tabBarIcon: ({ color }) => <TabIcon glyph="⌂" color={color} /> }}
      />
      <Tabs.Screen
        name="tracking"
        options={{ title: "Takip", tabBarIcon: ({ color }) => <TabIcon glyph="📈" color={color} /> }}
      />
      <Tabs.Screen
        name="messages"
        options={{ title: "Mesaj", tabBarIcon: ({ color }) => <TabIcon glyph="💬" color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profil", tabBarIcon: ({ color }) => <TabIcon glyph="👤" color={color} /> }}
      />
    </Tabs>
  );
}

function TabIcon({ glyph, color }: { glyph: string; color: ColorValue }) {
  return (
    <View style={styles.icon}>
      <Text style={{ fontSize: 18, color }}>{glyph}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    height: Platform.select({ ios: 84, default: 64 }),
    paddingTop: 6,
  },
  label: { fontFamily: sansFont, fontSize: 11, fontWeight: "600" },
  item: { paddingTop: 2 },
  icon: { alignItems: "center", justifyContent: "center" },
});
