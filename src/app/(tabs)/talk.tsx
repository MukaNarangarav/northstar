import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { File } from 'expo-file-system';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { apiUrl } from '@/lib/api';
import { useProfile } from '@/lib/profile';
import { buildRoadmap } from '@/lib/roadmap';

type Mode = 'idle' | 'listening' | 'thinking' | 'speaking';
type Turn = { role: 'user' | 'assistant'; content: string };

const SPEECH_DB = -35; // louder than this = someone is talking
const SILENCE_MS = 1100; // pause this long after talking = they're done
const NO_SPEECH_MS = 8000; // give up if nobody talks

const STATUS: Record<Mode, string> = {
  idle: 'Tap to talk',
  listening: 'Listening…',
  thinking: 'Thinking…',
  speaking: 'Tap to interrupt',
};

export default function TalkScreen() {
  const { answers, completed } = useProfile();
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const recState = useAudioRecorderState(recorder, 80);
  const player = useAudioPlayer(null);
  const playStatus = useAudioPlayerStatus(player);

  const [mode, setMode] = useState<Mode>('idle');
  const [caption, setCaption] = useState("Hi, I'm NorthStar. Tap the circle and tell me what you need.");
  const history = useRef<Turn[]>([]);
  const timing = useRef({ start: 0, lastLoud: 0, heard: false });

  // ---------- bubble animation ----------
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.25);

  useEffect(() => {
    cancelAnimation(scale);
    cancelAnimation(glow);
    if (mode === 'idle') {
      scale.value = withRepeat(withSequence(withTiming(1.05, { duration: 1600 }), withTiming(1, { duration: 1600 })), -1);
      glow.value = withTiming(0.25, { duration: 400 });
    } else if (mode === 'thinking') {
      scale.value = withRepeat(withSequence(withTiming(0.9, { duration: 500 }), withTiming(1, { duration: 500 })), -1);
      glow.value = withRepeat(withSequence(withTiming(0.5, { duration: 500 }), withTiming(0.2, { duration: 500 })), -1);
    } else if (mode === 'speaking') {
      // Organic "talking" wobble.
      const id = setInterval(() => {
        scale.value = withTiming(1 + Math.random() * 0.16, { duration: 140, easing: Easing.out(Easing.quad) });
        glow.value = withTiming(0.3 + Math.random() * 0.4, { duration: 140 });
      }, 140);
      return () => clearInterval(id);
    }
  }, [mode, scale, glow]);

  const bubbleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: scale.value * 1.35 }],
  }));

  // ---------- listening: follow the voice + detect when they stop ----------
  useEffect(() => {
    if (mode !== 'listening' || !recState.isRecording) return;
    const db = recState.metering ?? -160;
    const level = Math.min(Math.max((db + 60) / 60, 0), 1);
    scale.value = withTiming(1 + level * 0.45, { duration: 80 });
    glow.value = withTiming(0.2 + level * 0.6, { duration: 80 });

    const now = Date.now();
    const t = timing.current;
    if (db > SPEECH_DB) {
      t.heard = true;
      t.lastLoud = now;
    }
    if (t.heard && now - t.lastLoud > SILENCE_MS) finishListening();
    else if (!t.heard && now - t.start > NO_SPEECH_MS) cancelListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recState.metering, recState.isRecording, mode]);

  // ---------- after speaking, listen again (hands-free conversation) ----------
  useEffect(() => {
    if (mode === 'speaking' && playStatus.didJustFinish) startListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playStatus.didJustFinish]);

  async function startListening() {
    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    if (!granted) {
      setCaption('I need the microphone to hear you. You can turn it on in Settings.');
      setMode('idle');
      return;
    }
    player.pause();
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    timing.current = { start: Date.now(), lastLoud: 0, heard: false };
    setMode('listening');
  }

  async function cancelListening() {
    setMode('idle');
    await recorder.stop();
  }

  async function finishListening() {
    setMode('thinking');
    await recorder.stop();
    const uri = recorder.uri;
    if (!uri) return setMode('idle');

    try {
      // Send the recording as base64 JSON. (Expo's fetch can't upload RN-style { uri } files.)
      const bytes =
        Platform.OS === 'web'
          ? await (await fetch(uri)).arrayBuffer()
          : await new File(uri).arrayBuffer();
      const body = JSON.stringify({
        audio: toBase64(bytes),
        history: history.current,
        context: personalContext(),
      });

      const res = await fetch(apiUrl('/api/talk'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      const data = (await res.json()) as { transcript?: string; reply?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error);

      if (!data.transcript || !data.reply) {
        setCaption("I didn't catch that. Tap and try again.");
        return setMode('idle');
      }

      history.current.push({ role: 'user', content: data.transcript }, { role: 'assistant', content: data.reply });
      setCaption(data.reply);
      await speak(data.reply);
    } catch (e) {
      console.warn('Talk failed:', e);
      setCaption("I couldn't connect. Tap to try again. If it's urgent, call 2 1 1.");
      setMode('idle');
    }
  }

  async function speak(text: string) {
    // Turn recording mode off so iOS plays through the loud speaker, not the earpiece.
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    player.replace({ uri: apiUrl(`/api/speak?text=${encodeURIComponent(text)}`) });
    player.play();
    setMode('speaking');
  }

  function personalContext() {
    if (!answers) return '';
    const items = buildRoadmap(answers, completed);
    const done = items.filter((i) => i.status === 'done').map((i) => i.step.title);
    const next = items.find((i) => i.status === 'next');
    return `About this person: steps already done: ${done.join(', ') || 'none yet'}. Their next step: ${
      next ? `${next.step.title} (${next.step.plainTitle})` : 'all done'
    }.`;
  }

  function onTap() {
    if (mode === 'idle') startListening();
    else if (mode === 'listening') {
      if (timing.current.heard) finishListening();
      else cancelListening();
    } else if (mode === 'speaking') startListening(); // interrupt
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.center}>
        <Pressable onPress={onTap} hitSlop={40} accessibilityRole="button" accessibilityLabel={STATUS[mode]}>
          <View style={styles.bubbleWrap}>
            <Animated.View style={[styles.glow, glowStyle]} />
            <Animated.View style={[styles.bubble, bubbleStyle, mode === 'listening' && styles.bubbleListening]} />
          </View>
        </Pressable>
      </View>

      <Text style={styles.status}>{STATUS[mode]}</Text>
      <Text style={styles.caption} numberOfLines={4}>
        {caption}
      </Text>
    </SafeAreaView>
  );
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x2000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x2000));
  }
  return btoa(binary);
}

const SIZE = 180;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background, padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bubbleWrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: Colors.star },
  bubble: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: Colors.star },
  bubbleListening: { backgroundColor: '#FFD966' },
  status: { color: Colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  caption: { color: Colors.textMuted, fontSize: 16, lineHeight: 23, textAlign: 'center', marginTop: 8, minHeight: 92 },
});
