import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { HelpNowButton } from '@/components/ui';
import { Colors, Space } from '@/constants/colors';
import { ask, type Match, type Reply } from '@/lib/ask';

type Message = { from: 'me'; text: string } | { from: 'bot'; reply: Reply };

const SUGGESTIONS = ['Where can I sleep tonight?', 'I lost my ID', 'How do I get food?', 'I need a job'];

export default function AskScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      from: 'bot',
      reply: {
        crisis: false,
        text: "Hi! Ask me anything, like where to sleep, how to get an ID, or how to apply for food help.",
        matches: [],
      },
    },
  ]);
  const [input, setInput] = useState('');
  const scroll = useRef<ScrollViewInstance>(null);

  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { from: 'me', text: q }, { from: 'bot', reply: ask(q) }]);
    setInput('');
  }

  function open(m: Match) {
    if (m.kind === 'step') router.push(`/step/${m.id}`);
    else if (m.kind === 'benefit') router.push(`/benefit/${m.id}`);
    else if (m.phone) Linking.openURL(`tel:${m.phone}`);
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}>
      <ScrollView
        ref={scroll}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
        {messages.map((msg, i) =>
          msg.from === 'me' ? (
            <View key={i} style={[styles.bubble, styles.me]}>
              <Text style={styles.meText}>{msg.text}</Text>
            </View>
          ) : (
            <View key={i} style={[styles.bubble, styles.bot]}>
              <Text style={styles.botText}>{msg.reply.text}</Text>
              {msg.reply.crisis && <HelpNowButton />}
              {msg.reply.matches.map((m) => (
                <Pressable key={m.kind + m.id} onPress={() => open(m)} style={styles.match}>
                  <Text style={styles.matchTitle}>
                    {m.title}
                    {m.kind === 'resource' && m.phone ? `  📞 ${m.phone}` : '  →'}
                  </Text>
                  <Text style={styles.matchDetail} numberOfLines={2}>
                    {m.detail}
                  </Text>
                </Pressable>
              ))}
            </View>
          ),
        )}

        {messages.length === 1 && (
          <View style={styles.chips}>
            {SUGGESTIONS.map((s) => (
              <Pressable key={s} onPress={() => send(s)} style={styles.chip}>
                <Text style={styles.chipText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => send(input)}
          placeholder="Type your question..."
          placeholderTextColor={Colors.textMuted}
          returnKeyType="send"
          style={styles.input}
        />
        <Pressable onPress={() => send(input)} style={styles.send}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Space.md, gap: Space.sm },
  bubble: { borderRadius: 16, padding: 12, maxWidth: '88%', gap: Space.sm },
  me: { alignSelf: 'flex-end', backgroundColor: Colors.star },
  meText: { color: Colors.background, fontSize: 16, fontWeight: '600' },
  bot: { alignSelf: 'flex-start', backgroundColor: Colors.card },
  botText: { color: Colors.text, fontSize: 16, lineHeight: 22 },
  match: { backgroundColor: Colors.cardLight, borderRadius: 12, padding: 10, gap: 2 },
  matchTitle: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  matchDetail: { color: Colors.textMuted, fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, marginTop: Space.sm },
  chip: { backgroundColor: Colors.card, borderColor: Colors.star, borderWidth: 1, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  chipText: { color: Colors.text },
  inputRow: { flexDirection: 'row', gap: Space.sm, padding: Space.md, borderTopWidth: 1, borderTopColor: Colors.cardLight },
  input: { flex: 1, backgroundColor: Colors.card, color: Colors.text, borderRadius: 12, padding: 12, fontSize: 16 },
  send: { backgroundColor: Colors.star, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  sendText: { color: Colors.background, fontWeight: '700' },
});
