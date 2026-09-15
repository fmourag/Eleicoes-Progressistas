import { PrismaClient, Cargo, ElectionLevel, CandidaturaStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

dotenv.config({ path: path.resolve(__dirname, '../apps/api/.env') });

const prisma = new PrismaClient();
const isApply = process.argv.includes('--apply');

interface CsvCandidate {
  ano: number;
  uf: string;
  cdCargo: number;
  dsCargo: string;
  sqCandidato: string;
  nrCandidato: string;
  nmCandidato: string;
  nmUrna: string;
  cdSituacao: string;
  dsSituacao: string;
  nrPartido: number;
  sgPartido: string;
  nmPartido: string;
  sqColigacao: string;
  dsComposicaoColigacao: string;
  viceName?: string;
  rawRow: Record<string, string>;
}

function normalizeStr(str?: string | null): string {
  if (!str) return '';
  return str
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '');
}

const CORE_PROGRESSIVE_PARTIES = new Set([
  'PT',
  'PSOL',
  'PCDOB',
  'PV',
  'REDE',
  'PDT',
  'PSB',
  'UP',
  'PCB',
  'PCO',
  'PSTU',
]);

function isProgressiveParty(sgPartido: string): boolean {
  const norm = normalizeStr(sgPartido);
  return CORE_PROGRESSIVE_PARTIES.has(norm);
}

function mapRole(cdCargo: number | string): Cargo {
  const cd = Number(cdCargo);
  if (cd === 1) return Cargo.PRESIDENTE;
  if (cd === 3) return Cargo.GOVERNADOR;
  if (cd === 5) return Cargo.SENADOR;
  if (cd === 6) return Cargo.DEPUTADO_FEDERAL;
  if (cd === 7 || cd === 8) return Cargo.DEPUTADO_ESTADUAL;
  return Cargo.DEPUTADO_ESTADUAL;
}

function mapLevel(cargo: Cargo): ElectionLevel {
  if (cargo === Cargo.PRESIDENTE || cargo === Cargo.SENADOR || cargo === Cargo.DEPUTADO_FEDERAL) {
    return ElectionLevel.FEDERAL;
  }
  if (cargo === Cargo.GOVERNADOR || cargo === Cargo.DEPUTADO_ESTADUAL) {
    return ElectionLevel.ESTADUAL;
  }
  return ElectionLevel.MUNICIPAL;
}

function mapStatus(situacaoCandidato?: string): CandidaturaStatus {
  const sit = (situacaoCandidato || '').toUpperCase();
  if (sit.includes('INDEFERIDO') || sit.includes('CANCELADO') || sit.includes('INAPTO')) {
    return CandidaturaStatus.INDEFERIDO;
  }
  if (sit.includes('CASSADO')) return CandidaturaStatus.CASSADO;
  if (sit.includes('RENUNCIA')) return CandidaturaStatus.RENUNCIA;
  if (sit.includes('DEFERIDO') || sit.includes('APTO')) return CandidaturaStatus.DEFERIDO;
  return CandidaturaStatus.EM_ANALISE;
}

function generateDefaultMatchingProfile(): Record<string, number> {
  const scores: Record<string, number> = {};
  for (let i = 1; i <= 13; i++) {
    scores[`p${i}`] = 0.5;
  }
  return scores;
}

function generateCpfHash(tseId: string): string {
  return crypto.createHash('sha256').update(`tse_cpf_${tseId}`).digest('hex');
}

async function parseCsvFile(filePath: string): Promise<{
  titulares: Map<string, CsvCandidate>;
  vicesByColigacao: Map<string, CsvCandidate>;
}> {
  const titulares = new Map<string, CsvCandidate>();
  const vicesByColigacao = new Map<string, CsvCandidate>();

  const stream = fs.createReadStream(filePath, { encoding: 'latin1' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let header: string[] = [];

  for await (const line of rl) {
    if (!line || !line.trim()) continue;
    if (!header.length) {
      header = line.split(';').map((h) => h.replace(/^"|"$/g, '').trim());
      continue;
    }

    const parts = line.split(';').map((c) => c.replace(/^"|"$/g, '').trim());
    if (parts.length < header.length) continue;

    const ano = Number(parts[header.indexOf('ANO_ELEICAO')]);
    if (ano !== 2026) continue;

    const cdCargo = Number(parts[header.indexOf('CD_CARGO')]);
    if (![1, 2, 3, 4, 5, 6, 7, 8].includes(cdCargo)) continue;

    const rawRow: Record<string, string> = {};
    for (let i = 0; i < header.length; i++) {
      rawRow[header[i]] = parts[i] || '';
    }

    const uf = parts[header.indexOf('SG_UF')].toUpperCase();
    const dsCargo = parts[header.indexOf('DS_CARGO')].toUpperCase();
    const sqCandidato = parts[header.indexOf('SQ_CANDIDATO')];
    const nrCandidato = parts[header.indexOf('NR_CANDIDATO')];
    const nmCandidato = parts[header.indexOf('NM_CANDIDATO')];
    const nmUrna = parts[header.indexOf('NM_URNA_CANDIDATO')];
    const cdSituacao = parts[header.indexOf('CD_SITUACAO_CANDIDATURA')];
    const dsSituacao = parts[header.indexOf('DS_SITUACAO_CANDIDATURA')];
    const nrPartido = Number(parts[header.indexOf('NR_PARTIDO')]);
    const sgPartido = parts[header.indexOf('SG_PARTIDO')].toUpperCase();
    const nmPartido = parts[header.indexOf('NM_PARTIDO')];
    const sqColigacao = parts[header.indexOf('SQ_COLIGACAO')];
    const dsComposicaoColigacao = parts[header.indexOf('DS_COMPOSICAO_COLIGACAO')];

    const cand: CsvCandidate = {
      ano,
      uf,
      cdCargo,
      dsCargo,
      sqCandidato,
      nrCandidato,
      nmCandidato,
      nmUrna,
      cdSituacao,
      dsSituacao,
      nrPartido,
      sgPartido,
      nmPartido,
      sqColigacao,
      dsComposicaoColigacao,
      rawRow,
    };

    if (cdCargo === 2 || cdCargo === 4) {
      vicesByColigacao.set(`${uf}_${sqColigacao}`, cand);
      vicesByColigacao.set(`${uf}_${nrCandidato.substring(0, 2)}`, cand);
    } else {
      titulares.set(sqCandidato, cand);
    }
  }

  for (const [sq, tit] of titulares.entries()) {
    if (tit.cdCargo === 1 || tit.cdCargo === 3) {
      const vice =
        vicesByColigacao.get(`${tit.uf}_${tit.sqColigacao}`) ||
        vicesByColigacao.get(`${tit.uf}_${tit.nrCandidato.substring(0, 2)}`);
      if (vice) {
        tit.viceName = vice.nmUrna || vice.nmCandidato;
      }
    }
  }

  return { titulares, vicesByColigacao };
}

async function main() {
  console.log('========================================================================');
  console.log(` ⚙️  RECONCILIAÇÃO NACIONAL TSE 2026 — MODO: ${isApply ? 'APLICAR (--apply)' : 'SIMULAÇÃO (--dry-run)'}`);
  console.log('========================================================================\n');

  const csvDir = path.resolve(__dirname, '../tmp/extracted');
  if (!fs.existsSync(csvDir)) {
    throw new Error(`Diretório ${csvDir} não encontrado. Extraia consulta_cand_2026.zip primeiro.`);
  }

  const csvFiles = fs
    .readdirSync(csvDir)
    .filter((f) => f.startsWith('consulta_cand_2026_') && f.endsWith('.csv') && !f.includes('BRASIL'));

  console.log(`[1/5] Carregando Ground Truth TSE de ${csvFiles.length} arquivos estaduais...`);

  const referenceMap = new Map<string, CsvCandidate>();

  for (const file of csvFiles) {
    const filePath = path.join(csvDir, file);
    const { titulares } = await parseCsvFile(filePath);
    for (const [sq, cand] of titulares.entries()) {
      referenceMap.set(sq, cand);
    }
  }

  console.log(`[OK] Total de candidaturas oficiais TSE apuradas: ${referenceMap.size}`);

  console.log('\n[2/5] Lendo base de candidatos do banco de produção...');
  const dbCandidates = await prisma.candidate.findMany();
  console.log(`[OK] Total de candidatos no banco atual: ${dbCandidates.length}`);

  let updatedCount = 0;
  let phantomsHiddenCount = 0;
  let nonProgressiveHiddenCount = 0;
  let vicesCorrectedCount = 0;
  let missingInsertedCount = 0;

  const matchedTseIds = new Set<string>();

  console.log('\n[3/5] Reconciliando candidatos existentes no banco com o TSE...');

  for (const cand of dbCandidates) {
    // 1. Legados / Mocks sem tseId numérico oficial do TSE 2026
    if (!cand.tseId || !/^\d{11,13}$/.test(cand.tseId)) {
      phantomsHiddenCount++;
      if (isApply) {
        await prisma.candidate.update({
          where: { id: cand.id },
          data: {
            visible: false,
            source: 'LEGACY_PHANTOM',
            tseValidated: false,
          },
        });
      }
      continue;
    }

    // 2. Procurar na referência oficial TSE 2026
    const matchedRef = referenceMap.get(cand.tseId);

    if (!matchedRef) {
      // Registrado com tseId mas não consta no arquivo 2026 oficial (ex: cancelado ou de outro ano)
      phantomsHiddenCount++;
      if (isApply) {
        await prisma.candidate.update({
          where: { id: cand.id },
          data: {
            visible: false,
            source: 'TSE_NOT_IN_2026',
            tseValidated: false,
          },
        });
      }
      continue;
    }

    matchedTseIds.add(matchedRef.sqCandidato);

    // 3. Candidato oficial confirmado no TSE 2026
    const situacao = matchedRef.dsSituacao.toUpperCase();
    const isFichaLimpa =
      !situacao.includes('INDEFERIDO') &&
      !situacao.includes('CANCELADO') &&
      !situacao.includes('CASSADO') &&
      !situacao.includes('INAPTO');

    const status = mapStatus(matchedRef.dsSituacao);
    const cargo = mapRole(matchedRef.cdCargo);
    const level = mapLevel(cargo);

    const isProgressive = isProgressiveParty(matchedRef.sgPartido);

    if (!isProgressive) {
      nonProgressiveHiddenCount++;
      if (isApply) {
        await prisma.candidate.update({
          where: { id: cand.id },
          data: {
            visible: false,
            source: 'TSE_CSV_CONSERVATIVE',
            tseValidated: true,
            isProgressiveSupported: false,
          },
        });
      }
      continue;
    }

    const isViceMismatch =
      ['GOVERNADOR', 'PRESIDENTE'].includes(cargo) &&
      matchedRef.viceName &&
      normalizeStr(cand.viceName) !== normalizeStr(matchedRef.viceName);

    if (isViceMismatch) {
      vicesCorrectedCount++;
    }

    updatedCount++;

    if (isApply) {
      await prisma.candidate.update({
        where: { id: cand.id },
        data: {
          tseId: matchedRef.sqCandidato,
          name: matchedRef.nmCandidato,
          socialName: matchedRef.nmUrna || cand.socialName,
          viceName: matchedRef.viceName || cand.viceName,
          party: matchedRef.sgPartido,
          partyNumber: matchedRef.nrPartido,
          numeroUrna: matchedRef.nrCandidato,
          cargo,
          level,
          state: matchedRef.uf,
          municipality: matchedRef.rawRow['NM_UE'] || (matchedRef.uf === 'BR' ? 'Brasil' : matchedRef.uf),
          coalition: matchedRef.dsComposicaoColigacao || cand.coalition,
          candidaturaStatus: status,
          fichaLimpa: isFichaLimpa,
          isProgressiveSupported: true,
          source: 'TSE_CSV',
          tseValidated: true,
          visible: true,
          electionYear: 2026,
          rawTseData: matchedRef.rawRow,
        },
      });
    }
  }

  console.log(`[OK] Registros progressistas existentes reconciliados: ${updatedCount}`);
  console.log(`[OK] Vices corrigidos por chapa: ${vicesCorrectedCount}`);
  console.log(`[OK] Candidatos não progressistas ocultados (visible=false): ${nonProgressiveHiddenCount}`);
  console.log(`[OK] Phantoms / Legados ocultados (visible=false): ${phantomsHiddenCount}`);

  console.log('\n[4/5] Inserindo candidaturas progressistas oficiais faltantes (B_MISSING)...');

  for (const [sq, ref] of referenceMap.entries()) {
    if (matchedTseIds.has(sq)) continue;

    if (!isProgressiveParty(ref.sgPartido)) continue;

    missingInsertedCount++;

    if (isApply) {
      const cargo = mapRole(ref.cdCargo);
      const level = mapLevel(cargo);
      const situacao = ref.dsSituacao.toUpperCase();
      const isFichaLimpa =
        !situacao.includes('INDEFERIDO') &&
        !situacao.includes('CANCELADO') &&
        !situacao.includes('CASSADO') &&
        !situacao.includes('INAPTO');

      await prisma.candidate.create({
        data: {
          tseId: ref.sqCandidato,
          name: ref.nmCandidato,
          socialName: ref.nmUrna,
          viceName: ref.viceName || null,
          party: ref.sgPartido,
          partyNumber: ref.nrPartido,
          numeroUrna: ref.nrCandidato,
          cargo,
          level,
          state: ref.uf,
          municipality: ref.rawRow['NM_UE'] || (ref.uf === 'BR' ? 'Brasil' : ref.uf),
          coalition: ref.dsComposicaoColigacao || null,
          candidaturaStatus: mapStatus(ref.dsSituacao),
          fichaLimpa: isFichaLimpa,
          isProgressiveSupported: true,
          source: 'TSE_CSV',
          tseValidated: true,
          visible: true,
          electionYear: 2026,
          cpfHash: generateCpfHash(ref.sqCandidato),
          profileScores: generateDefaultMatchingProfile(),
          rawTseData: ref.rawRow,
        },
      });
    }
  }

  console.log(`[OK] Candidatos progressistas oficiais inseridos: ${missingInsertedCount}`);

  console.log('\n[5/5] Executando Spot-Check RJ contra Extrato 14/09/2026...');

  const rjGovs = await prisma.candidate.findMany({
    where: {
      state: 'RJ',
      cargo: 'GOVERNADOR',
      visible: true,
      electionYear: 2026,
    },
    orderBy: { numeroUrna: 'asc' },
  });

  const rjSens = await prisma.candidate.findMany({
    where: {
      state: 'RJ',
      cargo: 'SENADOR',
      visible: true,
      electionYear: 2026,
    },
    orderBy: { numeroUrna: 'asc' },
  });

  console.log(`\n--- SPOT-CHECK RJ: GOVERNADOR (${rjGovs.length} visíveis) ---`);
  for (const g of rjGovs) {
    console.log(`• ${g.socialName || g.name} (${g.party} ${g.numeroUrna}) -> Vice: ${g.viceName}`);
  }

  console.log(`\n--- SPOT-CHECK RJ: SENADOR (${rjSens.length} visíveis) ---`);
  for (const s of rjSens) {
    console.log(`• ${s.socialName || s.name} (${s.party} ${s.numeroUrna})`);
  }

  // Verificações estritas
  if (isApply) {
    if (rjGovs.length !== 4) {
      throw new Error(`FALHA NO SPOT-CHECK: Esperado exatamente 4 governadores no RJ, obtido ${rjGovs.length}`);
    }

    const expectedGovNumbers = new Set(['16', '29', '50', '80']);
    for (const g of rjGovs) {
      if (!expectedGovNumbers.has(g.numeroUrna || '')) {
        throw new Error(`FALHA NO SPOT-CHECK: Governador inesperado no RJ: ${g.socialName} (${g.party} ${g.numeroUrna})`);
      }
    }

    const govVices: Record<string, string> = {
      '80': 'BIA MARTINS',
      '50': 'JULIANA CARVALHO',
      '16': 'PERCILIANA',
      '29': 'CAETANO ALBUQUERQUE',
    };

    for (const g of rjGovs) {
      const expectedVice = govVices[g.numeroUrna || ''];
      if (!g.viceName || !normalizeStr(g.viceName).includes(normalizeStr(expectedVice))) {
        throw new Error(
          `FALHA NO SPOT-CHECK: Vice incorreto para ${g.socialName} (${g.numeroUrna}). Esperado: ${expectedVice}, Obtido: ${g.viceName}`
        );
      }
    }

    if (rjSens.length !== 6) {
      throw new Error(`FALHA NO SPOT-CHECK: Esperado exatamente 6 senadores no RJ, obtido ${rjSens.length}`);
    }

    const expectedSenNumbers = new Set(['131', '160', '290', '500', '800', '808']);
    for (const s of rjSens) {
      if (!expectedSenNumbers.has(s.numeroUrna || '')) {
        throw new Error(`FALHA NO SPOT-CHECK: Senador inesperado no RJ: ${s.socialName} (${s.party} ${s.numeroUrna})`);
      }
    }

    console.log('\n[PASS] TODOS OS CRITÉRIOS DE SPOT-CHECK RJ VALIDADOS COM 100% DE SUCESSO!');
  }

  console.log('\n========================================================================');
  console.log(' 🎉 RECONCILIAÇÃO CONCLUÍDA!');
  console.log(`    Modo: ${isApply ? 'APLICADO EM PRODUÇÃO' : 'SIMULAÇÃO REALIZADA'}`);
  console.log(`    Candidatos Oficiais TSE Reconciliados: ${updatedCount}`);
  console.log(`    Vices Atualizados via SQ_COLIGACAO: ${vicesCorrectedCount}`);
  console.log(`    Candidatos Inseridos (B_MISSING): ${missingInsertedCount}`);
  console.log(`    Não Progressistas Ocultados: ${nonProgressiveHiddenCount}`);
  console.log(`    Phantoms Ocultados (A_PHANTOM): ${phantomsHiddenCount}`);
  console.log(`    Governadores RJ Visíveis: ${rjGovs.length}`);
  console.log(`    Senadores RJ Visíveis: ${rjSens.length}`);
  console.log('========================================================================');
}

main()
  .catch((e) => {
    console.error('Erro na reconciliação:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
