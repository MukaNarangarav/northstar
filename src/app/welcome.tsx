import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { Colors, Space } from '@/constants/colors';

// The quick tour shown the first time someone opens the app.
const slides = [
  {
    emoji: '⭐',
    title: 'Welcome to NorthStar',
    text: "You're not alone. We'll show you what to do next, one step at a time.",
  },
  {
    emoji: '🗺️',
    title: 'Your personal roadmap',
    text: 'Answer a few questions and we build a plan just for you, from tonight to a place of your own.',
  },
  {
    emoji: '📍',
    title: 'Real help nearby',
    text: 'Every step shows free places near you that can help, plus stories from people who made it.',
  },
  {
    emoji: '🆘',
    title: 'Help any time',
    text: 'Tap the red "Need help right now?" button anytime for crisis lines and a bed tonight.',
  },
];

export default function WelcomeScreen() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.center}>
        <Text style={styles.emoji}>{slide.emoji}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.text}>{slide.text}</Text>
      </View>

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <Button
        label={isLast ? "Let's get started" : 'Next'}
        onPress={() => (isLast ? router.replace('/questionnaire') : setIndex(index + 1))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background, padding: Space.lg, gap: Space.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Space.md },
  emoji: { fontSize: 72 },
  title: { color: Colors.text, fontSize: 28, fontWeight: '700', textAlign: 'center' },
  text: { color: Colors.textMuted, fontSize: 18, lineHeight: 26, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: Space.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.locked },
  dotActive: { backgroundColor: Colors.star, width: 24 },
});
