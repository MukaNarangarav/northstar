import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { Colors } from '@/constants/colors';
import { useProfile } from '@/lib/profile';

// SF Symbols on iOS, Material Symbols on Android and web.
const icon = (name: SymbolViewProps['name']) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <SymbolView name={name} tintColor={color} size={size} />;
  };

export default function TabLayout() {
  const { answers } = useProfile();

  // First-time users must do the welcome tour + questionnaire.
  if (!answers) return <Redirect href="/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: Colors.card, borderTopColor: Colors.cardLight },
        tabBarActiveTintColor: Colors.star,
        tabBarInactiveTintColor: Colors.textMuted,
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: icon({ ios: 'star.fill', android: 'star', web: 'star' }) }}
      />
      <Tabs.Screen
        name="roadmap"
        options={{ title: 'Roadmap', tabBarIcon: icon({ ios: 'map.fill', android: 'map', web: 'map' }) }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: 'Resources',
          tabBarIcon: icon({ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }),
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{ title: 'Guide', tabBarIcon: icon({ ios: 'safari.fill', android: 'explore', web: 'explore' }) }}
      />
    </Tabs>
  );
}
