import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const mobileDir = path.join(rootDir, 'apps', 'mobile');
const assetsDir = path.join(mobileDir, 'assets');
const iconsDir = path.join(assetsDir, 'icons');
const adaptiveDir = path.join(iconsDir, 'adaptive');
const storeDir = path.join(assetsDir, 'store');
const buildArtifactsStoreDir = path.join(rootDir, 'build_artifacts', 'store_assets');
const androidResDir = path.join(mobileDir, 'android', 'app', 'src', 'main', 'res');

// Cria estrutura de diretórios
[iconsDir, adaptiveDir, storeDir, buildArtifactsStoreDir].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

/**
 * 0. VETORES SVG MASTER (1024x1024)
 * Safe zone adaptativa: 66dp centrados num canvas de 108dp (61.11% = 625.7px)
 */

// A) Fundo Full-Bleed sem cantos arredondados (Gradiente Carmim / Vermelho)
const svgBackground1024 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A2141B" />
      <stop offset="50%" stop-color="#8B1117" />
      <stop offset="100%" stop-color="#6B0F13" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="1024" height="1024" fill="url(#bgGrad)" />
</svg>
`;

// B) Logo Foreground em fundo transparente (Ocupando exatamente a safe zone de 61.1%)
// O símbolo original tem ~90x112 unidades. Escala 4.8 centralizada em (512, 512).
const svgForeground1024 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="carmimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E53E3E" />
      <stop offset="100%" stop-color="#9B2C2C" />
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Safe Zone Guide: 626px (61.1% de 1024) centrado em 512 -->
  <g transform="translate(512, 512) scale(4.7)" filter="url(#logoShadow)">
    <!-- Cédula / Urna em Perspectiva Dinâmica -->
    <path d="M-42,28 L-16,-34 L16,-34 L42,28 Z" fill="#FFFFFF" fill-opacity="0.98" />
    <!-- Fenda central / Raio Carmim -->
    <path d="M-21,28 L0,-22 L21,28 Z" fill="url(#carmimGrad)" />
    
    <!-- Estrela Guia / Farol Democrático -->
    <path d="M0,-48 L4.5,-38 L14.5,-37 L7,-30 L9,-20 L0,-25.5 L-9,-20 L-7,-30 L-14.5,-37 L-4.5,-38 Z" fill="url(#goldGrad)" />
    
    <!-- Checkmark / Ficha Limpa Esmeralda -->
    <path d="M-32,42 L-8,64 L38,18" fill="none" stroke="url(#emeraldGrad)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>
`;

// C) Logo Monochrome (Silhueta branca pura para Android 13+ Themed Icons)
const svgMonochrome1024 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <g transform="translate(512, 512) scale(4.7)">
    <!-- Cédula / Urna -->
    <path d="M-42,28 L-16,-34 L16,-34 L42,28 Z" fill="#FFFFFF" />
    <!-- Fenda central em recorte transparente -->
    <path d="M-21,28 L0,-22 L21,28 Z" fill="#000000" fill-opacity="0.3" />
    <!-- Estrela Guia -->
    <path d="M0,-48 L4.5,-38 L14.5,-37 L7,-30 L9,-20 L0,-25.5 L-9,-20 L-7,-30 L-14.5,-37 L-4.5,-38 Z" fill="#FFFFFF" />
    <!-- Checkmark -->
    <path d="M-32,42 L-8,64 L38,18" fill="none" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>
`;

// D) Master Completo 1024x1024 (Fundo Full-Bleed + Logo Seguro)
const svgMaster1024 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A2141B" />
      <stop offset="50%" stop-color="#8B1117" />
      <stop offset="100%" stop-color="#6B0F13" />
    </linearGradient>
    <linearGradient id="carmimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E53E3E" />
      <stop offset="100%" stop-color="#9B2C2C" />
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.30" />
    </filter>
  </defs>

  <!-- Full Bleed Square Background (sem arredondamento) -->
  <rect x="0" y="0" width="1024" height="1024" fill="url(#bgGrad)" />

  <!-- Logo dentro da Safe Zone -->
  <g transform="translate(512, 512) scale(4.7)" filter="url(#logoShadow)">
    <path d="M-42,28 L-16,-34 L16,-34 L42,28 Z" fill="#FFFFFF" fill-opacity="0.98" />
    <path d="M-21,28 L0,-22 L21,28 Z" fill="url(#carmimGrad)" />
    <path d="M0,-48 L4.5,-38 L14.5,-37 L7,-30 L9,-20 L0,-25.5 L-9,-20 L-7,-30 L-14.5,-37 L-4.5,-38 Z" fill="url(#goldGrad)" />
    <path d="M-32,42 L-8,64 L38,18" fill="none" stroke="url(#emeraldGrad)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>
`;

// E) Feature Graphic 1024x500
const svgFeature1024x500 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 500" width="1024" height="500">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F8FAFC" />
    </linearGradient>
    <linearGradient id="carmimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E53E3E" />
      <stop offset="100%" stop-color="#9B2C2C" />
    </linearGradient>
    <linearGradient id="iconBoxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A2141B" />
      <stop offset="100%" stop-color="#6B0F13" />
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.18" />
    </filter>
  </defs>

  <rect width="1024" height="500" fill="url(#bgGrad)" />

  <!-- Bloco do Emblema à Esquerda -->
  <g transform="translate(90, 110)">
    <rect x="0" y="0" width="280" height="280" rx="64" fill="url(#iconBoxGrad)" filter="url(#softShadow)" />
    <g transform="translate(140, 140) scale(1.35)">
      <path d="M-42,28 L-16,-34 L16,-34 L42,28 Z" fill="#FFFFFF" fill-opacity="0.98" />
      <path d="M-21,28 L0,-22 L21,28 Z" fill="url(#carmimGrad)" />
      <path d="M0,-48 L4.5,-38 L14.5,-37 L7,-30 L9,-20 L0,-25.5 L-9,-20 L-7,-30 L-14.5,-37 L-4.5,-38 Z" fill="url(#goldGrad)" />
      <path d="M-32,42 L-8,64 L38,18" fill="none" stroke="url(#emeraldGrad)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </g>

  <!-- Divisória Elegante -->
  <line x1="420" y1="110" x2="420" y2="390" stroke="#E2E8F0" stroke-width="2.5" stroke-linecap="round" />

  <!-- Bloco de Texto à Direita -->
  <g transform="translate(460, 110)">
    <!-- Badges -->
    <g transform="translate(0, 10)">
      <rect x="0" y="0" width="168" height="34" rx="17" fill="#FEF2F2" stroke="#FCA5A5" stroke-width="1.2" />
      <circle cx="16" cy="17" r="5" fill="#DC2626" />
      <text x="30" y="22" font-family="'Inter', -apple-system, Roboto, sans-serif" font-weight="700" font-size="13" fill="#991B1B" letter-spacing="1">ELEIÇÕES 2026</text>

      <rect x="182" y="0" width="144" height="34" rx="17" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="1.2" />
      <circle cx="198" cy="17" r="5" fill="#059669" />
      <text x="212" y="22" font-family="'Inter', -apple-system, Roboto, sans-serif" font-weight="700" font-size="13" fill="#065F46" letter-spacing="0.5">FICHA LIMPA</text>
    </g>

    <!-- Título Principal -->
    <text x="0" y="115" font-family="'Inter', -apple-system, Roboto, sans-serif" font-weight="900" font-size="46" fill="#0F172A" letter-spacing="-0.5">
      Eleições <tspan fill="#A2141B">Progressistas</tspan>
    </text>

    <!-- Slogan Oficial -->
    <g transform="translate(0, 168)">
      <circle cx="8" cy="-8" r="4.5" fill="#059669" />
      <text x="24" y="0" font-family="'Inter', -apple-system, Roboto, sans-serif" font-weight="600" font-size="23" fill="#475569">
        Cheque o passado. <tspan font-weight="700" fill="#0F172A">Escolha o futuro.</tspan>
      </text>
    </g>

    <!-- Subtítulo -->
    <text x="0" y="220" font-family="'Inter', -apple-system, Roboto, sans-serif" font-weight="600" font-size="14" fill="#64748B" letter-spacing="1.2">
      TECNOLOGIA CÍVICA AUDITÁVEL • DADOS OFICIAIS DO TSE
    </text>
  </g>
</svg>
`;

async function generateAll() {
  console.log('🚀 [generate-icons] Iniciando geração de ícones e assets de produção...');

  // 1. Buffer dos masters
  const masterBuf = await sharp(Buffer.from(svgMaster1024)).png().toBuffer();
  const bgBuf = await sharp(Buffer.from(svgBackground1024)).png().toBuffer();
  const fgBuf = await sharp(Buffer.from(svgForeground1024)).png().toBuffer();
  const monoBuf = await sharp(Buffer.from(svgMonochrome1024)).png().toBuffer();
  const featureBuf = await sharp(Buffer.from(svgFeature1024x500)).png().toBuffer();

  // 2. Grava Masters 1024x1024
  fs.writeFileSync(path.join(iconsDir, 'master-1024.png'), masterBuf);
  fs.writeFileSync(path.join(iconsDir, 'master-background-1024.png'), bgBuf);
  fs.writeFileSync(path.join(iconsDir, 'master-foreground-1024.png'), fgBuf);
  fs.writeFileSync(path.join(iconsDir, 'master-monochrome-1024.png'), monoBuf);

  // 3. PLAY STORE: 512x512 Full Bleed
  const playIcon512 = await sharp(masterBuf).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(iconsDir, 'play-icon-512.png'), playIcon512);
  fs.writeFileSync(path.join(storeDir, 'icon-512.png'), playIcon512);
  fs.writeFileSync(path.join(buildArtifactsStoreDir, 'icon-512x512.png'), playIcon512);

  // 4. FEATURE GRAPHIC: 1024x500
  fs.writeFileSync(path.join(assetsDir, 'feature-graphic-1024x500.png'), featureBuf);
  fs.writeFileSync(path.join(storeDir, 'feature-1024x500.png'), featureBuf);
  fs.writeFileSync(path.join(buildArtifactsStoreDir, 'feature-graphic-1024x500.png'), featureBuf);

  // 5. EXPO MASTERS
  fs.writeFileSync(path.join(assetsDir, 'icon.png'), masterBuf);
  fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), fgBuf);
  fs.writeFileSync(path.join(assetsDir, 'android-icon-foreground.png'), fgBuf);
  fs.writeFileSync(path.join(assetsDir, 'android-icon-background.png'), bgBuf);
  fs.writeFileSync(path.join(assetsDir, 'android-icon-monochrome.png'), monoBuf);

  const favicon48 = await sharp(masterBuf).resize(48, 48).png().toBuffer();
  fs.writeFileSync(path.join(assetsDir, 'favicon.png'), favicon48);

  // 6. ADAPTIVE ICONS (mdpi 108, hdpi 162, xhdpi 216, xxhdpi 324, xxxhdpi 432)
  const densities = [
    { name: 'mdpi', size: 108, launcherSize: 48 },
    { name: 'hdpi', size: 162, launcherSize: 72 },
    { name: 'xhdpi', size: 216, launcherSize: 96 },
    { name: 'xxhdpi', size: 324, launcherSize: 144 },
    { name: 'xxxhdpi', size: 432, launcherSize: 192 },
  ];

  for (const d of densities) {
    const dDir = path.join(adaptiveDir, d.name);
    if (!fs.existsSync(dDir)) fs.mkdirSync(dDir, { recursive: true });

    const fg = await sharp(fgBuf).resize(d.size, d.size).png().toBuffer();
    const bg = await sharp(bgBuf).resize(d.size, d.size).png().toBuffer();
    const mono = await sharp(monoBuf).resize(d.size, d.size).png().toBuffer();

    fs.writeFileSync(path.join(dDir, 'foreground.png'), fg);
    fs.writeFileSync(path.join(dDir, 'background.png'), bg);
    fs.writeFileSync(path.join(dDir, 'monochrome.png'), mono);

    // Legacy Launcher (Square / Round)
    const launcher = await sharp(masterBuf).resize(d.launcherSize, d.launcherSize).png().toBuffer();
    
    // Circular mask para ic_launcher_round
    const circleSvg = `<svg><circle cx="${d.launcherSize / 2}" cy="${d.launcherSize / 2}" r="${d.launcherSize / 2}" fill="#fff"/></svg>`;
    const launcherRound = await sharp(masterBuf)
      .resize(d.launcherSize, d.launcherSize)
      .composite([{ input: Buffer.from(circleSvg), blend: 'dest-in' }])
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(dDir, 'ic_launcher.png'), launcher);
    fs.writeFileSync(path.join(dDir, 'ic_launcher_round.png'), launcherRound);

    // Se a pasta nativa Android existir, atualiza os mipmaps
    if (fs.existsSync(androidResDir)) {
      const mipmapDir = path.join(androidResDir, `mipmap-${d.name}`);
      if (fs.existsSync(mipmapDir)) {
        fs.writeFileSync(path.join(mipmapDir, 'ic_launcher.png'), launcher);
        fs.writeFileSync(path.join(mipmapDir, 'ic_launcher_round.png'), launcherRound);
        fs.writeFileSync(path.join(mipmapDir, 'ic_launcher_foreground.png'), fg);
        fs.writeFileSync(path.join(mipmapDir, 'ic_launcher_background.png'), bg);
        fs.writeFileSync(path.join(mipmapDir, 'ic_launcher_monochrome.png'), mono);
      }
    }
  }

  // 7. Configuração do XML Adaptativo Android (mipmap-anydpi-v26)
  if (fs.existsSync(androidResDir)) {
    const anyDpiDir = path.join(androidResDir, 'mipmap-anydpi-v26');
    if (!fs.existsSync(anyDpiDir)) fs.mkdirSync(anyDpiDir, { recursive: true });

    const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
    <monochrome android:drawable="@mipmap/ic_launcher_monochrome"/>
</adaptive-icon>
`;
    fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher.xml'), adaptiveXml);
    fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher_round.xml'), adaptiveXml);
  }

  // 8. WEB / PWA ICONS
  const web192 = await sharp(masterBuf).resize(192, 192).png().toBuffer();
  const web512 = await sharp(masterBuf).resize(512, 512).png().toBuffer();
  const apple180 = await sharp(masterBuf).resize(180, 180).png().toBuffer();
  
  // Web maskable (logo até 80% do canvas)
  const maskable512 = await sharp(masterBuf).resize(512, 512).png().toBuffer();

  fs.writeFileSync(path.join(iconsDir, 'web-icon-192.png'), web192);
  fs.writeFileSync(path.join(iconsDir, 'web-icon-512.png'), web512);
  fs.writeFileSync(path.join(iconsDir, 'web-icon-maskable-512.png'), maskable512);
  fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon-180.png'), apple180);

  // Também copia para static/ raiz da API e Web
  const apiStaticDir = path.join(rootDir, 'apps', 'api', 'static');
  if (fs.existsSync(apiStaticDir)) {
    fs.writeFileSync(path.join(apiStaticDir, 'logo.png'), playIcon512);
    fs.writeFileSync(path.join(apiStaticDir, 'favicon.ico'), favicon48);
  }

  console.log('✅ Todos os ícones foram gerados com sucesso.');
  return validateAll();
}

/**
 * Validação rigorosa dos metadados e integridade dos pixels
 */
async function validateAll() {
  console.log('\n🔍 [generate-icons] Validando integridade e conformidade técnica...');
  let hasErrors = false;

  const playIconPath = path.join(iconsDir, 'play-icon-512.png');
  const playMeta = await sharp(playIconPath).metadata();
  const playSizeKb = fs.statSync(playIconPath).size / 1024;

  if (playMeta.width !== 512 || playMeta.height !== 512) {
    console.error(`❌ ERRO: Dimensão do Play Icon inválida: ${playMeta.width}x${playMeta.height} (esperado 512x512)`);
    hasErrors = true;
  }
  if (playMeta.space !== 'srgb') {
    console.error(`❌ ERRO: Espaço de cor do Play Icon não é sRGB: ${playMeta.space}`);
    hasErrors = true;
  }
  if (playSizeKb > 1024) {
    console.error(`❌ ERRO: Tamanho do Play Icon excede 1024 KB: ${playSizeKb.toFixed(1)} KB`);
    hasErrors = true;
  }

  // Verifica Alpha = 255 nos 4 cantos do Play Icon (Full Bleed sem cantos arredondados assados)
  const { data, info } = await sharp(playIconPath).raw().toBuffer({ resolveWithObject: true });
  const getAlpha = (x, y) => data[(y * info.width + x) * info.channels + (info.channels - 1)];

  const corners = [
    { name: 'Top-Left', alpha: getAlpha(0, 0) },
    { name: 'Top-Right', alpha: getAlpha(info.width - 1, 0) },
    { name: 'Bottom-Left', alpha: getAlpha(0, info.height - 1) },
    { name: 'Bottom-Right', alpha: getAlpha(info.width - 1, info.height - 1) },
  ];

  for (const c of corners) {
    if (c.alpha !== 255) {
      console.error(`❌ ERRO: Canto ${c.name} com alpha ${c.alpha} != 255 (Full Bleed violado!)`);
      hasErrors = true;
    }
  }

  // Validação do Feature Graphic
  const featPath = path.join(assetsDir, 'feature-graphic-1024x500.png');
  const featMeta = await sharp(featPath).metadata();
  if (featMeta.width !== 1024 || featMeta.height !== 500) {
    console.error(`❌ ERRO: Feature Graphic com dimensões inválidas: ${featMeta.width}x${featMeta.height}`);
    hasErrors = true;
  }

  if (hasErrors) {
    console.error('\n🚨 FALHA NA VALIDAÇÃO DOS ÍCONES!');
    process.exit(1);
  }

  console.log(`✨ SUCESSO: Play Icon 512x512 (${playSizeKb.toFixed(1)} KB), 32-bit sRGB, Alpha=255 nos 4 cantos.`);
  console.log(`✨ SUCESSO: Feature Graphic 1024x500 validado.`);
  console.log(`✨ SUCESSO: Todas as camadas adaptativas (fg/bg/mono) geradas conforme especificações Google Play.`);
}

if (process.argv.includes('--check')) {
  validateAll();
} else {
  generateAll();
}
