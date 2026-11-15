import { router } from 'expo-router';
import { Share, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Label, SafetyBar, Screen, Title, styles as ui } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { useProfile } from '@/lib/profile';
import { makeRecoveryCode } from '@/lib/recovery';
import { buildRoadmap, progress, type RoadmapItem } from '@/lib/roadmap';

export default function HomeScreen() {
  const { answers, completed } = useProfile();
  const items = buildRoadmap(answers!, completed);
  const { done, total } = progress(items);
  const next = items.find((i) => i.status === 'next');
  const code = makeRecoveryCode(answers!, completed);

  return (
    <Screen>
      <Title>⭐ NorthStar</Title>
      <Body muted>Other apps list resources. NorthStar shows you the way.</Body>

      <SafetyBar />

      <Card>
        <Label>YOUR PROGRESS</Label>
        <Text style={ui.cardTitle}>
          {done} of {total} steps to Home Base
        </Text>
        <View
          style={styles.barBg}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={`${done} of ${total} steps done`}
          accessibilityValue={{ min: 0, max: total, now: done }}>
          <View style={[styles.barFill, { width: `${(done / total) * 100}%` }]} />
        </View>
      </Card>

      {next ? (
        <Card>
          <Label>YOUR NEXT STEP</Label>
          <Text style={ui.cardTitle}>
            {next.step.emoji} {next.step.title}
          </Text>
          <Body muted>{next.step.plainTitle}</Body>
          <Button label="Let's do it →" onPress={() => router.push(`/step/${next.step.id}`)} />
        </Card>
      ) : (
        <Card>
          <Text style={ui.cardTitle}>🏠 You made it to Home Base!</Text>
          <Body muted>Look how far you've come. We're proud of you.</Body>
        </Card>
      )}

      <Card>
        <Label>KEEP YOUR PLAN SAFE</Label>
        <Body muted>
          Your plan is only saved on this phone. Write this code down. If you lose your phone, enter it
          on a new one to get your plan back.
        </Body>
        <Text style={styles.code} selectable accessibilityLabel={`Your code is ${code.split('').join(' ')}`}>
          {code}
        </Text>
        <Button
          label="Share or print my plan"
          variant="secondary"
          accessibilityHint="Send your plan to yourself, a caseworker or a printer"
          onPress={() => Share.share({ message: planSummary(items, code) }).catch(() => {})}
        />
      </Card>
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
  barBg: { height: 10, backgroundColor: Colors.cardLight, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: Colors.star },
  code: {
    color: Colors.star,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 3,
    textAlign: 'center',
    paddingVertical: 4,
  },
});
