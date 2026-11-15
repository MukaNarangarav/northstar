import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Native apps need a full URL to reach our API routes.
// In dev that's the Metro server; in production it's the `origin` set in app.json.
export function apiUrl(path: string): string {
  if (Platform.OS === 'web') return path;
  const host = Constants.expoConfig?.hostUri;
  if (host) return `http://${host}${path}`;
  const origin = (Constants.expoConfig?.extra as { router?: { origin?: string } } | undefined)?.router
    ?.origin;
  return `${(origin ?? '').replace(/\/$/, '')}${path}`;
}
