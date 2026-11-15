import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, SafetyBar, Screen, Title } from '@/components/ui';
import { Colors, Space } from '@/constants/colors';
import { useProfile } from '@/lib/profile';
import { buildRoadmap } from '@/lib/roadmap';
import type { StepStatus } from '@/lib/types';

const label: Record<StepStatus, string> = {
  done: '✅ Done',
  next: '⭐ Next up',
  unlocked: 'Ready',
  locked: '🔒 Locked',
};

const spoken: Record<StepStatus, string> = {
  done: 'Done',
  next: 'Your next step',
  unlocked: 'Ready to start',
  locked: 'Locked. Tap to preview.',
};

export default function RoadmapScreen() {
  const { answers, completed } = useProfile();
  const items = buildRoadmap(answers!, completed);

  return (
    <Screen>
      <Title>Your Roadmap</Title>
      <Body muted>Each step unlocks the next one. Tap any step to see what's involved.</Body>

      <SafetyBar />

      {items.map(({ step, status }, i) => (
        <View key={step.id} style={styles.row}>
          {/* The dot + line on the left makes it look like a path */}
          <View style={styles.pathCol}>
            <View style={[styles.dot, { backgroundColor: dotColor(status) }]} />
            {i < items.length - 1 && <View style={styles.line} />}
          </View>

          {/* Locked steps can still be opened to preview them; they just can't be completed yet. */}
          <Pressable
            onPress={() => router.push(`/step/${step.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`${step.title}, ${step.plainTitle}. ${spoken[status]}`}
            style={[styles.card, status === 'next' && styles.cardNext, status === 'locked' && { opacity: 0.5 }]}>
            <Text style={styles.status}>{label[status]}</Text>
            <Text style={styles.title}>
              {step.emoji} {step.title}
            </Text>
            <Text style={styles.plain}>{step.plainTitle}</Text>
          </Pressable>
        </View>
      ))}
    </Screen>
  );
}

function dotColor(status: StepStatus) {
  if (status === 'done') return Colors.done;
  if (status === 'next') return Colors.star;
  if (status === 'unlocked') return Colors.text;
  return Colors.locked;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Space.md },
  pathCol: { alignItems: 'center', width: 20 },
  dot: { width: 18, height: 18, borderRadius: 9, marginTop: Space.md },
  line: { flex: 1, width: 2, backgroundColor: Colors.locked, marginTop: Space.xs },
  card: { flex: 1, backgroundColor: Colors.card, borderRadius: 16, padding: Space.md, gap: 4 },
  cardNext: { borderWidth: 2, borderColor: Colors.star },
  status: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' },
  title: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  plain: { color: Colors.textMuted, fontSize: 14 },
});
