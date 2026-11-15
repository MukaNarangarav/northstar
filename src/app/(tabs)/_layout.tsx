import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { Text } from 'react-native';

import { Colors } from '@/constants/colors';
import { useProfile } from '@/lib/profile';

const icon = (emoji: string) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

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
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('⭐') }} />
      <Tabs.Screen name="roadmap" options={{ title: 'Roadmap', tabBarIcon: icon('🗺️') }} />
      <Tabs.Screen name="resources" options={{ title: 'Resources', tabBarIcon: icon('📍') }} />
      <Tabs.Screen name="guide" options={{ title: 'Guide', tabBarIcon: icon('🧭') }} />
    </Tabs>
  );
}
