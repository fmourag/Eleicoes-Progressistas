process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const https = require('https');
const fs = require('fs');
const path = require('path');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'NodeJS' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(get(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return resolve({ status: res.statusCode });
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: 200, json: JSON.parse(data) });
        } catch (e) {
          resolve({ status: 200, raw: data });
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'NodeJS' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadFile(res.headers.location, dest));
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Failed to download: status ' + res.statusCode));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function loop() {
  const rootDir = path.resolve(__dirname, '..');
  const appJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'apps', 'mobile', 'app.json'), 'utf8'));
  const tag = process.argv[2] || `v${appJson.expo.version}`;
  console.log(`Buscando release para a tag: ${tag}`);

  const startTime = Date.now();
  const maxWait = 20 * 60 * 1000; // 20 minutes

  while (Date.now() - startTime < maxWait) {
    const timeStr = new Date().toLocaleTimeString('pt-BR');
    console.log(`[${timeStr}] Verificando status do build no GitHub...`);

    const runsRes = await get('https://api.github.com/repos/fmourag/Eleicoes-Progressistas/actions/runs?per_page=5');
    let buildRun = null;
    if (runsRes.json && runsRes.json.workflow_runs) {
      buildRun = runsRes.json.workflow_runs.find(r => r.name === 'Build Android APK' && r.head_branch === tag);
      if (buildRun) {
        console.log(`  -> Status do Workflow [Build Android APK]: ${buildRun.status} (${buildRun.conclusion || 'em andamento'})`);
      }
    }

    const relRes = await get(`https://api.github.com/repos/fmourag/Eleicoes-Progressistas/releases/tags/${tag}`);
    if (relRes.status === 200 && relRes.json && relRes.json.assets && relRes.json.assets.length > 0) {
      const rel = relRes.json;
      console.log(`\n🎉 Release ${tag} encontrada com ${rel.assets.length} arquivo(s)!`);
      const targetDir = path.resolve(__dirname, '..', 'build_artifacts');
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      for (const asset of rel.assets) {
        const mb = (asset.size / (1024 * 1024)).toFixed(2);
        console.log(`-> Baixando ${asset.name} (${mb} MB)...`);
        const dest = path.join(targetDir, asset.name);
        await downloadFile(asset.browser_download_url, dest);
        console.log(`   Salvo em: ${dest}`);
      }

      console.log('\n✅ TODOS OS ARQUIVOS FORAM BAIXADOS COM SUCESSO EM build_artifacts/');
      return;
    }

    if (buildRun && buildRun.status === 'completed' && buildRun.conclusion !== 'success') {
      console.error(`\n❌ O workflow falhou no GitHub Actions com conclusão: ${buildRun.conclusion}`);
      process.exit(1);
    }

    // Wait 30 seconds before next check
    await new Promise(r => setTimeout(r, 30000));
  }

  console.error('Tempo limite de espera esgotado.');
  process.exit(1);
}

loop().catch((err) => {
  console.error('Erro:', err);
  process.exit(1);
});
