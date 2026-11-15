import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { Body, Button, Screen, Title } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { useProfile } from '@/lib/profile';
import { readRecoveryCode } from '@/lib/recovery';

// Get a saved plan back on a new phone by typing the recovery code from the Home screen.
export default function RestoreScreen() {
  const { restore } = useProfile();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  function submit() {
    const saved = readRecoveryCode(code);
    if (!saved) {
      setError(true);
      return;
    }
    restore(saved);
    router.replace('/');
  }

  return (
    <Screen>
      <Title>Get your plan back</Title>
      <Body muted>Type the code from your old phone's Home screen. It looks like NS1-ABCD.</Body>

      <TextInput
        value={code}
        onChangeText={(t) => {
          setCode(t);
          setError(false);
        }}
        placeholder="NS1-ABCD"
        placeholderTextColor={Colors.textMuted}
        autoCapitalize="characters"
        autoCorrect={false}
        onSubmitEditing={submit}
        style={styles.input}
        accessibilityLabel="Recovery code"
      />
      {error && (
        <Body>That code doesn't look right. Check each letter and number and try again.</Body>
      )}

      <Button label="Restore my plan" onPress={submit} />
      <Button label="Start fresh instead" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.card,
    color: Colors.text,
    borderRadius: 12,
    padding: 14,
    fontSize: 22,
    letterSpacing: 2,
    textAlign: 'center',
  },
});
