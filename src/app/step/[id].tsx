import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { Body, Button, LargeTitle, Row, Screen, Section } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { getResource, getStep } from '@/lib/data';
import { useProfile } from '@/lib/profile';
import { isDone } from '@/lib/roadmap';

export default function StepScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { answers, completed, completeStep, undoStep } = useProfile();
  const [celebrate, setCelebrate] = useState(false);

  const step = getStep(id);
  if (!step || !answers)
    return (
      <Screen edges={[]}>
        <Body>Step not found.</Body>
      </Screen>
    );

  const done = isDone(step, answers, completed);
  const places = step.resourceIds.map(getResource).filter((r) => !!r);

  if (celebrate) {
    return (
      <View style={styles.celebrate}>
        <SymbolView
          name={{ ios: 'checkmark.circle.fill', android: 'check_circle' }}
          size={72}
          tintColor={Colors.done}
          fallback={null}
        />
        <Text style={styles.celebrateText}>{step.celebration}</Text>
        <View style={{ alignSelf: 'stretch' }}>
          <Button label="Back to my plan" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <Screen edges={[]}>
      <LargeTitle subtitle={step.plainTitle}>{step.title}</LargeTitle>

      <Body muted>{step.why}</Body>

      <Section title="What to do">
        {step.tasks.map((t, i) => (
          <Row key={i} title={t} value={String(i + 1)} />
        ))}
      </Section>

      {places.length > 0 && (
        <Section title="Who can help">
          {places.map((r) => (
            <Row
              key={r!.id}
              title={r!.name}
              subtitle={r!.description}
              value={r!.phone ? 'Call' : r!.url ? 'Website' : undefined}
              onPress={r!.phone ? () => Linking.openURL(`tel:${r!.phone}`) : r!.url ? () => Linking.openURL(r!.url!) : undefined}
              chevron={false}
            />
          ))}
        </Section>
      )}

      {done ? (
        completed.includes(step.id) ? (
          <Button label="Mark as not done" variant="plain" onPress={() => undoStep(step.id)} />
        ) : (
          <Body muted>You already have this one.</Body>
        )
      ) : (
        <Button
          label="I did this"
          onPress={() => {
            completeStep(step.id);
            setCelebrate(true);
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  celebrate: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 24,
  },
  celebrateText: { color: Colors.text, fontSize: 26, fontWeight: '600', textAlign: 'center', letterSpacing: -0.4 },
});
