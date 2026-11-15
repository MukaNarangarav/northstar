import { Linking } from 'react-native';

import { LargeTitle, Row, Screen, Section, openDirections } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { resources } from '@/lib/data';

// Crisis and emergency numbers. Keep this list short and easy to tap.
const CRISIS = [
  { label: 'Emergency', detail: 'Police, fire or ambulance', phone: '911' },
  { label: 'Shelter tonight', detail: 'Columbus Homeless Hotline · 24/7', phone: '614-274-7000' },
  { label: 'Crisis or suicidal thoughts', detail: '988 Lifeline · 24/7', phone: '988' },
  { label: 'Domestic violence', detail: 'LSS CHOICES · 24/7', phone: '614-224-4663' },
  { label: 'Under 18', detail: 'Huckleberry House · 24/7', phone: '614-294-5553' },
  { label: 'Anything else', detail: 'Food, bills and more', phone: '211' },
];

const call = (phone: string) => Linking.openURL(`tel:${phone}`);
const categories = [...new Set(resources.map((r) => r.category))];

export default function HelpScreen() {
  return (
    <Screen>
      <LargeTitle subtitle="Tap to call. All free." exit>
        Help
      </LargeTitle>

      <Section title="Call now">
        {CRISIS.map((c) => (
          <Row
            key={c.phone}
            title={c.label}
            subtitle={c.detail}
            value={c.phone}
            icon={{ ios: 'phone.fill', android: 'call' }}
            tint={c.phone === '911' ? Colors.danger : undefined}
            onPress={() => call(c.phone)}
            chevron={false}
          />
        ))}
      </Section>

      {categories.map((cat) => (
        <Section key={cat} title={cat}>
          {resources
            .filter((r) => r.category === cat)
            .map((r) => (
              <Row
                key={r.id}
                title={r.name}
                subtitle={[r.description, r.address, r.hours, r.serves].filter(Boolean).join(' · ')}
                value={r.phone ? 'Call' : r.address ? 'Directions' : r.url ? 'Website' : undefined}
                onPress={
                  r.phone
                    ? () => call(r.phone!)
                    : r.address
                      ? () => openDirections(r.address!)
                      : r.url
                        ? () => Linking.openURL(r.url!)
                        : undefined
                }
                chevron={false}
              />
            ))}
        </Section>
      ))}
    </Screen>
  );
}
