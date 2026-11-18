import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ActivityIndicator, PanResponder, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';
import { darkColors, fontFamily, fontSize, radius, spacing } from '@nabd/shared';
import { HeartModel } from './HeartModel';
import { useTheme } from '../theme/ThemeProvider';

/** Camera rig state. Only mutated through a ref so gestures never re-render React. */
interface Motion {
  rotX: number;
  targetRotX: number;
  rotY: number;
  targetRotY: number;
  dist: number;
  targetDist: number;
}

interface MotionRef {
  current: Motion;
}

interface TouchPoint {
  pageX: number;
  pageY: number;
}

const START_DIST = 3.2;
const ZOOM_MIN = 2;
const ZOOM_MAX = 7;
const PITCH_LIMIT = Math.PI / 3;
const ROTATE_SPEED = 0.01;
// Frame-rate independent easing: fraction of the remaining gap closed per rendered frame.
const SMOOTHING = 0.16;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function touchDistance(touches: readonly TouchPoint[]): number {
  const a = touches[0];
  const b = touches[1];
  if (!a || !b) return 0;
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
}

// Turntable rig: an outer yaw group, an inner pitch group, camera on the +Z axis.
// Reading the ref inside useFrame keeps the gesture on the JS thread out of React's render path.
function Rig({ motion, children }: { motion: MotionRef; children: ReactNode }) {
  const yaw = useRef<THREE.Group>(null);
  const pitch = useRef<THREE.Group>(null);
  const camera = useThree((state) => state.camera);

  useFrame(() => {
    const m = motion.current;
    m.rotX += (m.targetRotX - m.rotX) * SMOOTHING;
    m.rotY += (m.targetRotY - m.rotY) * SMOOTHING;
    m.dist += (m.targetDist - m.dist) * SMOOTHING;

    if (yaw.current) yaw.current.rotation.y = m.rotY;
    if (pitch.current) pitch.current.rotation.x = m.rotX;

    camera.position.set(0, 0, m.dist);
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={yaw}>
      <group ref={pitch}>{children}</group>
    </group>
  );
}

// Mounts only after the model finishes loading, so the stage can hide its spinner.
function Ready({ onReady }: { onReady: () => void }) {
  useEffect(() => onReady(), [onReady]);
  return null;
}

export function ViewerStage() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);

  const motion = useRef<Motion>({
    rotX: 0,
    targetRotX: 0,
    rotY: 0,
    targetRotY: 0,
    dist: START_DIST,
    targetDist: START_DIST,
  });
  const last = useRef({ x: 0, y: 0, pinch: 0, count: 0 });

  // One-finger drag orbits, two-finger pinch zooms. The responder captures from the parent
  // so the Canvas never claims the gesture.
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: (event) => {
          const touches = event.nativeEvent.touches;
          last.current = {
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
            pinch: touches.length >= 2 ? touchDistance(touches) : 0,
            count: touches.length,
          };
        },
        onPanResponderMove: (event) => {
          const touches = event.nativeEvent.touches;
          const m = motion.current;

          if (touches.length >= 2) {
            const gap = touchDistance(touches);
            if (last.current.pinch > 0 && gap > 0) {
              m.targetDist = clamp(m.targetDist * (last.current.pinch / gap), ZOOM_MIN, ZOOM_MAX);
            }
            last.current.pinch = gap;
            last.current.count = touches.length;
            return;
          }

          // Finger count changed (e.g. pinch ended): restart the drag baseline so it can't jump.
          if (last.current.count !== touches.length) {
            last.current.x = event.nativeEvent.locationX;
            last.current.y = event.nativeEvent.locationY;
            last.current.pinch = 0;
            last.current.count = touches.length;
            return;
          }

          const dx = event.nativeEvent.locationX - last.current.x;
          const dy = event.nativeEvent.locationY - last.current.y;
          m.targetRotY += dx * ROTATE_SPEED;
          m.targetRotX = clamp(m.targetRotX + dy * ROTATE_SPEED, -PITCH_LIMIT, PITCH_LIMIT);
          last.current.x = event.nativeEvent.locationX;
          last.current.y = event.nativeEvent.locationY;
        },
        onPanResponderRelease: () => {
          last.current.pinch = 0;
          last.current.count = 0;
        },
        onPanResponderTerminate: () => {
          last.current.pinch = 0;
          last.current.count = 0;
        },
      }),
    [],
  );

  return (
    <View style={[styles.stage, { backgroundColor: colors.viewerBg }]} {...panResponder.panHandlers}>
      <Canvas
        style={styles.canvas}
        camera={{ position: [0, 0, START_DIST], fov: 45, near: 0.1, far: 100 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={[colors.viewerBg]} />
        <ambientLight intensity={1.4} />
        <directionalLight position={[2, 3, 4]} intensity={2.6} />
        <directionalLight position={[-3, -2, -3]} intensity={0.9} />
        <Suspense fallback={null}>
          <Rig motion={motion}>
            <HeartModel />
          </Rig>
          <Ready onReady={markReady} />
        </Suspense>
      </Canvas>

      {/* Everything painted on the viewer bg uses the on-emerald (dark) palette, like docs/01. */}
      <View pointerEvents="none" style={styles.overlay}>
        {/* Dashed ring from design/screens/02 — the orbit affordance. */}
        <Svg style={styles.ring} viewBox="0 0 100 100">
          <Circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke={darkColors.textSecondary}
            strokeOpacity={0.4}
            strokeWidth={0.6}
            strokeDasharray="2 4"
          />
        </Svg>

        {ready ? null : (
          <View style={styles.loading}>
            <ActivityIndicator color={darkColors.text} />
            <Text style={[styles.loadingText, { color: darkColors.textSecondary }]}>
              {t('viewer.loading')}
            </Text>
          </View>
        )}

        <View style={styles.hintWrap}>
          <View style={[styles.hint, { backgroundColor: darkColors.surface }]}>
            <Text style={[styles.hintText, { color: darkColors.text }]}>{t('viewer.hint')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: '62%',
    aspectRatio: 1,
  },
  loading: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: fontSize.caption,
    fontFamily: fontFamily.arabicBody,
  },
  hintWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing.lg,
    alignItems: 'center',
  },
  hint: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  hintText: {
    fontSize: fontSize.caption,
    fontFamily: fontFamily.arabicBody,
  },
});
