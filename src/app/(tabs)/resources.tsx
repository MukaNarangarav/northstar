import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Body, ResourceCard, SafetyBar, Screen, Title } from '@/components/ui';
import { Colors, Space } from '@/constants/colors';
import { resources } from '@/lib/data';

const categories = ['All', ...new Set(resources.map((r) => r.category))];

export default function ResourcesScreen() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const shown = resources.filter(
    (r) =>
      (category === 'All' || r.category === category) &&
      [r.name, r.description, r.address, r.serves].join(' ').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Screen>
      <Title>Resources</Title>
      <Body muted>Free help in Columbus, Ohio.</Body>

      <SafetyBar />

      <TextInput
        placeholder="Search..."
        placeholderTextColor={Colors.textMuted}
        value={search}
        onChangeText={setSearch}
        style={styles.search}
        accessibilityLabel="Search resources"
      />

      <View style={styles.chips}>
        {categories.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            accessibilityRole="button"
            accessibilityState={{ selected: category === c }}
            accessibilityLabel={`Show ${c === 'All' ? 'all resources' : c}`}
            style={[styles.chip, category === c && styles.chipActive]}>
            <Text style={[styles.chipText, category === c && { color: Colors.background }]}>{c}</Text>
          </Pressable>
        ))}
      </View>

      {shown.map((r) => (
        <ResourceCard key={r.id} resource={r} />
      ))}
      {shown.length === 0 && <Body muted>No matches. Try another search.</Body>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: Colors.card,
    color: Colors.text,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  chip: { backgroundColor: Colors.card, minHeight: 40, justifyContent: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  chipActive: { backgroundColor: Colors.star },
  chipText: { color: Colors.text, fontWeight: '600' },
});
