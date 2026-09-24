const fs = require('fs');
const path = require('path');

const KEYSTORE_BASE64 = `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`;

function configure() {
  const rootDir = path.resolve(__dirname, '..');
  const appDir = path.join(rootDir, 'apps', 'mobile', 'android', 'app');
  const keystorePath = path.join(appDir, 'release-upload.keystore');
  const buildGradlePath = path.join(appDir, 'build.gradle');

  if (!fs.existsSync(appDir)) {
    console.error('Directory does not exist:', appDir);
    process.exit(1);
  }

  // Write keystore
  fs.writeFileSync(keystorePath, Buffer.from(KEYSTORE_BASE64, 'base64'));
  console.log('✅ Keystore written to:', keystorePath);

  let gradleContent = fs.readFileSync(buildGradlePath, 'utf8');

  const oldSigningBlock = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`;

  const newSigningBlock = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file('release-upload.keystore')
            storePassword 'a201c27d0129a5350bd73aafe0e207de'
            keyAlias 'd784a25caaf6ca0973cef2cd4baae258'
            keyPassword '51d587276cd390f8dc9fa69bcf85c877'
        }
    }`;

  if (gradleContent.includes(oldSigningBlock)) {
    gradleContent = gradleContent.replace(oldSigningBlock, newSigningBlock);
  }

  const oldReleaseSigning = `        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`;

  const newReleaseSigning = `        release {
            // Production upload signing config
            signingConfig signingConfigs.release`;

  if (gradleContent.includes(oldReleaseSigning)) {
    gradleContent = gradleContent.replace(oldReleaseSigning, newReleaseSigning);
  }

  fs.writeFileSync(buildGradlePath, gradleContent, 'utf8');
  console.log('✅ build.gradle successfully configured for release signing!');
}

configure();
