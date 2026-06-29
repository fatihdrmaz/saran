import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@saran/tokens";
import { Avatar, Body, WoundPhoto } from "../../components";
import { sansFont } from "../../lib/theme";
import { useAuth } from "../../lib/auth";
import { getConversationThread, sendMessage } from "../../lib/queries";
import type { Database } from "@saran/supabase";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

const quickReplies = ["Teşekkürler 🙏", "Tamam, yenileyeceğim", "Ağrım arttı", "Fotoğraf gönderiyorum"];

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/** README §6A-13: Mesajlaşma — hemşire ile sohbet (CANLI oku/insert). */
export default function Messages() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [draft, setDraft] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      setLoading(true);
      getConversationThread(user.id)
        .then((thread) => {
          if (!active) return;
          setConversationId(thread?.conversation.id ?? null);
          setMessages(thread?.messages ?? []);
        })
        .catch((e) => console.warn("[saran] mesajlar yüklenemedi:", e?.message))
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [user]),
  );

  const onSend = async () => {
    const text = draft.trim();
    if (!text || !conversationId || !user || sending) return;
    setSending(true);
    setDraft("");
    try {
      const msg = await sendMessage(conversationId, user.id, text);
      setMessages((prev) => [...prev, msg]);
    } catch (e) {
      console.warn("[saran] mesaj gönderilemedi:", e instanceof Error ? e.message : e);
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  const canSend = !!conversationId && draft.trim().length > 0 && !sending;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.select({ ios: "padding", default: undefined })}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Avatar name="Hemşireniz" size={40} online />
        <View style={styles.headInfo}>
          <Text style={styles.headName}>Hemşireniz</Text>
          <Text style={styles.headStatus}>Yara bakım hemşiresi</Text>
        </View>
        <Pressable onPress={() => router.push("/appointment")} style={styles.callBtn}>
          <Text style={styles.callIcon}>📅</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !conversationId ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Body color={colors.textMuted} center style={styles.emptyText}>
            Henüz bir konuşmanız yok. Planınız onaylanıp hemşireniz atandığında mesajlaşma burada açılır.
          </Body>
        </View>
      ) : (
        <ScrollView style={styles.flex} contentContainerStyle={styles.thread} showsVerticalScrollIndicator={false}>
          {messages.map((m) => {
            const mine = m.sender_id === user?.id;
            return (
              <View key={m.id} style={[styles.bubbleRow, mine ? styles.right : styles.left]}>
                {m.type === "image" ? (
                  <View style={styles.imageBubble}>
                    <WoundPhoto height={140} compact showReveal label="Fotoğraf" style={styles.bubbleImage} />
                  </View>
                ) : (
                  <View style={[styles.bubble, mine ? styles.bubbleMe : styles.bubbleNurse]}>
                    <Text style={[styles.bubbleText, mine && styles.bubbleTextMe]}>{m.content}</Text>
                    <Text style={[styles.time, mine && styles.timeMe]}>{formatTime(m.created_at)}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {conversationId ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickWrap} contentContainerStyle={styles.quickInner}>
          {quickReplies.map((q) => (
            <Pressable key={q} style={styles.quickChip} onPress={() => setDraft(q)}>
              <Text style={styles.quickText}>{q}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Pressable style={styles.attach}>
          <Text style={styles.attachIcon}>📷</Text>
        </Pressable>
        <TextInput
          style={styles.input}
          placeholder="Mesaj yazın..."
          placeholderTextColor={colors.textMutedAlt}
          value={draft}
          onChangeText={setDraft}
          editable={!!conversationId}
        />
        <Pressable style={[styles.send, !canSend && styles.sendDisabled]} onPress={onSend} disabled={!canSend}>
          <Text style={styles.sendIcon}>↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bgCream },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.md },
  emptyIcon: { fontSize: 40 },
  emptyText: { paddingHorizontal: spacing.lg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headInfo: { flex: 1 },
  headName: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "800", fontSize: 15 },
  headStatus: { fontFamily: sansFont, color: colors.primaryMid, fontSize: 12, fontWeight: "600" },
  callBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceGreen, alignItems: "center", justifyContent: "center" },
  callIcon: { fontSize: 18 },
  thread: { padding: spacing.lg, gap: spacing.sm },
  bubbleRow: { maxWidth: "82%" },
  left: { alignSelf: "flex-start" },
  right: { alignSelf: "flex-end" },
  bubble: { borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: 2 },
  bubbleNurse: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderBottomLeftRadius: 4 },
  bubbleMe: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleText: { fontFamily: sansFont, color: colors.textBody, fontSize: 14, lineHeight: 20 },
  bubbleTextMe: { color: "#fff" },
  time: { fontFamily: sansFont, color: colors.textMutedAlt, fontSize: 10, alignSelf: "flex-end" },
  timeMe: { color: "rgba(255,255,255,0.7)" },
  imageBubble: { width: 200 },
  bubbleImage: { borderRadius: radius.md },
  quickWrap: { maxHeight: 48, borderTopWidth: 1, borderTopColor: colors.cardBorder },
  quickInner: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  quickChip: { backgroundColor: colors.surfaceGreen, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginRight: spacing.sm },
  quickText: { fontFamily: sansFont, color: colors.primary, fontSize: 13, fontWeight: "600" },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  attach: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  attachIcon: { fontSize: 18 },
  input: {
    flex: 1,
    backgroundColor: colors.bgCream,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontFamily: sansFont,
    fontSize: 14,
    color: colors.textHeading,
  },
  send: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  sendDisabled: { opacity: 0.4 },
  sendIcon: { color: "#fff", fontSize: 20, fontWeight: "800" },
});
