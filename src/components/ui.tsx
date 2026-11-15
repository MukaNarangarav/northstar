// Shared building blocks. One visual language: large titles, grouped lists,
// one copper accent for the main action. Nothing decorative.

import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Children, Fragment, type ReactNode } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';

export function Screen({ children, edges = ['top'] }: { children: ReactNode; edges?: ('top' | 'bottom')[] }) {
  return (
    <SafeAreaView style={styles.screen} edges={[...edges, 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function LargeTitle({
  children,
  subtitle,
  exit,
}: {
  children: ReactNode;
  subtitle?: string;
  exit?: boolean; // show the Quick exit button next to the title
}) {
  return (
    <View style={styles.titleBlock}>
      <View style={styles.titleRow}>
        <Text style={[styles.largeTitle, { flex: 1 }]} accessibilityRole="header">
          {children}
        </Text>
        {exit ? <QuickExitButton /> : null}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Body({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <Text style={[styles.body, muted && { color: Colors.textMuted }]}>{children}</Text>;
}

// A titled group of rows with hairline dividers.
export function Section({ title, footer, children }: { title?: string; footer?: string; children: ReactNode }) {
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.group}>
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 && <View style={styles.divider} />}
            {row}
          </Fragment>
        ))}
      </View>
      {footer ? <Text style={styles.sectionFooter}>{footer}</Text> : null}
    </View>
  );
}

export function Row({
  title,
  subtitle,
  value,
  icon,
  tint,
  onPress,
  chevron = !!onPress,
  disabled,
}: {
  title: string;
  subtitle?: string | null;
  value?: string;
  icon?: SymbolViewProps['name'];
  tint?: string;
  onPress?: () => void;
  chevron?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={[title, subtitle, value].filter(Boolean).join(', ')}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: Colors.cardLight }, disabled && { opacity: 0.4 }]}>
      {icon ? (
        <SymbolView name={icon} size={20} tintColor={tint ?? Colors.copperLight} style={styles.rowIcon} fallback={null} />
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.rowTitle, tint ? { color: tint } : null]}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {chevron ? <Text style={styles.chevron}>›</Text> : null}
    </Pressable>
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
      hitSlop={10}
      style={({ pressed }) => [styles.exit, pressed && { opacity: 0.6 }]}
      accessibilityRole="button"
      accessibilityLabel="Quick exit"
      accessibilityHint="Leaves NorthStar and opens a weather page">
      <Text style={styles.exitText}>Exit</Text>
    </Pressable>
  );
}

// Opens the phone's maps app with walking directions to an address.
export function openDirections(address: string) {
  const q = encodeURIComponent(address);
  const url = Platform.select({
    ios: `https://maps.apple.com/?daddr=${q}&dirflg=w`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=walking`,
  });
  Linking.openURL(url).catch(() => {});
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
  variant?: 'primary' | 'secondary' | 'plain' | 'danger';
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
      <Text
        style={[
          styles.buttonText,
          variant === 'primary' && { color: Colors.onCopper },
          variant === 'plain' && { color: Colors.copperLight, fontWeight: '500' },
          variant === 'danger' && { color: '#fff' },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 48, gap: 28 },
  titleBlock: { gap: 6, marginTop: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  exit: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  exitText: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  largeTitle: { color: Colors.text, fontSize: 34, fontWeight: '700', letterSpacing: -0.8 },
  subtitle: { color: Colors.textMuted, fontSize: 17, lineHeight: 23 },
  body: { color: Colors.text, fontSize: 17, lineHeight: 25 },
  section: { gap: 8 },
  sectionTitle: { color: Colors.textMuted, fontSize: 13, fontWeight: '500', marginLeft: 16 },
  sectionFooter: { color: Colors.textMuted, fontSize: 13, lineHeight: 18, marginHorizontal: 16 },
  group: { backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.08)', marginLeft: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, minHeight: 52 },
  rowIcon: { width: 24, height: 24 },
  rowTitle: { color: Colors.text, fontSize: 17 },
  rowSubtitle: { color: Colors.textMuted, fontSize: 14, lineHeight: 19 },
  rowValue: { color: Colors.textMuted, fontSize: 17 },
  chevron: { color: '#5E5650', fontSize: 24, fontWeight: '300', marginTop: -2 },
  button: { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  buttonPrimary: { backgroundColor: Colors.copperLight },
  buttonSecondary: { backgroundColor: Colors.card },
  buttonDanger: { backgroundColor: Colors.danger },
  buttonText: { color: Colors.text, fontSize: 17, fontWeight: '600' },
});
