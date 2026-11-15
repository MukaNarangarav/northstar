// Small geo helpers for the walk guide.

const R = 6371000; // Earth radius, meters
const rad = (d: number) => (d * Math.PI) / 180;

export function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Compass bearing from point 1 to point 2, in degrees (0 = north, 90 = east).
export function bearingDegrees(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const y = Math.sin(rad(lng2 - lng1)) * Math.cos(rad(lat2));
  const x =
    Math.cos(rad(lat1)) * Math.sin(rad(lat2)) - Math.sin(rad(lat1)) * Math.cos(rad(lat2)) * Math.cos(rad(lng2 - lng1));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function formatDistance(meters: number): { value: string; unit: string } {
  const feet = meters * 3.28084;
  if (feet < 1000) return { value: String(Math.max(10, Math.round(feet / 10) * 10)), unit: 'ft' };
  const miles = meters / 1609.34;
  return { value: miles < 10 ? miles.toFixed(1) : String(Math.round(miles)), unit: 'mi' };
}

// Average walking pace ~3 mph.
export function walkMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / 80));
}
