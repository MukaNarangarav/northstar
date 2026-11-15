import { router } from 'expo-router';
import { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';

import { Body, Button, LargeTitle, Row, Screen, Section } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { benefits } from '@/lib/data';
import { useProfile } from '@/lib/profile';
import { makeRecoveryCode } from '@/lib/recovery';
import { buildRoadmap, progress, type RoadmapItem } from '@/lib/roadmap';
import type { StepStatus } from '@/lib/types';

const STATUS_TEXT: Record<StepStatus, string> = {
  done: 'Done',
  next: 'Next',
  unlocked: '',
  locked: '',
};

export default function PlanScreen() {
  const { answers, completed, reset } = useProfile();
  const [confirmReset, setConfirmReset] = useState(false);
  const items = buildRoadmap(answers!, completed);
  const { done, total } = progress(items);
  const next = items.find((i) => i.status === 'next');
  const code = makeRecoveryCode(answers!, completed);

  return (
    <Screen>
      <LargeTitle subtitle={`${done} of ${total} steps done`} exit>
        Your plan
      </LargeTitle>

      <View
        style={styles.bar}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`${done} of ${total} steps done`}
        accessibilityValue={{ min: 0, max: total, now: done }}>
        <View style={[styles.barFill, { width: `${(done / total) * 100}%` }]} />
      </View>

      {next ? (
        <View style={styles.next}>
          <Text style={styles.nextLabel}>Next step</Text>
          <Text style={styles.nextTitle}>{next.step.title}</Text>
          <Text style={styles.nextPlain}>{next.step.plainTitle}</Text>
          <Button label="Start" onPress={() => router.push(`/step/${next.step.id}`)} />
        </View>
      ) : (
        <View style={styles.next}>
          <Text style={styles.nextTitle}>You made it to Home Base.</Text>
          <Text style={styles.nextPlain}>Look how far you've come.</Text>
        </View>
      )}

      <Section title="All steps" footer="Locked steps open as a preview.">
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
            tint={status === 'done' ? Colors.done : status === 'locked' ? Colors.textMuted : undefined}
            onPress={() => router.push(`/step/${step.id}`)}
          />
        ))}
      </Section>

      <Section title="Apply for help" footer="Step-by-step guides for Ohio benefits.">
        {benefits.map((b) => (
          <Row key={b.id} title={b.name} subtitle={b.summary} onPress={() => router.push(`/benefit/${b.id}`)} />
        ))}
      </Section>

      <Section
        title="Keep your plan safe"
        footer="Your plan is only saved on this phone. Write this code down. On a new phone, choose “I have a recovery code” to get your plan back.">
        <View style={styles.codeBox}>
          <Text
            style={styles.code}
            selectable
            accessibilityLabel={`Your recovery code is ${code.split('').join(' ')}`}>
            {code}
          </Text>
        </View>
        <Row
          title="Share or print my plan"
          icon={{ ios: 'square.and.arrow.up', android: 'share' }}
          onPress={() => Share.share({ message: planSummary(items, code) }).catch(() => {})}
          chevron={false}
        />
      </Section>

      <Section title="Something changed?" footer="Your finished steps stay finished when you retake the questions.">
        <Row title="Retake the questions" onPress={() => router.push('/questionnaire?retake=1')} />
        <Row
          title="Start over"
          tint={Colors.danger}
          onPress={() => setConfirmReset(true)}
          chevron={false}
        />
      </Section>

      {confirmReset && (
        <View style={styles.confirm}>
          <Body>This erases your whole plan and progress on this phone. Are you sure?</Body>
          <Button label="Yes, erase everything" variant="danger" onPress={reset} />
          <Button label="Cancel" variant="secondary" onPress={() => setConfirmReset(false)} />
        </View>
      )}
    </Screen>
  );
}

// A plain-text copy of the plan, for texting to yourself or giving to a caseworker.
function planSummary(items: RoadmapItem[], code: string) {
  const mark = { done: '[x]', next: '[>]', unlocked: '[ ]', locked: '[ ]' } as const;
  const lines = items.map(({ step, status }) => `${mark[status]} ${step.title}: ${step.plainTitle}`);
  return [
    'My NorthStar plan',
    '',
    ...lines,
    '',
    `Recovery code: ${code}`,
    'Shelter tonight: Columbus Homeless Hotline 614-274-7000 (24/7)',
    'Any other help: call 211',
  ].join('\n');
}

const styles = StyleSheet.create({
  bar: { height: 4, borderRadius: 2, backgroundColor: Colors.cardLight, overflow: 'hidden', marginTop: -16 },
  barFill: { height: '100%', backgroundColor: Colors.copperLight },
  next: { backgroundColor: Colors.card, borderRadius: 18, padding: 20, gap: 6 },
  nextLabel: { color: Colors.copperLight, fontSize: 13, fontWeight: '600' },
  nextTitle: { color: Colors.text, fontSize: 24, fontWeight: '600', letterSpacing: -0.4 },
  nextPlain: { color: Colors.textMuted, fontSize: 16, marginBottom: 12 },
  codeBox: { paddingVertical: 18, alignItems: 'center' },
  code: { color: Colors.copperLight, fontSize: 30, fontWeight: '700', letterSpacing: 4 },
  confirm: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, gap: 10 },
});
