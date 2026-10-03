const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.resolve('apps/api/static/candidates'),
  path.resolve('apps/api/public/candidates'),
  path.resolve('apps/mobile/public/candidates'),
  path.resolve('static/candidates'),
];

for (const d of targetDirs) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function saveToAll(filename, buffer) {
  for (const dir of targetDirs) {
    fs.writeFileSync(path.join(dir, filename), buffer);
  }
  console.log(`[SAVED] ${filename} (${buffer.length} bytes) to ${targetDirs.length} dirs`);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchBufferWithRetry(url, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });
      if (res.status === 429) {
        console.warn(`[429 RATE LIMIT] on ${url}, waiting ${attempt * 3000}ms...`);
        await sleep(attempt * 3000);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ab = await res.arrayBuffer();
      return Buffer.from(ab);
    } catch (e) {
      if (attempt === maxRetries) throw e;
      console.warn(`[RETRY ${attempt}] ${url}: ${e.message}`);
      await sleep(attempt * 2000);
    }
  }
}

const downloads = [
  // Sofia Manzano (PCB)
  {
    filenames: ['pres_sofia.jpg', 'pcb_sofiamanzano.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Sofia_Manzano.png',
  },
  // Mauro Iasi (PCB)
  {
    filenames: ['pcb_mauroiasi.jpg', 'sen_rj_mauroiasi.jpg', 'dep_rj_mauroiasi.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Mauro_Iasi_no_Senado.png/500px-Mauro_Iasi_no_Senado.png',
  },
  // Ivan Pinheiro (PCB)
  {
    filenames: ['pcb_ivanpinheiro.jpg', 'ale_rj_ivan.jpg', 'dep_rj_ivan.jpg', 'sen_rj_ivan.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Ivan_Pinheiro_em_2023.jpg/500px-Ivan_Pinheiro_em_2023.jpg',
  },
  // Jones Manoel (PCB)
  {
    filenames: ['pcb_jonesmanoel.jpg', 'ale_pe_jones.jpg', 'dep_pe_jones.jpg', 'sen_pe_jones.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Jones_Manoel.jpg',
  },
  // Eduardo Serra (PCB)
  {
    filenames: ['pcb_eduardoserra.jpg', 'gov_rj_eduardoserra.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Eduardo_Serra_%28PCB-RJ%29.webp',
  },
  // Juliete Pantoja (UP)
  {
    filenames: ['gov_rj_juliete.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/37/FOTO_JULIETE_PANTOJA_2026.jpg',
  },
  // Cyro Garcia (PSTU)
  {
    filenames: ['gov_rj_cyro.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/FOTO_CYRO_GARCIA_2026.jpg',
  },
  // Manuela d'Ávila (PCdoB)
  {
    filenames: ['pcdob_manueladavila.jpg', 'sen_rs_manuela.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Manuela_d%27%C3%81vila_em_mar%C3%A7o_de_2025.jpg/500px-Manuela_d%27%C3%81vila_em_mar%C3%A7o_de_2025.jpg',
  },
  // Luciana Santos (PCdoB)
  {
    filenames: ['pcdob_lucianasantos.jpg', 'gov_pe_luciana.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/2023_-_CERIM%C3%94NIA_DE_TRANSMISS%C3%83O_DO_CARGO_DE_MINISTRO_DE_ESTADO_DA_CI%C3%8ANCIA%2C_TECNOLOGIA_E_INOVA%C3%87%C3%83O_-_52602647182.jpg/500px-2023_-_CERIM%C3%94NIA_DE_TRANSMISS%C3%83O_DO_CARGO_DE_MINISTRO_DE_ESTADO_DA_CI%C3%8ANCIA%2C_TECNOLOGIA_E_INOVA%C3%87%C3%83O_-_52602647182.jpg',
  },
  // Jandira Feghali (PCdoB)
  {
    filenames: ['dep_74848.jpg', 'dep_fed_jandira_feghali.jpg'],
    url: 'https://www.camara.leg.br/internet/deputado/bandep/74848.jpg',
  },
  // Alice Portugal (PCdoB)
  {
    filenames: ['dep_74057.jpg', 'dep_fed_alice_portugal.jpg'],
    url: 'https://www.camara.leg.br/internet/deputado/bandep/74057.jpg',
  },
  // Daniel Almeida (PCdoB)
  {
    filenames: ['dep_74060.jpg'],
    url: 'https://www.camara.leg.br/internet/deputado/bandep/74060.jpg',
  },
  // Daiana Santos (PCdoB)
  {
    filenames: ['dep_220545.jpg'],
    url: 'https://www.camara.leg.br/internet/deputado/bandep/220545.jpg',
  },
  // Renildo Calheiros (PCdoB)
  {
    filenames: ['dep_73808.jpg'],
    url: 'https://www.camara.leg.br/internet/deputado/bandep/73808.jpg',
  },
  // Marcivânia (PCdoB)
  {
    filenames: ['dep_160538.jpg'],
    url: 'https://www.camara.leg.br/internet/deputado/bandep/160538.jpg',
  },
  // Perpétua Almeida (PCdoB)
  {
    filenames: ['dep_74075.jpg'],
    url: 'https://www.camara.leg.br/internet/deputado/bandep/74075.jpg',
  },
  // Vanessa Grazziotin (PCdoB)
  {
    filenames: ['dep_74079.jpg'],
    url: 'https://www.camara.leg.br/internet/deputado/bandep/74079.jpg',
  },
  // Márcio Jerry (PCdoB)
  {
    filenames: ['dep_204489.jpg'],
    url: 'https://www.camara.leg.br/internet/deputado/bandep/204489.jpg',
  },
  // Eduardo Suplicy (PT)
  {
    filenames: ['ale_sp_suplicy.jpg', '280001600018.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Eduardo_Suplicy_2013.JPG/500px-Eduardo_Suplicy_2013.JPG',
  },
  // Lídice da Mata (PSB)
  {
    filenames: ['sen_ba_lidice.jpg', '280001600012.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/L%C3%ADdice_da_Mata_in_2023.jpg/500px-L%C3%ADdice_da_Mata_in_2023.jpg',
  },
];

(async () => {
  console.log('=== STARTING ROBUST PHOTO SYNC ===');
  for (const item of downloads) {
    try {
      console.log(`Fetching ${item.filenames[0]} from ${item.url}...`);
      const buf = await fetchBufferWithRetry(item.url);
      for (const fn of item.filenames) {
        saveToAll(fn, buf);
      }
      await sleep(1500); // polite pause between downloads
    } catch (e) {
      console.error(`[ERROR] Failed to fetch ${item.url}:`, e.message);
    }
  }

  // Copy local Gabriel Colombo and Carlos Machado if valid
  const colomboSource = path.resolve('apps/api/static/candidates/dep_sp_colombo.jpg');
  if (fs.existsSync(colomboSource) && fs.statSync(colomboSource).size > 2000) {
    const buf = fs.readFileSync(colomboSource);
    saveToAll('pcb_gabrielcolombo.jpg', buf);
    saveToAll('sen_sp_colombo.jpg', buf);
  }

  console.log('=== PHOTO SYNC COMPLETED ===');
})();
