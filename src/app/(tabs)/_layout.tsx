import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, Text, type ColorValue } from 'react-native';

import { Colors } from '@/constants/colors';
import { useProfile } from '@/lib/profile';

// SF Symbols on iOS, Material Symbols on Android.
const icon =
  (name: SymbolViewProps['name']) =>
  ({ color }: { color: ColorValue }) => (
    <SymbolView name={name} tintColor={color} size={24} fallback={<Text style={{ color }}>●</Text>} />
  );

export default function TabLayout() {
  const { answers } = useProfile();

  // First-time users answer a few questions first.
  if (!answers) return <Redirect href="/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarActiveTintColor: Colors.copperLight,
        tabBarInactiveTintColor: '#6E655D',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Talk', tabBarIcon: icon({ ios: 'waveform', android: 'graphic_eq' }) }} />
      <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: icon({ ios: 'location.fill', android: 'near_me' }) }} />
      <Tabs.Screen name="plan" options={{ title: 'Plan', tabBarIcon: icon({ ios: 'list.bullet', android: 'checklist' }) }} />
      <Tabs.Screen name="help" options={{ title: 'Help', tabBarIcon: icon({ ios: 'phone.fill', android: 'call' }) }} />
    </Tabs>
  );
}
