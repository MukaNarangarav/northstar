// A pearly copper sphere with light swirling inside it, like liquid metal.
// The swirls are soft gradient blobs and thin light "caustic" rings that slowly
// rotate at different speeds inside a clipped circle. They speed up while active.
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  size: number;
  scale: SharedValue<number>; // overall pulse (voice level, breathing…)
  glow: SharedValue<number>; // halo brightness 0..1
  active: boolean; // swirl faster while listening/thinking/speaking
};

function useSpin(durationMs: number, reverse = false) {
  const turn = useSharedValue(0);
  useEffect(() => {
    // Restart from the current angle so changing speed never jumps.
    const from = turn.value % 360;
    turn.value = from;
    turn.value = withRepeat(
      withTiming(from + (reverse ? -360 : 360), { duration: durationMs, easing: Easing.linear }),
      -1,
    );
  }, [durationMs, reverse, turn]);
  return useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value}deg` }] }));
}

export function Orb({ size, scale, glow, active }: Props) {
  const k = active ? 0.35 : 1; // lower = faster
  const spinA = useSpin(14000 * k);
  const spinB = useSpin(9000 * k, true);
  const spinC = useSpin(20000 * k);
  const spinD = useSpin(6500 * k, true);

  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 0.9 + scale.value * 0.25 }],
  }));

  const layer = { width: size * 1.3, height: size * 1.3, left: -size * 0.15, top: -size * 0.15 };

  return (
    <View style={{ width: size * 1.7, height: size * 1.7, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          styles.halo,
          { width: size, height: size, borderRadius: size / 2, boxShadow: `0 0 ${size * 0.45}px ${size * 0.12}px rgba(246, 205, 175, 0.55)` },
          haloStyle,
        ]}
      />

      <Animated.View style={[styles.orb, { width: size, height: size, borderRadius: size / 2 }, orbStyle]}>
        {/* soft darker currents */}
        <Animated.View style={[styles.layer, layer, spinC]}>
          <View style={[styles.blob, { width: size * 0.9, height: size * 0.55, left: size * 0.35, top: size * 0.62, backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(150, 92, 60, 0.45) 0%, transparent 70%)' }]} />
          <View style={[styles.blob, { width: size * 0.6, height: size * 0.6, left: size * 0.05, top: size * 0.2, backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(160, 104, 72, 0.35) 0%, transparent 70%)' }]} />
        </Animated.View>

        {/* bright swirling light */}
        <Animated.View style={[styles.layer, layer, spinA]}>
          <View style={[styles.blob, { width: size * 0.75, height: size * 0.45, left: size * 0.12, top: size * 0.18, backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(255, 244, 234, 0.75) 0%, transparent 70%)' }]} />
          <View style={[styles.blob, { width: size * 0.5, height: size * 0.35, left: size * 0.7, top: size * 0.75, backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(255, 236, 220, 0.5) 0%, transparent 70%)' }]} />
        </Animated.View>

        {/* thin caustic light lines */}
        <Animated.View style={[styles.layer, layer, spinB]}>
          <View style={[styles.ring, { width: size * 0.8, height: size * 0.34, left: size * 0.3, top: size * 0.45, borderRadius: size, transform: [{ rotate: '28deg' }] }]} />
          <View style={[styles.ring, { width: size * 0.5, height: size * 0.22, left: size * 0.18, top: size * 0.7, borderRadius: size, transform: [{ rotate: '-18deg' }] }]} />
        </Animated.View>
        <Animated.View style={[styles.layer, layer, spinD]}>
          <View style={[styles.ring, { width: size * 0.62, height: size * 0.26, left: size * 0.45, top: size * 0.3, borderRadius: size, opacity: 0.7, transform: [{ rotate: '-35deg' }] }]} />
        </Animated.View>

        {/* static lighting so it reads as a sphere: highlight + darker rim */}
        <View style={[StyleSheet.absoluteFill, styles.shade, { borderRadius: size / 2 }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: { position: 'absolute', backgroundColor: 'rgba(246, 205, 175, 0.25)' },
  orb: {
    overflow: 'hidden',
    backgroundImage:
      'radial-gradient(circle at 35% 30%, #FBE6D6 0%, #EFC7AA 30%, #DDA987 58%, #C08A68 82%, #9C6A4C 100%)',
    boxShadow: '0 24px 60px rgba(40, 24, 14, 0.45)',
  },
  layer: { position: 'absolute' },
  blob: { position: 'absolute', borderRadius: 999 },
  ring: { position: 'absolute', borderWidth: 1.5, borderColor: 'rgba(255, 240, 228, 0.55)' },
  shade: {
    backgroundImage:
      'radial-gradient(circle at 32% 26%, rgba(255,250,245,0.45) 0%, rgba(255,250,245,0) 32%), radial-gradient(circle at 50% 50%, transparent 58%, rgba(110, 66, 42, 0.35) 100%)',
  },
});
