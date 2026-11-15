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
import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Orb } from '@/components/Orb';
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
  idle: 'Ready when you are',
  listening: 'Listening…',
  thinking: 'Thinking…',
  speaking: 'Speaking · tap the orb to cut in',
};

export default function TalkScreen() {
  const { answers, completed } = useProfile();
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const recState = useAudioRecorderState(recorder, 80);
  const player = useAudioPlayer(null);
  const playStatus = useAudioPlayerStatus(player);

  const [mode, setMode] = useState<Mode>('idle');
  const [caption, setCaption] = useState("Hi, I'm NorthStar. Tap Talk and tell me what you need.");
  const history = useRef<Turn[]>([]);
  const timing = useRef({ start: 0, lastLoud: 0, heard: false });
  // Bumped by Stop: any reply still on its way for an older turn is thrown away.
  const turnId = useRef(0);

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
    const myTurn = turnId.current;
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
      if (myTurn !== turnId.current) return; // user pressed Stop while we were thinking
      if (!res.ok || data.error) throw new Error(data.error);

      if (!data.transcript || !data.reply) {
        setCaption("I didn't catch that. Tap and try again.");
        return setMode('idle');
      }

      history.current.push({ role: 'user', content: data.transcript }, { role: 'assistant', content: data.reply });
      setCaption(data.reply);
      await speak(data.reply);
    } catch (e) {
      if (myTurn !== turnId.current) return;
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

  // Stop everything: recording, thinking and speaking. Ends the hands-free loop.
  async function stop() {
    turnId.current += 1;
    player.pause();
    setMode('idle');
    setCaption("Stopped. Tap Talk whenever you're ready.");
    try {
      if (recorder.isRecording) await recorder.stop();
    } catch {}
  }

  function onTap() {
    if (mode === 'idle') startListening();
    else if (mode === 'listening') {
      if (timing.current.heard) finishListening();
      else cancelListening();
    } else if (mode === 'speaking') startListening(); // interrupt
  }

  const active = mode !== 'idle';

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.eyebrow}>NORTHSTAR VOICE</Text>

      <View style={styles.center}>
        <Pressable onPress={onTap} accessibilityRole="button" accessibilityLabel={STATUS[mode]}>
          <Orb size={210} scale={scale} glow={glow} active={active} />
        </Pressable>
      </View>

      <View style={styles.pill}>
        <View style={[styles.pillDot, active && styles.pillDotLive]} />
        <Text style={styles.status}>{STATUS[mode]}</Text>
      </View>
      <Text style={styles.caption} numberOfLines={4}>
        {caption}
      </Text>

      {active ? (
        <Pressable
          onPress={stop}
          accessibilityRole="button"
          style={({ pressed }) => [styles.mainButton, styles.stopButton, pressed && styles.pressed]}>
          <View style={styles.stopIcon} />
          <Text style={[styles.mainButtonText, { color: Colors.text }]}>Stop</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={startListening}
          accessibilityRole="button"
          style={({ pressed }) => [styles.mainButton, pressed && styles.pressed]}>
          <Text style={styles.mainButtonText}>Talk to NorthStar</Text>
        </Pressable>
      )}
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

const styles = StyleSheet.create({
  // Warm, softly blurred brown/olive backdrop.
  screen: {
    flex: 1,
    backgroundColor: '#2B241F',
    backgroundImage:
      'radial-gradient(circle at 20% 15%, rgba(120, 98, 80, 0.55) 0%, transparent 55%), radial-gradient(circle at 85% 70%, rgba(118, 112, 88, 0.45) 0%, transparent 55%), radial-gradient(circle at 50% 42%, rgba(214, 170, 138, 0.25) 0%, transparent 50%), linear-gradient(180deg, #3A3029 0%, #221C18 100%)',
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  eyebrow: { color: 'rgba(245, 230, 216, 0.7)', fontSize: 11, fontWeight: '600', letterSpacing: 2, marginTop: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  pillDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(245,230,216,0.45)' },
  pillDotLive: { backgroundColor: '#F6CDAF', boxShadow: '0 0 8px rgba(246,205,175,0.9)' },
  status: { color: 'rgba(245, 238, 230, 0.85)', fontSize: 14, fontWeight: '500' },
  caption: {
    color: Colors.text,
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    minHeight: 104,
    maxWidth: 340,
  },
  // White rounded button, like the reference.
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minWidth: 240,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
  },
  mainButtonText: { color: '#1A1512', fontSize: 18, fontWeight: '500', letterSpacing: -0.2 },
  stopButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  stopIcon: { width: 12, height: 12, borderRadius: 3, backgroundColor: Colors.danger },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
