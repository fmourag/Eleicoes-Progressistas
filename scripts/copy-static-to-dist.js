const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const staticDir = path.join(rootDir, 'static');
const distDir = path.join(rootDir, 'apps', 'mobile', 'dist');

console.log('[copy-static-to-dist] Syncing static files to apps/mobile/dist...');

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursiveSync(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(staticDir)) {
  copyRecursiveSync(staticDir, distDir);
  console.log('[copy-static-to-dist] Copied static/ contents to apps/mobile/dist.');
}

// Guarantee download entrypoints
const downloadApkHtml = path.join(staticDir, 'download', 'apk', 'index.html');
if (fs.existsSync(downloadApkHtml)) {
  const destApkHtml = path.join(distDir, 'download', 'apk.html');
  const destDownloadHtml = path.join(distDir, 'download.html');
  fs.mkdirSync(path.dirname(destApkHtml), { recursive: true });
  fs.copyFileSync(downloadApkHtml, destApkHtml);
  fs.copyFileSync(downloadApkHtml, destDownloadHtml);
}

console.log('[copy-static-to-dist] Static synchronization finished.');
