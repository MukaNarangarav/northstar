import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { Colors } from '@/constants/colors';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.center}>
        <Text style={styles.title}>NorthStar</Text>
        <Text style={styles.text}>
          Talk to us, find help nearby, and get a step-by-step plan to a place of your own.
        </Text>
      </View>
      <Button label="Get started" onPress={() => router.replace('/questionnaire')} />
      <Text style={styles.note}>Free. No account. Your answers stay on this phone.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background, padding: 24, gap: 16 },
  center: { flex: 1, justifyContent: 'center', gap: 12 },
  title: { color: Colors.text, fontSize: 40, fontWeight: '700', letterSpacing: -1 },
  text: { color: Colors.textMuted, fontSize: 19, lineHeight: 27 },
  note: { color: Colors.textMuted, fontSize: 13, textAlign: 'center' },
});
