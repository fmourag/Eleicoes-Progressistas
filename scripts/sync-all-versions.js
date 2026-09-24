const fs = require('fs');
const path = require('path');

const TARGET_VERSION = '2.2.17';
const TARGET_TAG = 'v2.2.17';
const TARGET_APK = 'eleicoes-progressistas-v2.2.17-beta.apk';

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

// 1. apps/mobile/src/constants/app-version.ts
replaceInFile(['apps', 'mobile', 'src', 'constants', 'app-version.ts'], (c) => {
  return c
    .replace(/APP_VERSION\s*=\s*['"][^'"]+['"]/g, `APP_VERSION = '${TARGET_VERSION}'`)
    .replace(/APP_VERSION_LABEL\s*=\s*['"][^'"]+['"]/g, `APP_VERSION_LABEL = '${TARGET_VERSION}'`)
    .replace(/APP_VERSION_TAG\s*=\s*['"][^'"]+['"]/g, `APP_VERSION_TAG = '${TARGET_TAG}'`)
    .replace(/APK_DOWNLOAD_FILENAME\s*=\s*['"][^'"]+['"]/g, `APK_DOWNLOAD_FILENAME = '${TARGET_APK}'`);
});

// 2. apps/mobile/app/(tabs)/index.tsx
replaceInFile(['apps', 'mobile', 'app', '(tabs)', 'index.tsx'], (c) => {
  return c.replace(/const APP_VERSION\s*=\s*['"][^'"]+['"]/g, `const APP_VERSION = '${TARGET_TAG}'`);
});

// 3. apps/mobile/app/index.tsx
replaceInFile(['apps', 'mobile', 'app', 'index.tsx'], (c) => {
  return c.replace(/const APP_VERSION\s*=\s*['"][^'"]+['"]/g, `const APP_VERSION = '${TARGET_TAG}'`);
});

// 4. apps/mobile/app/(tabs)/ranking.tsx
replaceInFile(['apps', 'mobile', 'app', '(tabs)', 'ranking.tsx'], (c) => {
  return c.replace(/const APP_VERSION\s*=\s*['"][^'"]+['"]/g, `const APP_VERSION = '${TARGET_TAG}'`);
});

// 5. apps/mobile/components/OfflineDisclaimer.tsx
replaceInFile(['apps', 'mobile', 'components', 'OfflineDisclaimer.tsx'], (c) => {
  return c.replace(/const APP_VERSION\s*=\s*['"][^'"]+['"]/g, `const APP_VERSION = '${TARGET_TAG}'`);
});

// 6. apps/mobile/app/(tabs)/more.tsx
replaceInFile(['apps', 'mobile', 'app', '(tabs)', 'more.tsx'], (c) => {
  return c.replace(/v2\.[0-9.]+\s*•\s*Offline First/g, `${TARGET_TAG} • Offline First`);
});

// 7. apps/mobile/android/app/build.gradle
replaceInFile(['apps', 'mobile', 'android', 'app', 'build.gradle'], (c) => {
  return c
    .replace(/versionName\s+["'][^"']+["']/g, `versionName "${TARGET_VERSION}"`)
    .replace(/versionCode\s+\d+/g, `versionCode 17`);
});

console.log('--- Done syncing versions ---');
