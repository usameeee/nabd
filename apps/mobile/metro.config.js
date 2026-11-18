// Metro config for Expo inside the npm-workspaces monorepo.
// http://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the whole monorepo so changes in packages/shared trigger a reload.
config.watchFolders = [workspaceRoot];

// 2. Resolve modules from the app first, then the workspace root.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Let Metro resolve hoisted workspace deps without walking up node_modules.
config.resolver.disableHierarchicalLookup = true;

// 4. Treat glTF binaries as static assets so `require('*.glb')` returns an asset module id.
//    'glb' is NOT in Metro's default assetExts; the viewer (T-032) needs it.
//    `@react-three/fiber/native` patches THREE.FileLoader to resolve that id via expo-asset.
config.resolver.assetExts.push('glb');

module.exports = config;
