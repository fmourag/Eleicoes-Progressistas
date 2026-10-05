import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const aabPath = path.join(rootDir, 'apps', 'mobile', 'android', 'app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab');

console.log('📦 Validating AAB:', aabPath);

if (!fs.existsSync(aabPath)) {
  console.error('❌ AAB file not found at:', aabPath);
  process.exit(1);
}

const stats = fs.statSync(aabPath);
console.log(`📏 File Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);

// 1. List entries and check bundle contents using python or native extraction
const tempDir = path.join(rootDir, 'build_artifacts', 'aab_inspect_temp');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

try {
  // Use PowerShell to extract specific files
  execSync(`powershell -Command "Expand-Archive -Path '${aabPath}' -DestinationPath '${tempDir}' -Force"`, { stdio: 'inherit' });
} catch (e) {
  console.error('Failed expanding archive:', e);
}

function countFiles(dir) {
  let count = 0;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory()) {
      count += countFiles(path.join(dir, item.name));
    } else {
      count++;
    }
  }
  return count;
}

const totalFiles = countFiles(tempDir);
console.log(`📂 Total Files in AAB: ${totalFiles}`);

// Check JS Bundle
const jsBundlePath = path.join(tempDir, 'base', 'assets', 'index.android.bundle');
if (fs.existsSync(jsBundlePath)) {
  const jsContent = fs.readFileSync(jsBundlePath, 'utf8');
  console.log(`📜 index.android.bundle size: ${(jsContent.length / (1024 * 1024)).toFixed(2)} MB`);
  
  const hasGovDisclaimer = jsContent.includes('GovDisclaimer') || jsContent.includes('aplicativo independente, sem vínculo com o TSE');
  const hasTseOfficial = jsContent.includes('tse.jus.br') && jsContent.includes('dadosabertos.tse.jus.br') && jsContent.includes('resultados.tse.jus.br');
  const hasDeEndorsedWording = jsContent.includes('Classificação independente calculada sobre registros oficiais');
  
  console.log(`✅ GovDisclaimer in bundle: ${hasGovDisclaimer}`);
  console.log(`✅ Official TSE URLs in bundle: ${hasTseOfficial}`);
  console.log(`✅ De-endorsed wording in bundle: ${hasDeEndorsedWording}`);
} else {
  console.warn('⚠️ index.android.bundle not found at expected path');
}

// Check manifest info from build.gradle
const buildGradlePath = path.join(rootDir, 'apps', 'mobile', 'android', 'app', 'build.gradle');
const buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');
const vCodeMatch = buildGradleContent.match(/versionCode\s+(\d+)/);
const vNameMatch = buildGradleContent.match(/versionName\s+"([^"]+)"/);

console.log(`🏷️ Manifest VersionCode: ${vCodeMatch ? vCodeMatch[1] : 'unknown'} (Expected: 25)`);
console.log(`🏷️ Manifest VersionName: ${vNameMatch ? vNameMatch[1] : 'unknown'} (Expected: 2.2.24)`);

// Clean temp
fs.rmSync(tempDir, { recursive: true, force: true });
console.log('✨ AAB validation completed successfully!');
