import { Linking, Text } from 'react-native';

import { Body, Button, Card, QuickExitButton, Screen, styles as ui } from '@/components/ui';

// Crisis and emergency numbers. Keep this list short and easy to tap.
const lines = [
  { label: 'Emergency', detail: 'Police, fire or ambulance', phone: '911' },
  { label: 'Shelter tonight', detail: 'Columbus Homeless Hotline, open 24/7', phone: '614-274-7000' },
  { label: 'Crisis or suicidal thoughts', detail: '988 Suicide & Crisis Lifeline, 24/7', phone: '988' },
  { label: 'Domestic violence', detail: 'LSS CHOICES 24/7 hotline', phone: '614-224-4663' },
  { label: 'Youth (under 18)', detail: 'Huckleberry House 24/7 teen crisis line', phone: '614-294-5553' },
  { label: 'Any other help', detail: 'Food, bills and more', phone: '211' },
];

export default function HelpScreen() {
  return (
    <Screen>
      <Body muted>You're not alone. Tap a number to call.</Body>
      <QuickExitButton />
      {lines.map((l) => (
        <Card key={l.phone}>
          <Text style={ui.cardTitle}>{l.label}</Text>
          <Body muted>{l.detail}</Body>
          <Button
            label={`📞 Call ${l.phone}`}
            accessibilityLabel={`Call ${l.label}, ${l.phone}`}
            onPress={() => Linking.openURL(`tel:${l.phone}`)} />
        </Card>
      ))}
    </Screen>
  );
}
