import { useCallback, useEffect, useState } from "react";
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
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@saran/tokens";
import { Avatar, Body, WoundPhoto } from "../../components";
import { sansFont } from "../../lib/theme";
import { useAuth } from "../../lib/auth";
import {
  getPatientWoundThreads,
  getWoundThread,
  markConversationRead,
  sendMessage,
  woundTypeLabel,
  type WoundThreadSummary,
} from "../../lib/queries";
import type { Database } from "@saran/supabase";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

const quickReplies = ["Teşekkürler", "Tamam, yenileyeceğim", "Ağrım arttı", "Fotoğraf gönderiyorum"];

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/**
 * README §6A-13: Mesajlaşma — artık YARA BAZLI. Seçili yara yoksa mesajlaşılabilir
 * yaraların listesi; bir yara seçilince o yaranın sohbeti (CANLI oku/insert).
 */
export default function Messages() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { woundId: paramWoundId } = useLocalSearchParams<{ woundId?: string }>();

  const [selectedWoundId, setSelectedWoundId] = useState<string | null>(paramWoundId ?? null);
  const [threads, setThreads] = useState<WoundThreadSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);

  const [draft, setDraft] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatUnavailable, setChatUnavailable] = useState(false);
  const [sending, setSending] = useState(false);

  // Bildirim/derin bağlantı ile gelen woundId → o yaranın sohbetini aç.
  useEffect(() => {
    if (paramWoundId) setSelectedWoundId(paramWoundId);
  }, [paramWoundId]);

  // Yara listesi (mesajlaşılabilir yaralar + son mesaj + okunmamış).
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      setListLoading(true);
      getPatientWoundThreads(user.id)
        .then((data) => {
          if (active) setThreads(data);
        })
        .catch((e) => console.warn("[saran] yara sohbetleri yüklenemedi:", e?.message))
        .finally(() => {
          if (active) setListLoading(false);
        });
      return () => {
        active = false;
      };
    }, [user]),
  );

  // Seçili yaranın sohbeti (mesajlar + okundu işaretle).
  useFocusEffect(
    useCallback(() => {
      if (!user || !selectedWoundId) {
        setConversationId(null);
        setMessages([]);
        setChatUnavailable(false);
        return;
      }
      let active = true;
      setChatLoading(true);
      setChatUnavailable(false);
      getWoundThread(selectedWoundId)
        .then(async (thread) => {
          if (!active) return;
          setConversationId(thread.conversationId);
          setMessages(thread.messages);
          try {
            await markConversationRead(thread.conversationId, user.id);
          } catch (e) {
            console.warn("[saran] okundu işaretlenemedi:", (e as Error)?.message);
          }
        })
        .catch((e) => {
          // Yara henüz bir hemşireye atanmamışsa RPC hata verir → nazik not.
          console.warn("[saran] yara sohbeti açılamadı:", (e as Error)?.message);
          if (active) setChatUnavailable(true);
        })
        .finally(() => {
          if (active) setChatLoading(false);
        });
      return () => {
        active = false;
      };
    }, [user, selectedWoundId]),
  );

  const selectedSummary = threads.find((t) => t.wound.id === selectedWoundId) ?? null;

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

  // ── Liste görünümü (seçili yara yok) ──────────────────────────────────────
  if (!selectedWoundId) {
    return (
      <View style={styles.flex}>
        <View style={[styles.listHeader, { paddingTop: insets.top + spacing.md }]}>
          <Text style={styles.listTitle}>Mesajlar</Text>
          <Text style={styles.listSub}>Her yaranız için ayrı sohbet</Text>
        </View>
        {listLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : threads.length === 0 ? (
          <View style={styles.center}>
            <Body color={colors.textMuted} center style={styles.emptyText}>
              Henüz mesajlaşılacak yaranız yok. Planınız onaylanıp hemşireniz atandığında
              yaralarınız burada listelenir.
            </Body>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.listBody} showsVerticalScrollIndicator={false}>
            {threads.map((t) => (
              <Pressable
                key={t.wound.id}
                style={({ pressed }) => [styles.threadRow, pressed && styles.threadPressed]}
                onPress={() => setSelectedWoundId(t.wound.id)}
              >
                <Avatar name={woundTypeLabel(t.wound.type)} size={44} />
                <View style={styles.threadBody}>
                  <Text style={styles.threadTitle} numberOfLines={1}>
                    {woundTypeLabel(t.wound.type)}
                  </Text>
                  <Text style={styles.threadPreview} numberOfLines={1}>
                    {t.lastMessage
                      ? t.lastMessage.type === "image"
                        ? "Fotoğraf"
                        : t.lastMessage.content
                      : "Sohbeti başlatmak için dokunun"}
                  </Text>
                </View>
                <View style={styles.threadRight}>
                  {t.lastMessage ? (
                    <Text style={styles.threadTime}>{formatTime(t.lastMessage.created_at)}</Text>
                  ) : null}
                  {t.unreadCount > 0 ? (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{t.unreadCount}</Text>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }

  // ── Sohbet görünümü (seçili yara) ─────────────────────────────────────────
  const headerTitle = selectedSummary
    ? woundTypeLabel(selectedSummary.wound.type)
    : "Yara sohbeti";

  const backToList = () => {
    setSelectedWoundId(null);
    setConversationId(null);
    setMessages([]);
  };

  const canSend = !!conversationId && draft.trim().length > 0 && !sending;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.select({ ios: "padding", default: undefined })}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={backToList} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Avatar name="Hemşireniz" size={40} online />
        <View style={styles.headInfo}>
          <Text style={styles.headName} numberOfLines={1}>{headerTitle}</Text>
          <Text style={styles.headStatus}>Yara bakım hemşireniz</Text>
        </View>
        <Pressable
          onPress={() =>
            router.push({ pathname: "/wound-detail", params: { woundId: selectedWoundId } })
          }
          style={styles.callBtn}
        >
          <Text style={styles.callIcon}>🩹</Text>
        </Pressable>
      </View>

      {chatLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : chatUnavailable ? (
        <View style={styles.center}>
          <Body color={colors.textMuted} center style={styles.emptyText}>
            Bu yara için mesajlaşma henüz açılmadı. Yaranız bir hemşireye atandığında sohbet
            burada başlar.
          </Body>
        </View>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.thread}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <Body color={colors.textMuted} center style={styles.emptyText}>
              Henüz mesaj yok. Hemşirenize ilk mesajınızı yazın.
            </Body>
          ) : (
            messages.map((m) => {
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
            })
          )}
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
        <Pressable
          style={styles.attach}
          onPress={() =>
            router.push({ pathname: "/photo-submit", params: { woundId: selectedWoundId } })
          }
        >
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
  emptyText: { paddingHorizontal: spacing.lg },
  // Liste
  listHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  listTitle: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "800", fontSize: 20 },
  listSub: { fontFamily: sansFont, color: colors.textMuted, fontSize: 13, marginTop: 2 },
  listBody: { padding: spacing.lg, gap: spacing.md },
  threadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  threadPressed: { opacity: 0.85 },
  threadBody: { flex: 1, gap: 2 },
  threadTitle: { fontFamily: sansFont, color: colors.textHeading, fontWeight: "700", fontSize: 15 },
  threadPreview: { fontFamily: sansFont, color: colors.textMuted, fontSize: 13 },
  threadRight: { alignItems: "flex-end", gap: spacing.xs },
  threadTime: { fontFamily: sansFont, color: colors.textMutedAlt, fontSize: 11 },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: { fontFamily: sansFont, color: "#fff", fontSize: 11, fontWeight: "800" },
  // Sohbet başlığı
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backBtn: { width: 32, height: 40, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 30, color: colors.textHeading, lineHeight: 30 },
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
