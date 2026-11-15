// Downloads real places around Columbus from OpenStreetMap into src/data/places.json.
// Run occasionally to refresh:  node scripts/fetch-places.mjs
// Data © OpenStreetMap contributors, ODbL.
import { writeFileSync } from 'node:fs';

const CENTER = [39.9612, -82.9988]; // downtown Columbus
const RADIUS = 20000; // meters
const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

// Which OSM tags count as which kind of help.
const KINDS = {
  shelter: ['nwr["social_facility"="shelter"]'],
  food: ['nwr["social_facility"~"^(food_bank|soup_kitchen)$"]', 'nwr["amenity"~"^(food_bank|soup_kitchen)$"]'],
  warm: ['nwr["amenity"="library"]', 'nwr["amenity"="community_centre"]'],
  water: ['nwr["amenity"="drinking_water"]'],
  toilets: ['nwr["amenity"="toilets"]'],
  health: ['nwr["amenity"~"^(clinic|hospital|pharmacy)$"]'],
};
const FALLBACK_NAME = {
  shelter: 'Shelter',
  food: 'Food pantry',
  warm: 'Library',
  water: 'Drinking water',
  toilets: 'Public restroom',
  health: 'Clinic',
};

const around = `(around:${RADIUS},${CENTER[0]},${CENTER[1]})`;

async function query(filters) {
  const q = `[out:json][timeout:90];(${filters.map((f) => `${f}${around};`).join('')});out center tags;`;
  for (const url of MIRRORS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'NorthStar/1.0 (demo app)' },
        body: `data=${encodeURIComponent(q)}`,
        signal: AbortSignal.timeout(100000),
      });
      if (res.ok) return (await res.json()).elements;
      console.warn(`${url} -> ${res.status}`);
    } catch (e) {
      console.warn(`${url} -> ${e.message}`);
    }
  }
  throw new Error('All Overpass mirrors failed');
}

const places = [];
for (const [kind, filters] of Object.entries(KINDS)) {
  const elements = await query(filters);
  for (const e of elements) {
    const lat = e.lat ?? e.center?.lat;
    const lng = e.lon ?? e.center?.lon;
    if (lat == null || lng == null) continue;
    const t = e.tags ?? {};
    const street = [t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' ');
    places.push({
      id: `${e.type}/${e.id}`,
      kind,
      name: t.name || FALLBACK_NAME[kind],
      address: street || null,
      phone: t.phone || t['contact:phone'] || null,
      hours: t.opening_hours || null,
      lat: Math.round(lat * 1e6) / 1e6,
      lng: Math.round(lng * 1e6) / 1e6,
    });
  }
  console.log(`${kind}: ${elements.length}`);
  await new Promise((r) => setTimeout(r, 3000)); // be polite to the free servers
}

writeFileSync(new URL('../src/data/places.json', import.meta.url), JSON.stringify(places));
console.log(`Saved ${places.length} places`);
