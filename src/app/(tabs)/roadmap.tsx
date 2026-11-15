import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Screen, Title } from '@/components/ui';
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

export default function RoadmapScreen() {
  const { answers, completed } = useProfile();
  const items = buildRoadmap(answers!, completed);

  return (
    <Screen>
      <Title>Your Roadmap</Title>
      <Body muted>Each step unlocks the next one.</Body>

      {items.map(({ step, status }, i) => (
        <View key={step.id} style={styles.row}>
          {/* The dot + line on the left makes it look like a path */}
          <View style={styles.pathCol}>
            <View style={[styles.dot, { backgroundColor: dotColor(status) }]} />
            {i < items.length - 1 && <View style={styles.line} />}
          </View>

          <Pressable
            disabled={status === 'locked'}
            onPress={() => router.push(`/step/${step.id}`)}
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
  line: { flex: 1, width: 1, backgroundColor: 'rgba(230, 180, 144, 0.2)', marginTop: Space.xs },
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    padding: Space.md,
    gap: 4,
    marginBottom: Space.sm,
  },
  cardNext: {
    borderWidth: 1,
    borderColor: 'rgba(230, 180, 144, 0.5)',
    backgroundImage: 'linear-gradient(152deg, rgba(229,194,169,0.16) 0%, rgba(107,66,45,0.10) 100%)',
    boxShadow: '0 0 24px rgba(178, 126, 90, 0.25)',
  },
  status: { color: Colors.copperLight, fontSize: 11, fontWeight: '600', letterSpacing: 1.2 },
  title: { color: Colors.text, fontSize: 18, fontWeight: '600', letterSpacing: -0.3 },
  plain: { color: Colors.textMuted, fontSize: 14 },
});
