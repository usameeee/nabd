import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber/native';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Light LOD built in T-031. Metro treats `.glb` as a static asset (metro.config.js) and
// `@react-three/fiber/native` patches THREE.FileLoader to resolve that module id through
// expo-asset. R3F types the input as a URL, but at runtime the asset module id is what the
// patched loader wants, hence the cast.
const HEART_LIGHT = require('../../assets/models/heart.light.glb') as unknown as string;

/**
 * Loads the optimised heart model and re-frames it: the sources don't share an origin, so
 * the object is re-centred on the origin and scaled so its longest side spans `size` units.
 */
export function HeartModel({ size = 2 }: { size?: number }) {
  const gltf = useLoader(GLTFLoader, HEART_LIGHT);

  const object = useMemo(() => {
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
    return root;
  }, [gltf, size]);

  return <primitive object={object} />;
}
