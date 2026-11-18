import { useEffect, useMemo, type ReactNode } from 'react';
import { useLoader } from '@react-three/fiber/native';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Light LOD built in T-031. Metro treats `.glb` as a static asset (metro.config.js) and
// `@react-three/fiber/native` patches THREE.FileLoader to resolve that module id through
// expo-asset. R3F types the input as a URL, but at runtime the asset module id is what the
// patched loader wants, hence the cast.
const HEART_LIGHT = require('../../assets/models/heart.light.glb') as unknown as string;

/** Where the source model sits and how far it was resized once re-framed on the origin. */
export interface ModelFrame {
  center: THREE.Vector3;
  scale: number;
}

interface HeartModelProps {
  /** Longest side of the re-framed model, in world units. */
  size?: number;
  /** Reports the re-frame transform so callers can map model-space points into the scene. */
  onFrame?: (frame: ModelFrame) => void;
  /** Children are parented to the re-framed model, so they inherit its origin/scale (e.g. hotspots). */
  children?: ReactNode;
}

/**
 * Loads the optimised heart model and re-frames it: the sources don't share an origin, so
 * the object is re-centred on the origin and scaled so its longest side spans `size` units.
 */
export function HeartModel({ size = 2, onFrame, children }: HeartModelProps) {
  const gltf = useLoader(GLTFLoader, HEART_LIGHT);

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

  return <primitive object={object}>{children}</primitive>;
}
