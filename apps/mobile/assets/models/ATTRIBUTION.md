# Model attributions

Every 3D model in this folder comes from a free, attribution-based source. The internal
licence registry is `docs/04_CONTENT_SOURCES.md`; this file is the copy that ships with the app
so the credit travels with the asset.

## heart.glb

- **File:** `heart.glb` — the HRA reference object `3d-vh-m-heart.glb` (ref-organ **heart-male v1.3**, 17 anatomical structures, UBERON:0000948)
- **Source:** Human Reference Atlas (HRA) 3D Reference Object Library — https://humanatlas.io/3d-reference-library
- **Downloaded from:** https://cdn.humanatlas.io/digital-objects/ref-organ/heart-male/v1.3/assets/3d-vh-m-heart.glb
- **Digital object:** https://purl.humanatlas.io/ref-organ/heart-male/v1.3 — DOI https://doi.org/10.48539/HBM564.WKNG.249
- **Licence:** Creative Commons Attribution 4.0 International (CC BY 4.0) — https://creativecommons.org/licenses/by/4.0/
- **Commercial use:** allowed (CC BY 4.0)
- **Modification / derivatives:** allowed, must keep attribution and state changes (CC BY 4.0)
- **Integrity (original):** 4,071,772 bytes · SHA-256 `689df039c8bc264ea06a44cd926762976f0666c0ff2dc532d046409b185e6b0c` · glTF 2.0 (generator: babylon.js glTF exporter for Autodesk MAYA 2023.2)

### heart.light.glb — optimised derivative (Nabd modification)

- **What it is:** the light version the app loads on low/mid-range phones; the full `heart.glb` is the source kept for lazy-loading the detailed model (docs/02).
- **Changes vs the original (Nabd):** gltf-transform pipeline — `dedup` → `weld` → `simplify` (meshoptimizer, ratio 0.5, error 0.001) → `prune` → `quantize` (position 14-bit, normal 10-bit, color 8-bit, `KHR_mesh_quantization`). **No meshes joined** — all 14 named anatomy structures (valves, atria, ventricles, septum, papillary muscles) are preserved so hotspots/picking still work; no textures added; no geometry translated or re-authored.
- **Result:** 1,334,240 bytes — **67% smaller** than the original.
- **Integrity (light):** SHA-256 `1471dcf6fb870795e7d3e9dc21d4ef62f2284b79542ec7e962d888eedd948e6f` · 14 meshes / 1 material `heart_mat` / no textures.
- **Tool:** `@gltf-transform/cli` 4.5.1 (run via `npx`, not added as a dependency).
- **Known source quirk (not introduced by us):** the HRA original has non-unit `NORMAL` values (glTF validator: 408 occurrences); the light version has fewer (211). three.js normalises normals in the shader, so shading is unaffected.
- **Attribution text to show in-app:**
  > HuBMAP CCF 3D Reference Object Library — *3D Reference Organ for Heart, Male* (v1.3).
  > Schlehlein, H., Herr II, B. W., Quardokus, E. M., Bueckle, A., & Börner, K. (2022). *HuBMAP CCF 3D Reference Object Library.* https://humanatlas.io/3d-reference-library
  > Digital object: https://doi.org/10.48539/HBM564.WKNG.249 — licensed under CC BY 4.0. Model built from the Visible Human Project male dataset (U.S. National Library of Medicine).
