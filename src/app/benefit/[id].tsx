import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking } from 'react-native';

import { Body, Button, LargeTitle, Row, Screen, Section } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { getBenefit } from '@/lib/data';

export default function BenefitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const benefit = getBenefit(id);
  const [checked, setChecked] = useState<string[]>([]);

  if (!benefit)
    return (
      <Screen edges={[]}>
        <Body>Not found.</Body>
      </Screen>
    );

  const toggle = (doc: string) =>
    setChecked(checked.includes(doc) ? checked.filter((d) => d !== doc) : [...checked, doc]);

  return (
    <Screen edges={[]}>
      <LargeTitle subtitle={benefit.summary}>{benefit.name}</LargeTitle>

      <Section title="You may qualify if">
        <Row title={benefit.mightQualify} />
      </Section>

      <Section title="What to bring" footer="Tap each one when you have it.">
        {benefit.documents.map((doc) => {
          const on = checked.includes(doc);
          return (
            <Row
              key={doc}
              title={doc}
              icon={on ? { ios: 'checkmark.circle.fill', android: 'check_circle' } : { ios: 'circle', android: 'radio_button_unchecked' }}
              tint={on ? Colors.done : undefined}
              onPress={() => toggle(doc)}
              chevron={false}
            />
          );
        })}
      </Section>

      <Section title="How to apply">
        {benefit.steps.map((s, i) => (
          <Row key={i} title={s} value={String(i + 1)} />
        ))}
      </Section>

      <Button label="Apply on the official site" onPress={() => Linking.openURL(benefit.url)} />
      <Body muted>NorthStar is a guide, not a government office.</Body>
    </Screen>
  );
}
