import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { Colors, Space } from '@/constants/colors';
import { useProfile } from '@/lib/profile';
import type { AnswerKey, Answers } from '@/lib/types';

// One yes/no question per thing the roadmap needs to know.
// To add a question: add it here, add its key to AnswerKey in types.ts,
// and use it as "skipIf" on a step in steps.json.
const questions: { key: AnswerKey; text: string }[] = [
  { key: 'hasShelter', text: 'Do you have a safe place to sleep tonight?' },
  { key: 'hasAddress', text: 'Do you have an address where you can get mail?' },
  { key: 'hasId', text: 'Do you have a photo ID (like a state ID or license)?' },
  { key: 'hasPhone', text: 'Do you have a working phone?' },
  { key: 'hasBenefits', text: 'Are you getting food or health benefits (SNAP or Medicaid)?' },
  { key: 'hasJob', text: 'Do you have a job right now?' },
];

export default function QuestionnaireScreen() {
  const { saveAnswers } = useProfile();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});

  const q = questions[index];

  function answer(value: boolean) {
    const next = { ...answers, [q.key]: value };
    setAnswers(next);

    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else {
      // Done! Save and go to the home screen.
      saveAnswers(next as Answers);
      router.replace('/');
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.count}>
        Question {index + 1} of {questions.length}
      </Text>
      <Text style={styles.question}>{q.text}</Text>
      <Text style={styles.note}>There are no wrong answers. This just helps us build your plan.</Text>

      <View style={styles.buttons}>
        <Button label="Yes" onPress={() => answer(true)} />
        <Button label="No" variant="secondary" onPress={() => answer(false)} />
        {index > 0 && <Button label="← Back" variant="secondary" onPress={() => setIndex(index - 1)} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background, padding: Space.lg, justifyContent: 'center', gap: Space.md },
  count: { color: Colors.star, fontWeight: '700' },
  question: { color: Colors.text, fontSize: 26, fontWeight: '700', lineHeight: 34 },
  note: { color: Colors.textMuted, fontSize: 15 },
  buttons: { gap: Space.sm, marginTop: Space.lg },
});
