// Small reusable building blocks so every screen looks the same.

import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Gradients, Radius, Space } from '@/constants/colors';
import type { Resource } from '@/lib/types';

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.small}>{children}</Text>;
}

export function Body({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <Text style={[styles.body, muted && { color: Colors.textMuted }]}>{children}</Text>;
}

export function Card({
  children,
  style,
  highlight,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  highlight?: boolean;
}) {
  return <View style={[styles.card, highlight && styles.cardHighlight, style]}>{children}</View>;
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
        pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
      ]}>
      <Text style={[styles.buttonText, primary && { color: Colors.onCopper }]}>{label}</Text>
    </Pressable>
  );
}

// Urgent-help button that's on every main screen.
export function HelpNowButton() {
  return (
    <Link href="/help" asChild>
      <Pressable style={({ pressed }) => [styles.helpNow, pressed && { opacity: 0.8 }]}>
        <View style={styles.helpDot} />
        <Text style={styles.helpNowText}>Need help right now?</Text>
        <Text style={styles.helpArrow}>→</Text>
      </Pressable>
    </Link>
  );
}

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Card>
      <Eyebrow>{resource.category.toUpperCase()}</Eyebrow>
      <Text style={styles.cardTitle}>{resource.name}</Text>
      <Body muted>{resource.description}</Body>
      <View style={styles.row}>
        {resource.phone && (
          <Button
            label={`Call ${resource.phone}`}
            variant="secondary"
            onPress={() => Linking.openURL(`tel:${resource.phone}`)}
          />
        )}
        {resource.url && (
          <Button label="Website ↗" variant="secondary" onPress={() => Linking.openURL(resource.url!)} />
        )}
      </View>
    </Card>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background, backgroundImage: Gradients.screenGlow },
  scroll: { padding: Space.md + 4, gap: Space.md, paddingBottom: Space.xl * 2 },
  title: { color: Colors.text, fontSize: 32, fontWeight: '600', letterSpacing: -0.8, marginTop: Space.sm },
  body: { color: Colors.text, fontSize: 16, lineHeight: 24 },
  small: { color: Colors.copperLight, fontSize: 11, fontWeight: '600', letterSpacing: 1.6 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    padding: Space.md + 2,
    gap: Space.sm,
  },
  cardHighlight: {
    backgroundImage: Gradients.copperSoft,
    borderColor: 'rgba(230, 180, 144, 0.28)',
  },
  cardTitle: { color: Colors.text, fontSize: 19, fontWeight: '600', letterSpacing: -0.3 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, marginTop: Space.xs },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundImage: Gradients.copper,
    boxShadow: '0 6px 20px rgba(178, 126, 90, 0.35)',
  },
  buttonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(230, 180, 144, 0.22)',
  },
  buttonText: { color: Colors.text, fontSize: 16, fontWeight: '600', letterSpacing: -0.1 },
  helpNow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(226, 119, 95, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(226, 119, 95, 0.45)',
    borderRadius: Radius.pill,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  helpDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    boxShadow: '0 0 8px rgba(226, 119, 95, 0.9)',
  },
  helpNowText: { flex: 1, color: Colors.text, fontWeight: '600', fontSize: 16 },
  helpArrow: { color: Colors.danger, fontSize: 18, fontWeight: '600' },
});
