const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const mobileDistDir = path.join(rootDir, 'apps', 'mobile', 'dist');
const apiStaticDir = path.join(rootDir, 'apps', 'api', 'static');
const apiStaticWebDir = path.join(apiStaticDir, 'web');
const rootStaticDir = path.join(rootDir, 'static');

console.log('[render:copy-assets] Starting asset synchronization...');

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      copyRecursiveSync(srcPath, destPath);
    }
  } else {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

if (!fs.existsSync(apiStaticDir)) {
  fs.mkdirSync(apiStaticDir, { recursive: true });
}
if (!fs.existsSync(apiStaticWebDir)) {
  fs.mkdirSync(apiStaticWebDir, { recursive: true });
}

if (fs.existsSync(mobileDistDir)) {
  // 1. Sincroniza bundle completo do Expo Web para apps/api/static/web/
  console.log(`[render:copy-assets] Copying ${mobileDistDir} -> ${apiStaticWebDir}`);
  copyRecursiveSync(mobileDistDir, apiStaticWebDir);

  // 2. Sincroniza bundle completo do Expo Web diretamente para a raiz apps/api/static/
  // Isso garante que requisições absolutas /_expo/..., /assets/..., etc., respondam diretamente na raiz com 200 OK
  console.log(`[render:copy-assets] Copying ${mobileDistDir} -> ${apiStaticDir}`);
  copyRecursiveSync(mobileDistDir, apiStaticDir);
  console.log('[render:copy-assets] Web assets copied successfully to both root and /web.');
} else {
  console.warn(`[render:copy-assets] Warning: ${mobileDistDir} does not exist yet.`);
}

// Sincroniza páginas estáticas e candidatos da pasta static/ raiz se existirem
if (fs.existsSync(rootStaticDir)) {
  console.log(`[render:copy-assets] Copying ${rootStaticDir} -> ${apiStaticDir} and ${apiStaticWebDir}`);
  copyRecursiveSync(rootStaticDir, apiStaticDir);
  copyRecursiveSync(rootStaticDir, apiStaticWebDir);
}

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

console.log('[render:copy-assets] Asset synchronization finished successfully.');
