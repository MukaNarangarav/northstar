import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text } from 'react-native';

import { Body, Button, Card, Screen, Title, styles as ui } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { getBenefit } from '@/lib/data';

export default function BenefitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const benefit = getBenefit(id);
  const [checked, setChecked] = useState<string[]>([]);

  if (!benefit) return <Screen><Body>Not found.</Body></Screen>;

  const toggle = (doc: string) =>
    setChecked(checked.includes(doc) ? checked.filter((d) => d !== doc) : [...checked, doc]);

  return (
    <Screen>
      <Title>
        {benefit.emoji} {benefit.name}
      </Title>
      <Body muted>{benefit.summary}</Body>

      <Card>
        <Text style={ui.small}>YOU MAY BE ELIGIBLE IF</Text>
        <Body>{benefit.mightQualify}</Body>
      </Card>

      <Card>
        <Text style={ui.small}>WHAT TO BRING (TAP TO CHECK OFF)</Text>
        {benefit.documents.map((doc) => (
          <Pressable key={doc} onPress={() => toggle(doc)} style={styles.check}>
            <Text style={styles.box}>{checked.includes(doc) ? '☑' : '☐'}</Text>
            <Body>{doc}</Body>
          </Pressable>
        ))}
      </Card>

      <Card>
        <Text style={ui.small}>HOW TO APPLY</Text>
        {benefit.steps.map((s, i) => (
          <Body key={i}>
            {i + 1}. {s}
          </Body>
        ))}
      </Card>

      <Button label="Open the official site" onPress={() => Linking.openURL(benefit.url)} />
      <Body muted>
        NorthStar is a guide, not a government office. The official site makes the final decision.
      </Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  check: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  box: { color: Colors.star, fontSize: 22 },
});
