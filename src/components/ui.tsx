// Small reusable building blocks so every screen looks the same.

import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Space } from '@/constants/colors';
import type { Resource } from '@/lib/types';

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>{children}</ScrollView>
    </SafeAreaView>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Body({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <Text style={[styles.body, muted && { color: Colors.textMuted }]}>{children}</Text>;
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.buttonPrimary : styles.buttonSecondary,
        pressed && { opacity: 0.7 },
      ]}>
      <Text style={[styles.buttonText, primary && { color: Colors.background }]}>{label}</Text>
    </Pressable>
  );
}

// Big red button that's on every main screen.
export function HelpNowButton() {
  return (
    <Link href="/help" asChild>
      <Pressable style={styles.helpNow}>
        <Text style={styles.helpNowText}>🆘 Need help right now?</Text>
      </Pressable>
    </Link>
  );
}

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Card>
      <Text style={styles.small}>{resource.category.toUpperCase()}</Text>
      <Text style={styles.cardTitle}>{resource.name}</Text>
      <Body muted>{resource.description}</Body>
      <View style={styles.row}>
        {resource.phone && (
          <Button
            label={`📞 Call ${resource.phone}`}
            variant="secondary"
            onPress={() => Linking.openURL(`tel:${resource.phone}`)}
          />
        )}
        {resource.url && (
          <Button
            label="🌐 Website"
            variant="secondary"
            onPress={() => Linking.openURL(resource.url!)}
          />
        )}
      </View>
    </Card>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Space.md, gap: Space.md, paddingBottom: Space.xl },
  title: { color: Colors.text, fontSize: 28, fontWeight: '700' },
  body: { color: Colors.text, fontSize: 16, lineHeight: 24 },
  small: { color: Colors.star, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  card: { backgroundColor: Colors.card, borderRadius: 16, padding: Space.md, gap: Space.sm },
  cardTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, marginTop: Space.xs },
  button: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center' },
  buttonPrimary: { backgroundColor: Colors.star },
  buttonSecondary: { backgroundColor: Colors.cardLight },
  buttonText: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  helpNow: {
    backgroundColor: Colors.danger,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  helpNowText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
