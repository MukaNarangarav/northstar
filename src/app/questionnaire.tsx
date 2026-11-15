import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, QuickExitButton } from '@/components/ui';
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
    // Done! Save and go to the app.
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
        <View style={{ gap: 12 }}>
          <Text style={styles.question}>Let's find you a bed tonight first.</Text>
          <Body muted>
            The Columbus Homeless Hotline is open 24/7. Call and they'll help you find a shelter bed. You can
            finish these questions after.
          </Body>
        </View>
        <View style={styles.buttons}>
          <Button
            label={`Call ${HOTLINE}`}
            accessibilityLabel={`Call the Homeless Hotline at ${HOTLINE}`}
            onPress={() => Linking.openURL(`tel:${HOTLINE}`)}
          />
          <Button
            label="Keep going with the questions"
            variant="secondary"
            onPress={() => {
              setShowShelterHelp(false);
              goNext(answers);
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}>
      <View style={styles.top}>
        <Text style={styles.count}>
          {index + 1} of {questions.length}
        </Text>
        <QuickExitButton />
      </View>

      <View style={{ gap: 12 }}>
        <Text style={styles.question} accessibilityRole="header">
          {q.text}
        </Text>
        <Text style={styles.note}>There are no wrong answers. This just helps us build your plan.</Text>
      </View>

      <View style={styles.buttons}>
        <Button label="Yes" onPress={() => answer(true)} />
        <Button label="No" variant="secondary" onPress={() => answer(false)} />
        <Button label="Not sure" variant="secondary" onPress={() => answer(false)} />
        {index > 0 && <Button label="Back" variant="plain" onPress={() => setIndex(index - 1)} />}
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
    gap: Space.xl,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  count: { color: Colors.textMuted, fontWeight: '500', fontSize: 15 },
  question: { color: Colors.text, fontSize: 28, fontWeight: '600', letterSpacing: -0.6, lineHeight: 36 },
  note: { color: Colors.textMuted, fontSize: 16 },
  buttons: { gap: Space.sm },
});
