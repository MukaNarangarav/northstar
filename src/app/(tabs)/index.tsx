import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, HelpNowButton, Screen, Title, styles as ui } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { useProfile } from '@/lib/profile';
import { buildRoadmap, progress } from '@/lib/roadmap';

export default function HomeScreen() {
  const { answers, completed } = useProfile();
  const items = buildRoadmap(answers!, completed);
  const { done, total } = progress(items);
  const next = items.find((i) => i.status === 'next');

  return (
    <Screen>
      <Title>⭐ NorthStar</Title>
      <Body muted>Other apps list resources. NorthStar shows you the way.</Body>

      <HelpNowButton />

      <Card>
        <Text style={ui.small}>YOUR PROGRESS</Text>
        <Text style={ui.cardTitle}>
          {done} of {total} steps to Home Base
        </Text>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${(done / total) * 100}%` }]} />
        </View>
      </Card>

      {next ? (
        <Card>
          <Text style={ui.small}>YOUR NEXT STEP</Text>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  barBg: { height: 10, backgroundColor: Colors.cardLight, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: Colors.star },
});
