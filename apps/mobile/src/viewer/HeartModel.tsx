import { useEffect, useMemo, type ReactNode } from 'react';
import { useLoader } from '@react-three/fiber/native';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Light LOD built in T-031. Metro treats `.glb` as a static asset (metro.config.js) and
// `@react-three/fiber/native` patches THREE.FileLoader to resolve that module id through
// expo-asset. R3F types the input as a URL, but at runtime the asset module id is what the
// patched loader wants, hence the cast.
const HEART_LIGHT = require('../../assets/models/heart.light.glb') as unknown as string;
// Detailed LOD (T-037): the full HRA source kept for lazy-loading on top of the light one (docs/02,
// D-007). It is only parsed once the light model is on screen.
const HEART_DETAILED = require('../../assets/models/heart.glb') as unknown as string;

/** Which LOD the viewer renders. `light` opens by default; `detailed` is swapped in when ready. */
export type ModelSource = 'light' | 'detailed';

/** Where the source model sits and how far it was resized once re-framed on the origin. */
export interface ModelFrame {
  center: THREE.Vector3;
  scale: number;
}

interface HeartModelProps {
  /** Longest side of the re-framed model, in world units. */
  size?: number;
  /** LOD to render. Defaults to the light model (T-031); `detailed` is the heavier source (T-037). */
  source?: ModelSource;
  /** Reports the re-frame transform so callers can map model-space points into the scene. */
  onFrame?: (frame: ModelFrame) => void;
  /** Reports the re-framed root object so callers can reach its meshes (e.g. disease stages, T-041). */
  onObject?: (object: THREE.Object3D) => void;
  /** Children are parented to the re-framed model, so they inherit its origin/scale (e.g. hotspots). */
  children?: ReactNode;
}

/**
 * Loads the optimised heart model and re-frames it: the sources don't share an origin, so
 * the object is re-centred on the origin and scaled so its longest side spans `size` units.
 */
export function HeartModel({ size = 2, source = 'light', onFrame, onObject, children }: HeartModelProps) {
  // Both LODs share one author-space (the light one is a derivative of the detailed source with the
  // same node transforms), so the re-frame maps hotspot model-space points onto either the same way.
  const gltf = useLoader(GLTFLoader, source === 'detailed' ? HEART_DETAILED : HEART_LIGHT);

  const { object, frame } = useMemo(() => {
    const root = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const dimensions = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(dimensions);
    box.getCenter(center);

    const longestSide = Math.max(dimensions.x, dimensions.y, dimensions.z) || 1;
    const scale = size / longestSide;
    root.scale.setScalar(scale);
    root.position.copy(center).multiplyScalar(-scale);
    return { object: root, frame: { center, scale } };
  }, [gltf, size]);

  useEffect(() => {
    onFrame?.(frame);
  }, [frame, onFrame]);

  useEffect(() => {
    onObject?.(object);
  }, [object, onObject]);

  return <primitive object={object}>{children}</primitive>;
}

/**
 * Warms the detailed LOD into R3F's loader cache without rendering it (T-037). Mount it after the
 * light model is on screen; `useLoader` caches by `[loader, url]`, so the later `HeartModel
 * source="detailed"` swap resolves from cache and never re-suspends. Calls `onLoaded` once ready.
 */
export function DetailedModelPreloader({ onLoaded }: { onLoaded: () => void }) {
  useLoader(GLTFLoader, HEART_DETAILED);
  useEffect(() => onLoaded(), [onLoaded]);
  return null;
}
