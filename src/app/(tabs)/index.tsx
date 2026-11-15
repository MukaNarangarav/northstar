import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Eyebrow, HelpNowButton, Screen, Title, styles as ui } from '@/components/ui';
import { Colors, Gradients, Radius } from '@/constants/colors';
import { useProfile } from '@/lib/profile';
import { buildRoadmap, progress } from '@/lib/roadmap';

export default function HomeScreen() {
  const { answers, completed } = useProfile();
  const items = buildRoadmap(answers!, completed);
  const { done, total } = progress(items);
  const next = items.find((i) => i.status === 'next');

  return (
    <Screen>
      <Eyebrow>NORTHSTAR</Eyebrow>
      <Title>One step at a time.</Title>
      <Body muted>Other apps list resources. NorthStar shows you the way.</Body>

      {/* Talk card: the copper orb invites people to just speak. */}
      <Pressable onPress={() => router.push('/talk')} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
        <Card highlight style={styles.talkCard}>
          <View style={styles.miniOrb} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={ui.cardTitle}>Just talk to NorthStar</Text>
            <Body muted>Ask anything out loud. We'll answer.</Body>
          </View>
          <Text style={styles.arrow}>→</Text>
        </Card>
      </Pressable>

      <HelpNowButton />

      <Card>
        <Eyebrow>YOUR PROGRESS</Eyebrow>
        <View style={styles.progressRow}>
          <Text style={styles.bigNumber}>{done}</Text>
          <Text style={styles.ofTotal}>/ {total} steps to Home Base</Text>
        </View>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${(done / total) * 100}%` }]} />
        </View>
      </Card>

      {next ? (
        <Card>
          <Eyebrow>YOUR NEXT STEP</Eyebrow>
          <Text style={ui.cardTitle}>
            {next.step.emoji} {next.step.title}
          </Text>
          <Body muted>{next.step.plainTitle}</Body>
          <Button label="Let's do it →" onPress={() => router.push(`/step/${next.step.id}`)} />
        </Card>
      ) : (
        <Card highlight>
          <Text style={ui.cardTitle}>🏠 You made it to Home Base!</Text>
          <Body muted>Look how far you've come. We're proud of you.</Body>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  talkCard: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 20 },
  miniOrb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundImage: Gradients.orb,
    boxShadow: '0 0 24px rgba(230, 180, 144, 0.45)',
  },
  arrow: { color: Colors.copperLight, fontSize: 22, fontWeight: '600' },
  progressRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  bigNumber: { color: Colors.text, fontSize: 44, fontWeight: '600', letterSpacing: -1.5 },
  ofTotal: { color: Colors.textMuted, fontSize: 16 },
  barBg: { height: 6, backgroundColor: Colors.cardLight, borderRadius: Radius.pill, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: Radius.pill, backgroundImage: Gradients.copper },
});
