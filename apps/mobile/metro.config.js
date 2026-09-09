const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const config = getDefaultConfig(__dirname);
// Force projectRoot to mobile folder, disable workspace root that causes /apps/mobile prefix
config.projectRoot = __dirname;
// Include workspace root for shared deps but keep projectRoot as mobile
config.watchFolders = [__dirname, path.resolve(__dirname, '../..')];
module.exports = config;
