const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const mobileDistDir = path.join(rootDir, 'apps', 'mobile', 'dist');
const apiStaticDir = path.join(rootDir, 'apps', 'api', 'static');
const apiStaticWebDir = path.join(apiStaticDir, 'web');

console.log('[render:copy-assets] Starting asset synchronization...');

if (!fs.existsSync(apiStaticDir)) {
  fs.mkdirSync(apiStaticDir, { recursive: true });
}
if (!fs.existsSync(apiStaticWebDir)) {
  fs.mkdirSync(apiStaticWebDir, { recursive: true });
}

if (fs.existsSync(mobileDistDir)) {
  console.log(`[render:copy-assets] Copying ${mobileDistDir} -> ${apiStaticWebDir}`);
  fs.cpSync(mobileDistDir, apiStaticWebDir, { recursive: true, force: true });
  console.log('[render:copy-assets] Web assets copied successfully.');
} else {
  console.warn(`[render:copy-assets] Warning: ${mobileDistDir} does not exist yet.`);
}

const redirectHtml = '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/web/"></head><body><p>Redirecionando para <a href="/web/">/web/</a>...</p></body></html>';
fs.writeFileSync(path.join(apiStaticDir, 'index.html'), redirectHtml, 'utf8');

const apkDir = path.join(apiStaticDir, 'apk');
const apkFile = path.join(apkDir, 'eleicoes-progressistas-v2.2.5.apk');
const shaFile = path.join(apkDir, 'sha256.txt');

if (fs.existsSync(apkFile) && fs.existsSync(shaFile)) {
  const stat = fs.statSync(apkFile);
  const sha = fs.readFileSync(shaFile, 'utf8').trim();
  console.log(`[render:copy-assets] APK verified: size=${stat.size} bytes, sha256=${sha}`);
} else {
  console.warn('[render:copy-assets] Warning: APK file or sha256.txt missing in apps/api/static/apk/');
}

console.log('[render:copy-assets] Asset synchronization finished.');
