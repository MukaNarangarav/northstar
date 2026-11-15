// Small reusable building blocks so every screen looks the same.

import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
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
  return (
    <Text style={styles.title} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function Body({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <Text style={[styles.body, muted && { color: Colors.textMuted }]}>{children}</Text>;
}

export function Label({ children }: { children: ReactNode }) {
  return <Text style={styles.small}>{children}</Text>;
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  accessibilityLabel,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  accessibilityLabel?: string;
  accessibilityHint?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        pressed && { opacity: 0.7 },
      ]}>
      <Text style={[styles.buttonText, variant === 'primary' && { color: Colors.background }]}>
        {label}
      </Text>
    </Pressable>
  );
}

// A tap-to-check list. Checked items are saved by the caller (see toggleCheck in profile.tsx).
export function Checklist({
  items,
  checked,
  onToggle,
  numbered,
}: {
  items: string[];
  checked: string[];
  onToggle?: (item: string) => void;
  numbered?: boolean;
}) {
  return (
    <View style={{ gap: Space.sm }}>
      {items.map((item, i) => {
        const isChecked = checked.includes(item);
        const text = numbered ? `${i + 1}. ${item}` : item;
        if (!onToggle) return <Body key={item}>{text}</Body>;
        return (
          <Pressable
            key={item}
            onPress={() => onToggle(item)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isChecked }}
            accessibilityLabel={item}
            style={styles.check}>
            <Text style={styles.box}>{isChecked ? '☑' : '☐'}</Text>
            <Text style={[styles.body, styles.checkText, isChecked && styles.checkedText]}>{text}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Big red button that opens the crisis numbers.
export function HelpNowButton() {
  return (
    <Link href="/help" asChild>
      <Pressable
        style={styles.helpNow}
        accessibilityRole="button"
        accessibilityLabel="Need help right now? Open crisis and shelter phone numbers">
        <Text style={styles.helpNowText}>🆘 Need help right now?</Text>
      </Pressable>
    </Link>
  );
}

// Quickly leaves the app for a harmless web page, for someone who needs to hide what they're
// looking at (for example, around an abuser). On a phone this opens the browser and puts
// NorthStar in the background. It does NOT erase anything or hide the app from the app switcher.
const QUICK_EXIT_URL = 'https://www.google.com/search?q=weather+today';

export function quickExit() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.location.replace(QUICK_EXIT_URL);
  } else {
    Linking.openURL(QUICK_EXIT_URL).catch(() => {});
  }
}

export function QuickExitButton() {
  return (
    <Pressable
      onPress={quickExit}
      style={styles.quickExit}
      accessibilityRole="button"
      accessibilityLabel="Quick exit"
      accessibilityHint="Leaves NorthStar and opens a weather page">
      <Text style={styles.quickExitText}>✕ Exit</Text>
    </Pressable>
  );
}

// Shown at the top of every main tab: crisis help + quick exit, always within reach.
export function SafetyBar() {
  return (
    <View style={styles.safetyBar}>
      <View style={{ flex: 1 }}>
        <HelpNowButton />
      </View>
      <QuickExitButton />
    </View>
  );
}

// Opens the phone's maps app (or Google Maps on the web) with directions to an address.
export function openDirections(address: string) {
  const q = encodeURIComponent(address);
  const url = Platform.select({
    ios: `https://maps.apple.com/?daddr=${q}`,
    android: `geo:0,0?q=${q}`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${q}`,
  });
  Linking.openURL(url).catch(() => {});
}

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Card>
      <Label>{resource.category.toUpperCase()}</Label>
      <Text style={styles.cardTitle}>{resource.name}</Text>
      <Body muted>{resource.description}</Body>

      {(resource.address || resource.hours || resource.serves) && (
        <View style={{ gap: 2 }}>
          {resource.address && <Body>📍 {resource.address}</Body>}
          {resource.hours && <Body>🕒 {resource.hours}</Body>}
          {resource.serves && <Body>👥 {resource.serves}</Body>}
        </View>
      )}

      <View style={styles.row}>
        {resource.phone && (
          <Button
            label={`📞 Call ${resource.phone}`}
            variant="secondary"
            accessibilityLabel={`Call ${resource.name} at ${resource.phone}`}
            onPress={() => Linking.openURL(`tel:${resource.phone}`)}
          />
        )}
        {resource.address && (
          <Button
            label="🧭 Directions"
            variant="secondary"
            accessibilityLabel={`Directions to ${resource.name}`}
            onPress={() => openDirections(resource.address!)}
          />
        )}
        {resource.url && (
          <Button
            label="🌐 Website"
            variant="secondary"
            accessibilityLabel={`Open the ${resource.name} website`}
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
  button: {
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPrimary: { backgroundColor: Colors.star },
  buttonSecondary: { backgroundColor: Colors.cardLight },
  buttonDanger: { backgroundColor: Colors.danger },
  buttonText: { color: Colors.text, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  check: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, minHeight: 44 },
  box: { color: Colors.star, fontSize: 22, lineHeight: 24 },
  checkText: { flex: 1 },
  checkedText: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  safetyBar: { flexDirection: 'row', gap: Space.sm, alignItems: 'stretch' },
  helpNow: {
    backgroundColor: Colors.danger,
    borderRadius: 12,
    padding: 12,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpNowText: { color: '#fff', fontWeight: '700', fontSize: 16, textAlign: 'center' },
  quickExit: {
    backgroundColor: Colors.cardLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickExitText: { color: Colors.text, fontWeight: '700', fontSize: 16 },
});
