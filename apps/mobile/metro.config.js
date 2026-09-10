const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, '../..');

const config = getDefaultConfig(projectRoot);

// Force projectRoot to mobile folder
config.projectRoot = projectRoot;

// Include workspace root for shared deps
config.watchFolders = [workspaceRoot];

// Prioritize apps/mobile/node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// CRITICAL: Force react-native and core packages to resolve from mobile app only
const mobileModules = path.resolve(projectRoot, 'node_modules');
config.resolver.extraNodeModules = {
  'react-native': path.resolve(mobileModules, 'react-native'),
  'react': path.resolve(mobileModules, 'react'),
  'react-dom': path.resolve(mobileModules, 'react-dom'),
};

// CRITICAL: Block workspace root's react-native from being watched/transformed.
// Only block the main 'react-native' package (not @react-native/* scoped packages,
// which are needed as dependencies of react-native 0.76.9).
const escapedRootModules = path.resolve(workspaceRoot, 'node_modules').replace(/[/\\]/g, '[/\\\\]');
config.resolver.blockList = [
  new RegExp(`^${escapedRootModules}[/\\\\]react-native[/\\\\].*$`),
];

module.exports = config;
