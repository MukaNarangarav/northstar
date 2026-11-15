// GET /api/places?lat=..&lng=..&kind=shelter
// Returns the nearest real places of one kind. Data comes from OpenStreetMap,
// downloaded ahead of time by scripts/fetch-places.mjs (the free live servers are
// often overloaded), so this is instant and works offline from those servers.
// Data © OpenStreetMap contributors, ODbL.
import allPlaces from '@/data/places.json';
import { distanceMeters } from '@/lib/geo';

type Place = {
  id: string;
  kind: string;
  name: string;
  address: string | null;
  phone: string | null;
  hours: string | null;
  lat: number;
  lng: number;
};

const KINDS = new Set(['shelter', 'food', 'warm', 'water', 'toilets', 'health']);

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const lat = Number(params.get('lat'));
  const lng = Number(params.get('lng'));
  const kind = params.get('kind') ?? '';
  if (!KINDS.has(kind) || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json({ error: 'Bad request' }, { status: 400 });
  }

  const places = (allPlaces as Place[])
    .filter((p) => p.kind === kind)
    .map((p) => ({ ...p, distance: distanceMeters(lat, lng, p.lat, p.lng) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 25);

  return Response.json({ places });
}
