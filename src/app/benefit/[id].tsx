import { Stack, useLocalSearchParams } from 'expo-router';
import { Linking } from 'react-native';

import { Body, Button, Card, Checklist, Label, Screen, Title } from '@/components/ui';
import { getBenefit } from '@/lib/data';
import { useProfile } from '@/lib/profile';

export default function BenefitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const benefit = getBenefit(id);
  const { checks, toggleCheck } = useProfile();

  if (!benefit) return <Screen><Body>Not found.</Body></Screen>;

  const docsId = `benefit-docs:${benefit.id}`;
  const stepsId = `benefit-steps:${benefit.id}`;

  return (
    <Screen>
      <Stack.Screen options={{ title: benefit.name }} />
      <Title>
        {benefit.emoji} {benefit.name}
      </Title>
      <Body muted>{benefit.summary}</Body>

      <Card>
        <Label>YOU MAY BE ELIGIBLE IF</Label>
        <Body>{benefit.mightQualify}</Body>
      </Card>

      <Card>
        <Label>WHAT TO BRING (TAP TO CHECK OFF)</Label>
        <Checklist
          items={benefit.documents}
          checked={checks[docsId] ?? []}
          onToggle={(doc) => toggleCheck(docsId, doc)}
        />
      </Card>

      <Card>
        <Label>HOW TO APPLY (TAP TO CHECK OFF)</Label>
        <Checklist
          items={benefit.steps}
          checked={checks[stepsId] ?? []}
          onToggle={(item) => toggleCheck(stepsId, item)}
          numbered
        />
      </Card>

      <Button label="Open the official site" onPress={() => Linking.openURL(benefit.url)} />
      <Body muted>
        NorthStar is a guide, not a government office. The official site makes the final decision.
      </Body>
    </Screen>
  );
}
