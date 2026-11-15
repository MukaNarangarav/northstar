import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, LargeTitle, Row, Screen, Section } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { benefits } from '@/lib/data';
import { useProfile } from '@/lib/profile';
import { buildRoadmap, progress } from '@/lib/roadmap';
import type { StepStatus } from '@/lib/types';

const STATUS_TEXT: Record<StepStatus, string> = {
  done: 'Done',
  next: 'Next',
  unlocked: '',
  locked: '',
};

export default function PlanScreen() {
  const { answers, completed, reset } = useProfile();
  const items = buildRoadmap(answers!, completed);
  const { done, total } = progress(items);
  const next = items.find((i) => i.status === 'next');

  return (
    <Screen>
      <LargeTitle subtitle={`${done} of ${total} steps done`}>Your plan</LargeTitle>

      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${(done / total) * 100}%` }]} />
      </View>

      {next && (
        <View style={styles.next}>
          <Text style={styles.nextLabel}>Next step</Text>
          <Text style={styles.nextTitle}>{next.step.title}</Text>
          <Text style={styles.nextPlain}>{next.step.plainTitle}</Text>
          <Button label="Start" onPress={() => router.push(`/step/${next.step.id}`)} />
        </View>
      )}

      <Section title="All steps">
        {items.map(({ step, status }) => (
          <Row
            key={step.id}
            title={step.title}
            subtitle={step.plainTitle}
            value={STATUS_TEXT[status]}
            icon={
              status === 'done'
                ? { ios: 'checkmark.circle.fill', android: 'check_circle' }
                : status === 'locked'
                  ? { ios: 'lock.fill', android: 'lock' }
                  : { ios: 'circle', android: 'radio_button_unchecked' }
            }
            tint={status === 'done' ? Colors.done : undefined}
            disabled={status === 'locked'}
            onPress={() => router.push(`/step/${step.id}`)}
          />
        ))}
      </Section>

      <Section title="Apply for help" footer="Step-by-step guides for Ohio benefits.">
        {benefits.map((b) => (
          <Row key={b.id} title={b.name} subtitle={b.summary} onPress={() => router.push(`/benefit/${b.id}`)} />
        ))}
      </Section>

      <Button label="Retake the questions" variant="plain" onPress={reset} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: { height: 4, borderRadius: 2, backgroundColor: Colors.cardLight, overflow: 'hidden', marginTop: -16 },
  barFill: { height: '100%', backgroundColor: Colors.copperLight },
  next: { backgroundColor: Colors.card, borderRadius: 18, padding: 20, gap: 6 },
  nextLabel: { color: Colors.copperLight, fontSize: 13, fontWeight: '600' },
  nextTitle: { color: Colors.text, fontSize: 24, fontWeight: '600', letterSpacing: -0.4 },
  nextPlain: { color: Colors.textMuted, fontSize: 16, marginBottom: 12 },
});
