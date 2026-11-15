import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { Body, Button, Card, SafetyBar, Screen, Title, styles as ui } from '@/components/ui';
import { benefits } from '@/lib/data';
import { useProfile } from '@/lib/profile';

// The "caseworker in your pocket" section.
export default function GuideScreen() {
  const { reset } = useProfile();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <Screen>
      <Title>Your Guide</Title>
      <Body muted>
        Step-by-step help applying for support in Ohio. We'll walk you through what to bring and what
        to do.
      </Body>

      <SafetyBar />

      {benefits.map((b) => (
        <Card key={b.id}>
          <Text style={ui.cardTitle}>
            {b.emoji} {b.name}
          </Text>
          <Body muted>{b.summary}</Body>
          <Button
            label="Walk me through it →"
            accessibilityLabel={`Walk me through ${b.name}`}
            onPress={() => router.push(`/benefit/${b.id}`)}
          />
        </Card>
      ))}

      <Card>
        <Text style={ui.cardTitle}>Have a complicated situation?</Text>
        <Body muted>
          Legal trouble, disability claims or family issues are best handled with a person. Call 211
          or Legal Aid. They help for free.
        </Body>
      </Card>

      <Card>
        <Text style={ui.cardTitle}>Has something changed?</Text>
        <Body muted>Answer the questions again. The steps you've finished stay finished.</Body>
        <Button
          label="Retake the questions"
          variant="secondary"
          onPress={() => router.push('/questionnaire?retake=1')}
        />

        {confirmReset ? (
          <>
            <Body>This erases your whole plan and progress on this phone. Are you sure?</Body>
            <Button label="Yes, erase everything" variant="danger" onPress={reset} />
            <Button label="Cancel" variant="secondary" onPress={() => setConfirmReset(false)} />
          </>
        ) : (
          <Button label="Start over" variant="secondary" onPress={() => setConfirmReset(true)} />
        )}
      </Card>
    </Screen>
  );
}
