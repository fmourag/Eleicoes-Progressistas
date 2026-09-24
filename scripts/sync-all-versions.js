const fs = require('fs');
const path = require('path');

const TARGET_VERSION = '2.2.18';
const TARGET_TAG = 'v2.2.18';
const TARGET_VERSION_CODE = 19;
const TARGET_APK = 'eleicoes-progressistas-v2.2.18-beta.apk';

const rootDir = path.resolve(__dirname, '..');

function replaceInFile(relPathSegments, replacerFn) {
  const fullPath = path.join(rootDir, ...relPathSegments);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${fullPath}`);
    return;
  }
  const original = fs.readFileSync(fullPath, 'utf8');
  const updated = replacerFn(original);
  if (original !== updated) {
    fs.writeFileSync(fullPath, updated, 'utf8');
    console.log(`✅ Updated: ${fullPath}`);
  } else {
    console.log(`ℹ️ No changes needed: ${fullPath}`);
  }
}

// 1. package.json (root)
replaceInFile(['package.json'], (c) => {
  return c.replace(/"version":\s*"[^"]+"/, `"version": "${TARGET_VERSION}"`);
});

// 2. packages/shared/package.json
replaceInFile(['packages', 'shared', 'package.json'], (c) => {
  return c.replace(/"version":\s*"[^"]+"/, `"version": "${TARGET_VERSION}"`);
});

// 3. apps/api/package.json
replaceInFile(['apps', 'api', 'package.json'], (c) => {
  return c.replace(/"version":\s*"[^"]+"/, `"version": "${TARGET_VERSION}"`);
});

// 4. apps/mobile/package.json
replaceInFile(['apps', 'mobile', 'package.json'], (c) => {
  return c.replace(/"version":\s*"[^"]+"/, `"version": "${TARGET_VERSION}"`);
});

// 5. apps/mobile/app.json
replaceInFile(['apps', 'mobile', 'app.json'], (c) => {
  return c
    .replace(/"version":\s*"[^"]+"/, `"version": "${TARGET_VERSION}"`)
    .replace(/"versionCode":\s*\d+/, `"versionCode": ${TARGET_VERSION_CODE}`);
});

// 6. apps/mobile/android/app/build.gradle
replaceInFile(['apps', 'mobile', 'android', 'app', 'build.gradle'], (c) => {
  return c
    .replace(/versionName\s+["'][^"']+["']/g, `versionName "${TARGET_VERSION}"`)
    .replace(/versionCode\s+\d+/g, `versionCode ${TARGET_VERSION_CODE}`);
});

// 7. apps/mobile/src/constants/app.ts
replaceInFile(['apps', 'mobile', 'src', 'constants', 'app.ts'], (c) => {
  return c
    .replace(/APP_VERSION\s*=\s*['"][^'"]+['"]/g, `APP_VERSION = '${TARGET_TAG}'`)
    .replace(/APP_VERSION_CODE\s*=\s*\d+/g, `APP_VERSION_CODE = ${TARGET_VERSION_CODE}`);
});

// 8. apps/mobile/app/manual.tsx
replaceInFile(['apps', 'mobile', 'app', 'manual.tsx'], (c) => {
  return c.replace(/v2\.[0-9.]+/g, TARGET_TAG);
});

// 9. apps/mobile/app/transparencia.tsx
replaceInFile(['apps', 'mobile', 'app', 'transparencia.tsx'], (c) => {
  return c.replace(/v2\.[0-9.]+/g, TARGET_TAG);
});

// 10. apps/api/src/main.ts
replaceInFile(['apps', 'api', 'src', 'main.ts'], (c) => {
  return c
    .replace(/eleicoes-progressistas-v2\.[0-9.]+-beta\.apk/g, TARGET_APK)
    .replace(/v2\.[0-9.]+/g, TARGET_TAG);
});

// 11. apps/api/src/modules/common/static-pages.ts
replaceInFile(['apps', 'api', 'src', 'modules', 'common', 'static-pages.ts'], (c) => {
  return c
    .replace(/eleicoes-progressistas-v2\.[0-9.]+-beta\.apk/g, TARGET_APK)
    .replace(/v2\.[0-9.]+/g, TARGET_TAG);
});

// 12. apps/api/src/modules/common/static-assets.controller.ts
replaceInFile(['apps', 'api', 'src', 'modules', 'common', 'static-assets.controller.ts'], (c) => {
  return c.replace(/eleicoes-progressistas-v2\.[0-9.]+-beta\.apk/g, TARGET_APK);
});

// 13. scripts/render-copy-assets.js
replaceInFile(['scripts', 'render-copy-assets.js'], (c) => {
  return c.replace(/eleicoes-progressistas-v2\.[0-9.]+-beta\.apk/g, TARGET_APK);
});

console.log(`--- Done syncing versions to ${TARGET_TAG} (code: ${TARGET_VERSION_CODE}) ---`);
