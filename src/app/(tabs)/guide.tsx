import { router } from 'expo-router';
import { Text } from 'react-native';

import { Body, Button, Card, HelpNowButton, Screen, Title, styles as ui } from '@/components/ui';
import { useProfile } from '@/lib/profile';
import { benefits } from '@/lib/data';

// The "caseworker in your pocket" section.
export default function GuideScreen() {
  const { reset } = useProfile();

  return (
    <Screen>
      <Title>Your Guide</Title>
      <Body muted>
        Step-by-step help applying for support in Ohio. We'll walk you through what to bring and what
        to do.
      </Body>

      {benefits.map((b) => (
        <Card key={b.id}>
          <Text style={ui.cardTitle}>
            {b.emoji} {b.name}
          </Text>
          <Body muted>{b.summary}</Body>
          <Button label="Walk me through it →" onPress={() => router.push(`/benefit/${b.id}`)} />
        </Card>
      ))}

      <Card>
        <Text style={ui.cardTitle}>Have a complicated situation?</Text>
        <Body muted>
          Legal trouble, disability claims or family issues are best handled with a person. Call 211
          or Legal Aid. They help for free.
        </Body>
      </Card>

      <HelpNowButton />

      <Button label="Retake the questions" variant="secondary" onPress={reset} />
    </Screen>
  );
}
