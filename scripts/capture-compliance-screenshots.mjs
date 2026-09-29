import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const outDir = path.join(rootDir, 'build_artifacts', 'store_assets', 'screenshots-compliance');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function processImage(rawPath, finalPath) {
  const image = sharp(rawPath);
  const metadata = await image.metadata();
  console.log(`Processing ${path.basename(finalPath)}: original size ${metadata.width}x${metadata.height}`);
  
  await sharp(rawPath)
    .resize(1080, 1920, { fit: 'cover', position: 'top' })
    .flatten({ background: '#FFFFFF' })
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toFile(finalPath);
    
  if (fs.existsSync(rawPath) && rawPath !== finalPath) {
    fs.unlinkSync(rawPath);
  }
  
  const stats = fs.statSync(finalPath);
  console.log(`Saved ${path.basename(finalPath)} (${(stats.size / 1024).toFixed(1)} KB)`);
}

async function main() {
  console.log('🚀 Starting Compliance Screenshots Capture (1080x1920, 24-bit no alpha)...');
  
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  
  const targetBaseUrl = 'https://eleicoes-progressistas.pages.dev';
  
  console.log(`🌐 Navigating to ${targetBaseUrl}...`);
  try {
    await page.goto(targetBaseUrl, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.warn('Networkidle timeout or warning, waiting 3s...');
    await page.waitForTimeout(3000);
  }

  // Ensure elements are rendered
  await page.waitForTimeout(3000);

  // 1. Screenshot 1: Home completa / GovDisclaimer visível
  console.log('📸 Capturing 01-home-disclaimer...');
  // Scroll down to ensure GovDisclaimer is fully visible in viewport
  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
  });
  await page.waitForTimeout(1000);
  
  const raw1 = path.join(outDir, 'raw-01.png');
  const final1 = path.join(outDir, '01-home-disclaimer.png');
  await page.screenshot({ path: raw1 });
  await processImage(raw1, final1);

  // 2. Screenshot 2: Modal Sobre
  console.log('📸 Capturing 02-about-modal...');
  // Scroll back to top or find Sobre button
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(500);

  // Click Sobre button
  const aboutBtn = page.locator('text=Sobre').first();
  if (await aboutBtn.isVisible()) {
    await aboutBtn.click();
    await page.waitForTimeout(1000);
  } else {
    // Look for button or clickable element containing Sobre or (i)
    const infoIcon = page.locator('[aria-label="Sobre"], [accessibilitylabel="Sobre"], button:has-text("Sobre")').first();
    if (await infoIcon.isVisible()) {
      await infoIcon.click();
      await page.waitForTimeout(1000);
    }
  }

  const raw2 = path.join(outDir, 'raw-02.png');
  const final2 = path.join(outDir, '02-about-modal.png');
  await page.screenshot({ path: raw2 });
  await processImage(raw2, final2);

  // 3. Screenshot 3: Página /privacidade
  console.log('📸 Capturing 03-privacy-page...');
  try {
    await page.goto('https://eleicoes-progressistas.onrender.com/privacidade', { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.warn('Fallback navigation to /privacidade...');
    await page.goto('https://eleicoes-progressistas.onrender.com/privacidade', { timeout: 15000 }).catch(() => {});
  }
  await page.waitForTimeout(2000);

  const raw3 = path.join(outDir, 'raw-03.png');
  const final3 = path.join(outDir, '03-privacy-page.png');
  await page.screenshot({ path: raw3 });
  await processImage(raw3, final3);

  await browser.close();
  console.log('🎉 All compliance screenshots captured and processed successfully!');
}

main().catch(err => {
  console.error('❌ Error capturing screenshots:', err);
  process.exit(1);
});
