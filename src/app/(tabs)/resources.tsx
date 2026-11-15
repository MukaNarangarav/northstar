import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Body, ResourceCard, Screen, Title } from '@/components/ui';
import { Colors, Space } from '@/constants/colors';
import { resources } from '@/lib/data';

const categories = ['All', ...new Set(resources.map((r) => r.category))];

export default function ResourcesScreen() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const shown = resources.filter(
    (r) =>
      (category === 'All' || r.category === category) &&
      (r.name + r.description).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Screen>
      <Title>Resources</Title>
      <Body muted>Free help in Columbus, Ohio.</Body>

      <TextInput
        placeholder="Search..."
        placeholderTextColor={Colors.textMuted}
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      <View style={styles.chips}>
        {categories.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            style={[styles.chip, category === c && styles.chipActive]}>
            <Text style={[styles.chipText, category === c && { color: Colors.onCopper }]}>{c}</Text>
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
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 999,
    paddingHorizontal: 18,
    padding: 12,
    fontSize: 16,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  chipActive: { backgroundImage: 'linear-gradient(135deg, #E6B490 0%, #B27E5A 100%)', borderColor: 'transparent' },
  chipText: { color: Colors.text, fontWeight: '600' },
});
