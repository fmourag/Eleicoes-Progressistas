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
    // Cloudflare Pages has a hard limit of 25MB per file. Skip large binaries like APKs.
    if (src.endsWith('.apk') || stat.size > 20 * 1024 * 1024) {
      console.log(`[copy-static-to-dist] Skipping large binary from Pages dist: ${path.basename(src)} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
      return;
    }
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

// Clean up any previously copied APKs in dist
const distApkDir = path.join(distDir, 'apk');
if (fs.existsSync(distApkDir)) {
  fs.rmSync(distApkDir, { recursive: true, force: true });
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
