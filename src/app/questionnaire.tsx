import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, QuickExitButton } from '@/components/ui';
import { Colors, Space } from '@/constants/colors';
import { useProfile } from '@/lib/profile';
import { questions } from '@/lib/questions';
import type { Answers } from '@/lib/types';

const HOTLINE = '614-274-7000';

export default function QuestionnaireScreen() {
  const { retake } = useLocalSearchParams<{ retake?: string }>();
  const { saveAnswers } = useProfile();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  // Shown right after someone says they don't have a safe place tonight.
  const [showShelterHelp, setShowShelterHelp] = useState(false);

  const q = questions[index];

  function goNext(next: Partial<Answers>) {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      return;
    }
    // Done! Save and go to the plan.
    saveAnswers(next as Answers);
    if (retake && router.canGoBack()) router.back();
    else router.replace('/');
  }

  // "Not sure" counts as no, so the step stays on the plan instead of being skipped.
  function answer(value: boolean) {
    const next = { ...answers, [q.key]: value };
    setAnswers(next);

    if (q.key === 'hasShelter' && !value) {
      setShowShelterHelp(true);
      return;
    }
    goNext(next);
  }

  if (showShelterHelp) {
    return (
      <SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}>
        <Card>
          <Text style={styles.question}>Let's find you a bed tonight first.</Text>
          <Body>
            The Columbus Homeless Hotline is open 24/7. Call and they'll help you find a shelter
            bed. You can finish these questions after.
          </Body>
          <Button
            label={`📞 Call ${HOTLINE}`}
            accessibilityLabel={`Call the Homeless Hotline at ${HOTLINE}`}
            onPress={() => Linking.openURL(`tel:${HOTLINE}`)}
          />
          <Button label="See all crisis numbers" variant="secondary" onPress={() => router.push('/help')} />
        </Card>
        <Button
          label="Keep going with the questions"
          variant="secondary"
          onPress={() => {
            setShowShelterHelp(false);
            goNext(answers);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}>
      <View style={styles.top}>
        <Text style={styles.count} accessibilityRole="text">
          Question {index + 1} of {questions.length}
        </Text>
        <QuickExitButton />
      </View>
      <Text style={styles.question} accessibilityRole="header">
        {q.text}
      </Text>
      <Text style={styles.note}>There are no wrong answers. This just helps us build your plan.</Text>

      <View style={styles.buttons}>
        <Button label="Yes" onPress={() => answer(true)} />
        <Button label="No" variant="secondary" onPress={() => answer(false)} />
        <Button label="Not sure" variant="secondary" onPress={() => answer(false)} />
        {index > 0 && <Button label="← Back" variant="secondary" onPress={() => setIndex(index - 1)} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Space.lg,
    justifyContent: 'center',
    gap: Space.md,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  count: { color: Colors.star, fontWeight: '700' },
  question: { color: Colors.text, fontSize: 26, fontWeight: '700', lineHeight: 34 },
  note: { color: Colors.textMuted, fontSize: 15 },
  buttons: { gap: Space.sm, marginTop: Space.lg },
});
