import { useLocalSearchParams } from 'expo-router';
import { Linking } from 'react-native';

import { Body, Button, LargeTitle, Row, Screen, Section } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { getBenefit } from '@/lib/data';
import { useProfile } from '@/lib/profile';

export default function BenefitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const benefit = getBenefit(id);
  const { checks, toggleCheck } = useProfile();

  if (!benefit)
    return (
      <Screen edges={[]}>
        <Body>Not found.</Body>
      </Screen>
    );

  // Checked items are saved, so the list is still ticked off next time.
  const docsId = `benefit-docs:${benefit.id}`;
  const stepsId = `benefit-steps:${benefit.id}`;

  const checkRow = (listId: string, item: string, label: string) => {
    const on = (checks[listId] ?? []).includes(item);
    return (
      <Row
        key={item}
        title={label}
        icon={on ? { ios: 'checkmark.circle.fill', android: 'check_circle' } : { ios: 'circle', android: 'radio_button_unchecked' }}
        tint={on ? Colors.done : undefined}
        onPress={() => toggleCheck(listId, item)}
        chevron={false}
      />
    );
  };

  return (
    <Screen edges={[]}>
      <LargeTitle subtitle={benefit.summary}>{benefit.name}</LargeTitle>

      <Section title="You may qualify if">
        <Row title={benefit.mightQualify} />
      </Section>

      <Section title="What to bring" footer="Tap each one when you have it.">
        {benefit.documents.map((doc) => checkRow(docsId, doc, doc))}
      </Section>

      <Section title="How to apply">
        {benefit.steps.map((s, i) => checkRow(stepsId, s, `${i + 1}. ${s}`))}
      </Section>

      <Button label="Apply on the official site" onPress={() => Linking.openURL(benefit.url)} />
      <Body muted>NorthStar is a guide, not a government office. The official site makes the final decision.</Body>
    </Screen>
  );
}
