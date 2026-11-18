import { useRef } from 'react';
import type { Animated } from 'react-native';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';
import type { HotspotDef } from './hotspots';

/** Screen-space driver for one hotspot: the overlay reads these to place its marker. */
export interface HotspotMarker {
  x: Animated.Value;
  y: Animated.Value;
}

interface HotspotAnchorsProps {
  hotspots: HotspotDef[];
  markers: Record<string, HotspotMarker>;
}

/** Sub-pixel moves are invisible; below this we skip the native write (px). */
const MOVE_EPSILON = 0.5;

/**
 * Invisible points parented to the re-framed model, so they inherit its origin/scale (and the rig's
 * rotation). Every frame each point is projected through the camera into screen pixels and pushed
 * into its `Animated.Value` — the overlay follows without a single React re-render.
 */
export function HotspotAnchors({ hotspots, markers }: HotspotAnchorsProps) {
  const groups = useRef(new Map<string, THREE.Group>());
  const projected = useRef(new THREE.Vector3());
  // Last value pushed to each marker, so an unchanged/sub-pixel projection costs nothing. The frame
  // loop keeps running (the rig eases, gestures idle), so without this every hotspot would write to
  // native 60×/s even when the model is perfectly still — pure bridge traffic on a low-end device.
  const lastX = useRef(new Map<string, number>());
  const lastY = useRef(new Map<string, number>());

  useFrame(({ camera, size }) => {
    const point = projected.current;
    for (const hotspot of hotspots) {
      const group = groups.current.get(hotspot.termKey);
      const marker = markers[hotspot.termKey];
      if (!group || !marker) continue;

      group.getWorldPosition(point);
      point.project(camera);
      const x = (point.x * 0.5 + 0.5) * size.width;
      const y = (-point.y * 0.5 + 0.5) * size.height;

      const prevX = lastX.current.get(hotspot.termKey);
      const prevY = lastY.current.get(hotspot.termKey);
      if (
        prevX !== undefined &&
        prevY !== undefined &&
        Math.abs(prevX - x) < MOVE_EPSILON &&
        Math.abs(prevY - y) < MOVE_EPSILON
      ) {
        continue;
      }

      lastX.current.set(hotspot.termKey, x);
      lastY.current.set(hotspot.termKey, y);
      marker.x.setValue(x);
      marker.y.setValue(y);
    }
  });

  return (
    <>
      {hotspots.map((hotspot) => (
        <group
          key={hotspot.termKey}
          ref={(node) => {
            if (node) groups.current.set(hotspot.termKey, node);
            else groups.current.delete(hotspot.termKey);
          }}
          position={[hotspot.position[0], hotspot.position[1], hotspot.position[2]]}
        />
      ))}
    </>
  );
}
