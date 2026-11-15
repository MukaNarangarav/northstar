import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { Body, Button, LargeTitle, Row, Screen, Section, openDirections } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { getResource, getStep } from '@/lib/data';
import { useProfile } from '@/lib/profile';
import { buildRoadmap } from '@/lib/roadmap';

export default function StepScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { answers, completed, checks, completeStep, undoStep, toggleCheck } = useProfile();
  const [celebrate, setCelebrate] = useState(false);

  const step = getStep(id);
  if (!step || !answers) {
    return (
      <Screen edges={[]}>
        <Body>We couldn't find that step.</Body>
        <Button label="Go to my plan" onPress={() => router.replace('/plan')} />
      </Screen>
    );
  }

  const items = buildRoadmap(answers, completed);
  const status = items.find((i) => i.step.id === step.id)!.status;
  const locked = status === 'locked';
  const listId = `step:${step.id}`;
  const checked = checks[listId] ?? [];
  const missing = step.requires
    .filter((rid) => items.find((i) => i.step.id === rid)?.status !== 'done')
    .map((rid) => getStep(rid)?.title)
    .filter(Boolean);
  const places = step.resourceIds.map(getResource).filter((r) => !!r);

  if (celebrate) {
    const next = items.find((i) => i.status === 'next');
    return (
      <View style={styles.celebrate}>
        <SymbolView
          name={{ ios: 'checkmark.circle.fill', android: 'check_circle' }}
          size={72}
          tintColor={Colors.done}
          fallback={null}
        />
        <Text style={styles.celebrateText}>{step.celebration}</Text>
        <View style={{ alignSelf: 'stretch', gap: 10 }}>
          {next ? (
            <Button label={`Next: ${next.step.title}`} onPress={() => router.replace(`/step/${next.step.id}`)} />
          ) : (
            <Body muted>That was the last step. You made it to Home Base.</Body>
          )}
          <Button label="Back to my plan" variant="secondary" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <Screen edges={[]}>
      <LargeTitle subtitle={step.plainTitle}>{step.title}</LargeTitle>

      {locked && missing.length > 0 && (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Coming up</Text>
          <Body muted>Finish {missing.join(' and ')} first. Here's a preview of this step.</Body>
        </View>
      )}

      <Body muted>{step.why}</Body>

      <Section
        title={locked ? 'What you will do' : 'What to do'}
        footer={locked ? undefined : 'Tap each one when it’s done.'}>
        {step.tasks.map((t, i) => {
          const on = checked.includes(t);
          return (
            <Row
              key={t}
              title={`${i + 1}. ${t}`}
              icon={
                locked
                  ? undefined
                  : on
                    ? { ios: 'checkmark.circle.fill', android: 'check_circle' }
                    : { ios: 'circle', android: 'radio_button_unchecked' }
              }
              tint={on ? Colors.done : undefined}
              onPress={locked ? undefined : () => toggleCheck(listId, t)}
              chevron={false}
            />
          );
        })}
      </Section>

      {places.length > 0 && (
        <Section title="Who can help">
          {places.map((r) => (
            <Row
              key={r!.id}
              title={r!.name}
              subtitle={[r!.description, r!.address, r!.hours, r!.serves].filter(Boolean).join(' · ')}
              value={r!.phone ? 'Call' : r!.address ? 'Directions' : r!.url ? 'Website' : undefined}
              onPress={
                r!.phone
                  ? () => Linking.openURL(`tel:${r!.phone}`)
                  : r!.address
                    ? () => openDirections(r!.address!)
                    : r!.url
                      ? () => Linking.openURL(r!.url!)
                      : undefined
              }
              chevron={false}
            />
          ))}
        </Section>
      )}

      {status === 'done' ? (
        completed.includes(step.id) ? (
          <Button label="Mark as not done" variant="plain" onPress={() => undoStep(step.id)} />
        ) : (
          <Body muted>You already have this one.</Body>
        )
      ) : !locked ? (
        <Button
          label="I did this"
          onPress={() => {
            completeStep(step.id);
            setCelebrate(true);
          }}
        />
      ) : null}
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
  notice: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, gap: 4 },
  noticeTitle: { color: Colors.copperLight, fontSize: 13, fontWeight: '600' },
});
