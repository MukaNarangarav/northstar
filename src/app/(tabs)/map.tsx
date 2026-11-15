import * as Location from 'expo-location';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { QuickExitButton } from '@/components/ui';
import { apiUrl } from '@/lib/api';
import { bearingDegrees, distanceMeters, formatDistance, walkMinutes } from '@/lib/geo';

type Kind = 'shelter' | 'food' | 'warm' | 'water' | 'toilets' | 'health';
type Place = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  hours: string | null;
  lat: number;
  lng: number;
};
type Coords = { latitude: number; longitude: number };

const KINDS: { kind: Kind; label: string }[] = [
  { kind: 'shelter', label: 'Shelter' },
  { kind: 'food', label: 'Food' },
  { kind: 'warm', label: 'Warm place' },
  { kind: 'water', label: 'Water' },
  { kind: 'toilets', label: 'Restroom' },
  { kind: 'health', label: 'Health' },
];

const ARRIVED_METERS = 25;

export default function MapScreen() {
  const [permission, setPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [me, setMe] = useState<Coords | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [kind, setKind] = useState<Kind>('shelter');
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const map = useRef<MapView>(null);
  const [retry, setRetry] = useState(0);
  const searchId = useRef(0);
  const lastSearch = useRef<{ at: Coords; kind: Kind; retry: number } | null>(null);

  // ---- location + compass ----
  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ granted }) => setPermission(granted ? 'granted' : 'denied'));
  }, []);

  useEffect(() => {
    if (permission !== 'granted') return;
    const subs: Location.LocationSubscription[] = [];
    Location.watchPositionAsync({ accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 3 }, (loc) =>
      setMe({ latitude: loc.coords.latitude, longitude: loc.coords.longitude }),
    ).then((s) => subs.push(s));
    if (Platform.OS !== 'web') {
      Location.watchHeadingAsync((h) => setHeading(h.trueHeading >= 0 ? h.trueHeading : h.magHeading)).then((s) =>
        subs.push(s),
      );
    }
    return () => subs.forEach((s) => s.remove());
  }, [permission]);

  // ---- search nearby (on kind change, or after moving ~500 m) ----
  useEffect(() => {
    if (!me) return;
    const last = lastSearch.current;
    if (
      last &&
      last.kind === kind &&
      last.retry === retry &&
      distanceMeters(last.at.latitude, last.at.longitude, me.latitude, me.longitude) < 500
    )
      return;
    lastSearch.current = { at: me, kind, retry };

    // Only the newest search may update the screen. (No effect cleanup here: location
    // updates every few meters and must not cancel a search that's still loading.)
    const id = ++searchId.current;
    setStatus('loading');
    fetch(apiUrl(`/api/places?lat=${me.latitude}&lng=${me.longitude}&kind=${kind}`))
      .then((r) => r.json())
      .then((data: { places?: Place[]; error?: string }) => {
        if (id !== searchId.current) return;
        if (!data.places) throw new Error(data.error);
        setPlaces(data.places);
        setSelectedId(data.places[0]?.id ?? null);
        setStatus('idle');
      })
      .catch(() => id === searchId.current && setStatus('error'));
  }, [me, kind, retry]);

  const selected = places.find((p) => p.id === selectedId) ?? null;

  // Frame both you and the destination on the map.
  useEffect(() => {
    if (!me || !selected) return;
    map.current?.fitToCoordinates([me, { latitude: selected.lat, longitude: selected.lng }], {
      edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
      animated: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, me === null]);

  // ---- arrow ----
  const distance = me && selected ? distanceMeters(me.latitude, me.longitude, selected.lat, selected.lng) : null;
  const bearing = me && selected ? bearingDegrees(me.latitude, me.longitude, selected.lat, selected.lng) : 0;
  const target = bearing - (heading ?? 0);

  const angle = useSharedValue(0);
  useEffect(() => {
    // Turn the short way round (e.g. 350° → 10° is +20°, not -340°).
    const current = angle.value;
    const delta = ((((target - current) % 360) + 540) % 360) - 180;
    angle.value = withTiming(current + delta, { duration: 250 });
  }, [target, angle]);
  const arrowStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.value}deg` }] }));

  function openDirections() {
    if (!selected) return;
    const { lat, lng } = selected;
    const url =
      Platform.OS === 'ios'
        ? `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=w`
        : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    Linking.openURL(url);
  }

  function nextPlace() {
    if (!places.length) return;
    const i = places.findIndex((p) => p.id === selectedId);
    setSelectedId(places[(i + 1) % places.length].id);
  }

  // ---- render ----
  if (permission === 'denied') {
    return (
      <SafeAreaView style={[styles.screen, styles.centered]}>
        <Text style={styles.title}>Location is off</Text>
        <Text style={styles.muted}>NorthStar needs your location to point you to nearby help.</Text>
        <Pressable style={styles.primary} onPress={() => Linking.openSettings()}>
          <Text style={styles.primaryText}>Open Settings</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const d = distance != null ? formatDistance(distance) : null;
  const arrived = distance != null && distance < ARRIVED_METERS;

  return (
    <View style={styles.screen}>
      {/* Top half: map */}
      <View style={styles.mapWrap}>
        <MapView
          ref={map}
          style={StyleSheet.absoluteFill}
          userInterfaceStyle="dark"
          showsUserLocation
          showsCompass={false}
          showsPointsOfInterests={false}
          initialRegion={{ latitude: 39.9612, longitude: -82.9988, latitudeDelta: 0.08, longitudeDelta: 0.08 }}>
          {places.map((p) => (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.lat, longitude: p.lng }}
              onPress={() => setSelectedId(p.id)}
              tracksViewChanges={false}>
              <View style={[styles.pin, p.id === selectedId && styles.pinSelected]} />
            </Marker>
          ))}
        </MapView>

        <SafeAreaView edges={['top']} style={styles.chipsBar}>
          <View style={styles.exitRow}>
            <QuickExitButton />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {KINDS.map((k) => (
              <Pressable key={k.kind} onPress={() => setKind(k.kind)} style={[styles.chip, kind === k.kind && styles.chipOn]}>
                <Text style={[styles.chipText, kind === k.kind && styles.chipTextOn]}>{k.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>

      {/* Bottom half: Find My-style guide */}
      <View style={styles.guide}>
        {!me || status === 'loading' ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.copperLight} />
            <Text style={styles.muted}>{me ? 'Finding places near you…' : 'Finding your location…'}</Text>
          </View>
        ) : status === 'error' ? (
          <View style={styles.centered}>
            <Text style={styles.muted}>Couldn't load places. Check your connection.</Text>
            <Pressable onPress={() => setRetry((n) => n + 1)} style={styles.secondary}>
              <Text style={styles.secondaryText}>Try again</Text>
            </Pressable>
          </View>
        ) : !selected ? (
          <View style={styles.centered}>
            <Text style={styles.muted}>Nothing found nearby. Call 211 and a person will help you find one.</Text>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.name} numberOfLines={1}>
                {selected.name}
              </Text>
              <Text style={styles.muted} numberOfLines={1}>
                {[selected.address, selected.hours].filter(Boolean).join(' · ') || 'Tap Directions for the full route'}
              </Text>
            </View>

            <View style={styles.arrowArea}>
              {arrived ? (
                <Text style={styles.arrived}>You're here</Text>
              ) : (
                <Animated.View style={arrowStyle}>
                  <SymbolView
                    name={{ ios: 'location.north.fill', android: 'navigation' }}
                    size={150}
                    tintColor={Colors.copperLight}
                    fallback={<Text style={styles.fallbackArrow}>↑</Text>}
                  />
                </Animated.View>
              )}
            </View>

            {d && !arrived && (
              <View style={styles.distanceRow}>
                <Text style={styles.distance}>{d.value}</Text>
                <Text style={styles.unit}>{d.unit}</Text>
                <Text style={styles.walk}>  ·  {walkMinutes(distance!)} min walk</Text>
              </View>
            )}
            {heading == null && <Text style={styles.hint}>Compass unavailable. Arrow points relative to north.</Text>}

            <View style={styles.actions}>
              <Pressable style={[styles.primary, { flex: 1 }]} onPress={openDirections}>
                <Text style={styles.primaryText}>Directions</Text>
              </Pressable>
              {selected.phone && (
                <Pressable style={styles.secondary} onPress={() => Linking.openURL(`tel:${selected.phone}`)}>
                  <Text style={styles.secondaryText}>Call</Text>
                </Pressable>
              )}
              {places.length > 1 && (
                <Pressable style={styles.secondary} onPress={nextPlace}>
                  <Text style={styles.secondaryText}>Next</Text>
                </Pressable>
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  mapWrap: { flex: 1 },
  chipsBar: { position: 'absolute', left: 0, right: 0, top: 0 },
  chips: { gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  exitRow: { alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 4 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(19, 17, 15, 0.85)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  chipOn: { backgroundColor: Colors.copperLight, borderColor: Colors.copperLight },
  chipText: { color: Colors.text, fontSize: 14, fontWeight: '500' },
  chipTextOn: { color: Colors.onCopper },
  pin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#8C8178',
    borderWidth: 2,
    borderColor: '#13110F',
  },
  pinSelected: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.copperLight },
  guide: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    backgroundColor: Colors.background,
  },
  header: { gap: 4 },
  name: { color: Colors.text, fontSize: 24, fontWeight: '600', letterSpacing: -0.4 },
  title: { color: Colors.text, fontSize: 24, fontWeight: '600' },
  muted: { color: Colors.textMuted, fontSize: 15, textAlign: 'center' },
  arrowArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fallbackArrow: { color: Colors.copperLight, fontSize: 120, fontWeight: '300' },
  arrived: { color: Colors.copperLight, fontSize: 32, fontWeight: '600' },
  distanceRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' },
  distance: { color: Colors.text, fontSize: 48, fontWeight: '600', letterSpacing: -1.5 },
  unit: { color: Colors.text, fontSize: 22, fontWeight: '500', marginLeft: 6 },
  walk: { color: Colors.textMuted, fontSize: 17 },
  hint: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  primary: {
    backgroundColor: Colors.copperLight,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  primaryText: { color: Colors.onCopper, fontSize: 17, fontWeight: '600' },
  secondary: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  secondaryText: { color: Colors.text, fontSize: 17, fontWeight: '500' },
});
