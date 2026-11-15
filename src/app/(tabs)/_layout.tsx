import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, Text, type ColorValue } from 'react-native';

import { Colors } from '@/constants/colors';
import { useProfile } from '@/lib/profile';

// SF Symbols on iOS, Material Symbols on Android, a plain dot elsewhere.
const icon =
  (name: SymbolViewProps['name']) =>
  ({ color }: { color: ColorValue }) => (
    <SymbolView name={name} tintColor={color} size={22} fallback={<Text style={{ color }}>●</Text>} />
  );

export default function TabLayout() {
  const { answers } = useProfile();

  // First-time users must do the welcome tour + questionnaire.
  if (!answers) return <Redirect href="/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#100E0C',
          borderTopColor: Colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarActiveTintColor: Colors.copperLight,
        tabBarInactiveTintColor: '#6E655D',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon({ ios: 'house.fill', android: 'home' }) }} />
      <Tabs.Screen name="talk" options={{ title: 'Talk', tabBarIcon: icon({ ios: 'waveform', android: 'graphic_eq' }) }} />
      <Tabs.Screen name="roadmap" options={{ title: 'Roadmap', tabBarIcon: icon({ ios: 'map.fill', android: 'map' }) }} />
      <Tabs.Screen
        name="resources"
        options={{ title: 'Resources', tabBarIcon: icon({ ios: 'mappin.and.ellipse', android: 'location_on' }) }}
      />
      <Tabs.Screen
        name="stories"
        options={{ title: 'Stories', tabBarIcon: icon({ ios: 'quote.bubble.fill', android: 'format_quote' }) }}
      />
      <Tabs.Screen name="guide" options={{ title: 'Guide', tabBarIcon: icon({ ios: 'safari.fill', android: 'explore' }) }} />
    </Tabs>
  );
}
