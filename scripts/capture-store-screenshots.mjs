import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import sharp from 'sharp';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outBaseDir = path.join(rootDir, 'build_artifacts', 'store_assets', 'screenshots');

const phoneDir = path.join(outBaseDir, 'phone');
const t7Dir = path.join(outBaseDir, 'tablet7');
const t10Dir = path.join(outBaseDir, 'tablet10');

[phoneDir, t7Dir, t10Dir].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const BASE_URL = 'https://eleicoes-progressistas.onrender.com';

const VIEWPORTS = [
  { id: 'phone', label: 'phone 1080×1920', dir: phoneDir, width: 540, height: 960, scale: 2, targetW: 1080, targetH: 1920 },
  { id: 'tablet7', label: 'tablet7 2048×1152', dir: t7Dir, width: 1024, height: 576, scale: 2, targetW: 2048, targetH: 1152 },
  { id: 'tablet10', label: 'tablet10 2560×1440', dir: t10Dir, width: 1280, height: 720, scale: 2, targetW: 2560, targetH: 1440 },
];

const SEED_COLA = {
  PRESIDENTE: {
    id: 'pres_lula',
    name: 'LUIZ INÁCIO LULA DA SILVA',
    viceName: 'Geraldo Alckmin',
    cargo: 'PRESIDENTE',
    party: 'PT',
    partyNumber: 13,
    numeroUrna: '13',
    tseId: '280001600001',
    photoUrl: '/candidates/280001600001.jpg',
    fichaLimpa: true,
  },
  GOVERNADOR: {
    id: 'gov_rj_paes',
    name: 'EDUARDO PAES',
    viceName: 'Eduardo Cavaliere',
    cargo: 'GOVERNADOR',
    party: 'PSD',
    partyNumber: 55,
    numeroUrna: '55',
    tseId: '190002534190',
    photoUrl: '/candidates/gov_rj_paes.jpg',
    state: 'RJ',
    fichaLimpa: true,
  },
  SENADOR_1: {
    id: 'sen_rj_benedita',
    name: 'BENEDITA DA SILVA',
    cargo: 'SENADOR',
    party: 'PT',
    partyNumber: 13,
    numeroUrna: '131',
    tseId: '190002536116',
    photoUrl: '/candidates/190002536116.jpg',
    state: 'RJ',
    fichaLimpa: true,
  },
  SENADOR_2: {
    id: 'sen_rj_lindbergh',
    name: 'LINDBERGH FARIAS',
    cargo: 'SENADOR',
    party: 'PT',
    partyNumber: 13,
    numeroUrna: '133',
    tseId: '190002536118',
    photoUrl: '/candidates/100002534190.jpg',
    state: 'RJ',
    fichaLimpa: true,
  },
  DEPUTADO_FEDERAL: {
    id: 'dep_fed_reimont',
    name: 'REIMONT LUIZ',
    cargo: 'DEPUTADO_FEDERAL',
    party: 'PT',
    partyNumber: 13,
    numeroUrna: '1333',
    tseId: '190002536117',
    photoUrl: '/candidates/100002534190.jpg',
    state: 'RJ',
    fichaLimpa: true,
  },
  DEPUTADO_ESTADUAL: {
    id: 'dep_est_raul',
    name: 'PROFESSOR RAUL',
    cargo: 'DEPUTADO_ESTADUAL',
    party: 'REDE',
    partyNumber: 18,
    numeroUrna: '18345',
    tseId: '190002536116',
    photoUrl: '/candidates/190002536116.jpg',
    state: 'RJ',
    fichaLimpa: true,
  },
};

const SEED_CIVIC_SUPPORT = {
  hasContributed: true,
  contributionDate: new Date().toISOString(),
  pixKey: '+5521971943298',
  pixKeyType: 'CELULAR',
  amount: 3,
  updatedAt: new Date().toISOString(),
};

async function dismissModals(page) {
  const dismissPatterns = [
    /ver todos os candidatos/i,
    /agora não/i,
    /continuar sem/i,
    /recusar/i,
    /fechar/i,
    /entendi/i,
  ];

  for (const pat of dismissPatterns) {
    try {
      const btn = page.getByRole('button', { name: pat }).or(page.getByText(pat)).first();
      if (await btn.isVisible({ timeout: 1200 })) {
        await btn.click({ timeout: 1200, force: true });
        await page.waitForTimeout(300);
      }
    } catch {}
  }
}

async function captureScreenTrio(page, screenSlug) {
  const capturedFiles = [];

  for (const vp of VIEWPORTS) {
    // Regra 2: Mesma sessão SPA sem recarregar
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(1000);

    const rawBuf = await page.screenshot({ fullPage: false });
    const targetPath = path.join(vp.dir, `${screenSlug}.png`);

    // Regra 1: Pós-processamento sharp sem alpha (RGB 24-bit, canais=3, <= 8MB)
    await sharp(rawBuf)
      .resize(vp.targetW, vp.targetH, { fit: 'cover', position: 'top' })
      .flatten({ background: '#FFFFFF' })
      .removeAlpha()
      .png({ compressionLevel: 9 })
      .toFile(targetPath);

    const stat = fs.statSync(targetPath);
    const meta = await sharp(targetPath).metadata();

    capturedFiles.push({
      vp: vp.id,
      path: targetPath,
      width: meta.width,
      height: meta.height,
      channels: meta.channels,
      sizeKb: (stat.size / 1024).toFixed(1),
      valid: meta.width === vp.targetW && meta.height === vp.targetH && meta.channels === 3 && stat.size <= 8 * 1024 * 1024,
    });
  }

  return capturedFiles;
}

async function run() {
  console.log('🚀 [capture-screenshots] Iniciando automação Playwright Headless...');

  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch {
    try {
      browser = await chromium.launch({ channel: 'msedge', headless: true });
    } catch {
      browser = await chromium.launch({ headless: true });
    }
  }

  const context = await browser.newContext({
    viewport: { width: 540, height: 960 },
    deviceScaleFactor: 2,
  });

  // Semeia localStorage antes de cada navegação
  await context.addInitScript(({ cola, civic }) => {
    try {
      window.localStorage.setItem('np_cola_eleitoral_v2', JSON.stringify(cola));
      window.localStorage.setItem('@eleicoes_progressistas:civic_support', JSON.stringify(civic));
      window.localStorage.setItem('np_user_location', JSON.stringify({ uf: 'RJ', municipality: 'Rio de Janeiro', ibge_code: '3304557' }));
    } catch {}
  }, { cola: SEED_COLA, civic: SEED_CIVIC_SUPPORT });

  const page = await context.newPage();
  const allResults = {};

  try {
    // ─────────────────────────────────────────────────────────────
    // TELA 1: 01-home
    // ─────────────────────────────────────────────────────────────
    console.log('\n📸 Capturando [01-home]...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await dismissModals(page);
    await page.waitForTimeout(1500);
    allResults['01-home'] = await captureScreenTrio(page, '01-home');

    // ─────────────────────────────────────────────────────────────
    // TELA 2: 02-candidatos
    // ─────────────────────────────────────────────────────────────
    console.log('📸 Capturando [02-candidatos]...');
    await page.goto(`${BASE_URL}/candidatos`, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await dismissModals(page);
    // Aguarda carregar dados de candidatos
    await page.waitForTimeout(4000);
    try {
      await page.evaluate(() => window.scrollBy(0, 180));
    } catch {}
    await page.waitForTimeout(1000);
    allResults['02-candidatos'] = await captureScreenTrio(page, '02-candidatos');

    // ─────────────────────────────────────────────────────────────
    // TELA 3: 03-matching
    // ─────────────────────────────────────────────────────────────
    console.log('📸 Capturando [03-matching]...');
    await page.goto(`${BASE_URL}/matching`, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await dismissModals(page);
    await page.waitForTimeout(3000);

    // Tenta clicar nas prioridades para gerar os cards de matching
    try {
      const pills = await page.getByText(/Educação|Saúde|Combate|Direitos|Segurança|Trabalho|Clima/i).all();
      for (let i = 0; i < Math.min(pills.length, 3); i++) {
        await pills[i].click({ timeout: 1000 }).catch(() => {});
      }
    } catch {}
    await page.waitForTimeout(1500);
    allResults['03-matching'] = await captureScreenTrio(page, '03-matching');

    // ─────────────────────────────────────────────────────────────
    // TELA 4: 04-cola
    // ─────────────────────────────────────────────────────────────
    console.log('📸 Capturando [04-cola]...');
    await page.goto(`${BASE_URL}/cola`, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await dismissModals(page);
    await page.waitForTimeout(3000);
    allResults['04-cola'] = await captureScreenTrio(page, '04-cola');

    // ─────────────────────────────────────────────────────────────
    // TELA 5: 05-apuracao
    // ─────────────────────────────────────────────────────────────
    console.log('📸 Capturando [05-apuracao]...');
    await page.goto(`${BASE_URL}/apuracao`, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await dismissModals(page);
    await page.waitForTimeout(2000);

    try {
      const simToggle = page.getByText(/Ativar Teste|Simula/i).first();
      if (await simToggle.isVisible({ timeout: 2000 })) {
        await simToggle.click({ timeout: 1500 });
        await page.waitForTimeout(2000);
      }
    } catch {}
    allResults['05-apuracao'] = await captureScreenTrio(page, '05-apuracao');

  } catch (err) {
    console.error('⚠️ Erro durante fluxo:', err);
  } finally {
    await browser.close();
  }

  // ─────────────────────────────────────────────────────────────
  // RELATÓRIO E VALIDAÇÃO FINAL
  // ─────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(90));
  console.log('📊 RELATÓRIO DE VALIDAÇÃO DOS 15 ASSETS DE SCREENSHOT:');
  console.log('='.repeat(90));

  let totalValid = 0;
  let totalCount = 0;

  for (const [slug, results] of Object.entries(allResults)) {
    for (const r of results) {
      totalCount++;
      if (r.valid) totalValid++;
      const status = r.valid ? '✅' : '❌';
      console.log(`${slug.padEnd(14)} | ${r.vp.padEnd(9)} | ${r.width}x${r.height} | canais=${r.channels} | ${r.sizeKb.padStart(7)} KB | ${status}`);
    }
  }

  console.log('='.repeat(90));
  console.log(`Total: ${totalValid}/${totalCount} capturas aprovadas rigorosamente nas especificações da Google Play.`);

  if (totalValid < 15) {
    console.error(`🚨 FALHA: Apenas ${totalValid} de 15 capturas foram geradas com sucesso.`);
    process.exit(1);
  }

  console.log('🎉 SUCESSO: Todos os 15 assets estão gerados e prontos em build_artifacts/store_assets/screenshots/');
}

run();
