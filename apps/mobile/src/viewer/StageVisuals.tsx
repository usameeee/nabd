import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';
import type { DiseaseStage } from '@nabd/shared';
import { resolveStage } from './diseases';

/** Fraction of the remaining gap closed per frame — the stage change eases in (~0.5s). */
const EASE = 0.12;

interface BaseMaterial {
  color: THREE.Color;
  emissive: THREE.Color;
  emissiveIntensity: number;
  opacity: number;
  transparent: boolean;
}

interface MaterialEntry {
  material: THREE.MeshStandardMaterial;
  base: BaseMaterial;
}

interface MeshEntry {
  name: string;
  materials: MaterialEntry[];
}

interface StageVisualsProps {
  /** The re-framed root object (from `HeartModel`'s `onObject`); null until the model loads. */
  object: THREE.Object3D | null;
  /** Active disease stage, or undefined in the anatomy tab. */
  stage: DiseaseStage | undefined;
}

/**
 * Eases each stage's `visual` onto the model (T-041). Every mesh gets its OWN cloned material so a
 * tint can't bleed into a mesh that shares one, and the base look is remembered so returning to the
 * "healthy" stage restores it. Properties are lerped inside `useFrame` — no React re-render per
 * frame — so scrubbing the stage slider stays smooth (docs/02 performance target).
 */
export function StageVisuals({ object, stage }: StageVisualsProps) {
  const meshes = useRef<MeshEntry[]>([]);

  // Precompute the active stage's targets once per change (no per-frame allocation).
  const target = useMemo(() => {
    const resolved = resolveStage(stage);
    return {
      highlight: new Set(resolved.meshes),
      color: resolved.material.color ? new THREE.Color(resolved.material.color) : null,
      emissive: resolved.material.emissive ? new THREE.Color(resolved.material.emissive) : null,
      emissiveIntensity: resolved.material.emissiveIntensity,
      opacity: resolved.material.opacity,
    };
  }, [stage]);

  // (Re)collect the meshes and clone their materials whenever the model object changes (LOD swap).
  useEffect(() => {
    if (!object) {
      meshes.current = [];
      return;
    }

    const entries: MeshEntry[] = [];
    object.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const raw = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const materials: MaterialEntry[] = [];

      for (const material of raw) {
        const clone = material.clone() as THREE.MeshStandardMaterial;
        materials.push({
          material: clone,
          base: {
            color: clone.color.clone(),
            emissive: clone.emissive ? clone.emissive.clone() : new THREE.Color(0, 0, 0),
            emissiveIntensity: clone.emissiveIntensity ?? 0,
            opacity: clone.opacity,
            transparent: clone.transparent,
          },
        });
      }

      const single = materials[0];
      mesh.material = Array.isArray(mesh.material)
        ? materials.map((entry) => entry.material)
        : single
          ? single.material
          : mesh.material;
      entries.push({ name: mesh.name, materials });
    });

    meshes.current = entries;
  }, [object]);

  useFrame(() => {
    for (const mesh of meshes.current) {
      const highlighted = target.highlight.has(mesh.name);
      for (const entry of mesh.materials) {
        const { material, base } = entry;

        material.color.lerp(highlighted && target.color ? target.color : base.color, EASE);

        if (material.emissive) {
          material.emissive.lerp(
            highlighted && target.emissive ? target.emissive : base.emissive,
            EASE,
          );
        }

        const emissiveIntensity =
          highlighted && target.emissiveIntensity !== undefined
            ? target.emissiveIntensity
            : base.emissiveIntensity;
        material.emissiveIntensity += (emissiveIntensity - material.emissiveIntensity) * EASE;

        const opacity =
          highlighted && target.opacity !== undefined ? target.opacity : base.opacity;
        material.opacity += (opacity - material.opacity) * EASE;
        material.transparent = material.opacity < 0.999 ? true : base.transparent;
      }
    }
  });

  return null;
}
