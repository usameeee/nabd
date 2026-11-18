import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { darkColors, fontFamily, fontSize, radius, spacing } from '@nabd/shared';

/** Sample window before the read-out refreshes (ms). Half a second is steady enough to read. */
const WINDOW_MS = 500;

/**
 * Dev-only frame-rate read-out (T-051). It samples `requestAnimationFrame` cadence — a proxy for how
 * fast the JS/render thread is delivering frames — so a real-device pass can see whether the viewer
 * keeps up on a low/mid Android phone. The call site gates it behind `__DEV__`, so it never ships;
 * the label is a literal because it is developer tooling, not user-facing copy (docs/01 i18n rule).
 */
export function PerfHud() {
  const [fps, setFps] = useState(0);
  const frames = useRef(0);
  const windowStart = useRef(0);

  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      if (windowStart.current === 0) windowStart.current = now;
      frames.current += 1;
      const elapsed = now - windowStart.current;
      if (elapsed >= WINDOW_MS) {
        setFps(Math.round((frames.current * 1000) / elapsed));
        frames.current = 0;
        windowStart.current = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <View pointerEvents="none" style={styles.hud}>
      <Text style={styles.text}>{`${fps} FPS`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: darkColors.surface,
  },
  text: {
    fontSize: fontSize.caption,
    fontFamily: fontFamily.latinBody,
    color: darkColors.reward,
  },
});
