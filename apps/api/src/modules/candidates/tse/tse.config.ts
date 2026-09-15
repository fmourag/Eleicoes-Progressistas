import * as path from 'path';
import * as fs from 'fs';

const isSubdir = fs.existsSync(path.resolve(process.cwd(), 'apps/api'));
const photoDir = isSubdir
  ? path.resolve(process.cwd(), 'apps/api/public/candidates')
  : path.resolve(process.cwd(), 'public/candidates');

export const TSE_CONFIG = {
  // URLs
  API_BASE_URL: 'https://divulgacandcontas.tse.jus.br/divulga/rest/v1',
  PHOTO_BASE_URL: 'https://divulgacandcontas.tse.jus.br/divulgacand/rest/v1/candidatura/buscar/foto',
  FALLBACK_CSV_URL: 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2026.zip',
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',

  // Defaults
  DEFAULT_ANO: 2026,
  DEFAULT_ELEICAO_ID: '2045202026',
  RATE_LIMIT_DELAY_MS: 1000,
  MAX_RETRIES: 3,

  // Storage
  PHOTO_STORAGE_DIR: photoDir,
  PHOTO_PUBLIC_PATH: '/public/candidates',

  // Coverage
  ALL_UFS: [
    'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
    'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO', 'BR',
  ],

  CARGOS: [
    { codigo: 1, nome: 'Presidente' },
    { codigo: 3, nome: 'Governador' },
    { codigo: 5, nome: 'Senador' },
    { codigo: 6, nome: 'Deputado Federal' },
    { codigo: 7, nome: 'Deputado Estadual' },
    { codigo: 8, nome: 'Deputado Distrital' },
  ],
};
