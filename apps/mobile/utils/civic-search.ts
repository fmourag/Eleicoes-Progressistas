import { MandateProposalDetail } from '@np/shared';

export interface CivicSearchResult {
  proposalIndex: number;
  proposal: MandateProposalDetail;
  relevanceScore: number; // 0 a 100
  matchedSnippet: string;
  matchField: 'title' | 'diretrizes' | 'metasAcoes' | 'diagnostico' | 'general';
  matchedKeywords: string[];
}

/**
 * Dicionário bidirecional de sinônimos cívicos e expansão temático-popular
 */
export const CIVIC_SYNONYMS: Record<string, string[]> = {
  // Educação & Infância
  creche: ['educacao', 'infantil', 'escola', 'ensino', 'vaga', 'crianca', 'infancia'],
  escola: ['educacao', 'ensino', 'creche', 'pedagogico', 'professor', 'merenda'],
  educacao: ['ensino', 'escola', 'creche', 'formacao', 'alfabetizacao', 'universidade'],
  universidade: ['faculdade', 'ensino superior', 'pesquisa', 'ciencia', 'bolsa'],

  // Saneamento, Água & Meio Ambiente
  esgoto: ['saneamento', 'agua', 'tratamento', 'coleta', 'poluicao', 'baia', 'rio'],
  agua: ['saneamento', 'abastecimento', 'recursos hidricos', 'hidrica', 'esgoto', 'torneira'],
  saneamento: ['agua', 'esgoto', 'drenagem', 'universalizacao', 'residuos', 'agenersa'],
  lixo: ['residuos', 'solidos', 'coleta', 'reciclagem', 'catadores', 'aterro', 'limpeza'],
  ambiente: ['sustentavel', 'sustentabilidade', 'clima', 'ecologica', 'floresta', 'preservacao'],
  clima: ['meio ambiente', 'transicao ecologica', 'aquecimento', 'descarbonizacao'],

  // Saúde & Assistência
  remedio: ['medicamento', 'farmacia', 'saude', 'distribuicao', 'sus'],
  hospital: ['saude', 'sus', 'upa', 'atendimento', 'leito', 'emergencia', 'clinica'],
  saude: ['sus', 'hospital', 'remedio', 'medico', 'atencao basica', 'vacina', 'posto'],
  medico: ['saude', 'doutor', 'consulta', 'fila', 'especialista', 'ubs'],

  // Mobilidade & Transporte
  tarifa: ['passagem', 'transporte', 'onibus', 'metro', 'trem', 'barca', 'tarifa zero'],
  onibus: ['transporte', 'mobilidade', 'tarifa', 'frota', 'corredor', 'brt', 'linha'],
  transporte: ['mobilidade', 'tarifa', 'onibus', 'trem', 'metro', 'ciclovia', 'deslocamento'],
  trem: ['transporte', 'mobilidade', 'ferrovia', 'supervia', 'estacao', 'trilhos'],
  metro: ['transporte', 'metroviario', 'mobilidade', 'linha', 'expansao'],

  // Economia, Tributos & Trabalho
  imposto: ['tributo', 'taxa', 'tributacao', 'progressiva', 'reforma tributaria', 'fiscal', 'isencao'],
  tributo: ['imposto', 'taxa', 'arrecadacao', 'justica fiscal', 'progressividade'],
  salario: ['remuneracao', 'renda', 'piso', 'minimo', 'trabalho', 'emprego'],
  trabalho: ['emprego', 'renda', 'salario', 'carteira', 'formalizacao', 'trabalhador', 'mei'],
  emprego: ['trabalho', 'vaga', 'oportunidade', 'renda', 'qualificacao', 'capacitacao'],

  // Segurança & Cidadania
  seguranca: ['policia', 'violencia', 'crime', 'prevencao', 'armas', 'homicidios', 'comunidade'],
  policia: ['seguranca', 'militar', 'civil', 'patrulhamento', 'batalhao', 'investigacao'],
  arma: ['desarmamento', 'porte', 'posse', 'armas', 'violencia', 'controle de armas'],
  armas: ['arma', 'desarmamento', 'porte', 'violencia', 'controle'],

  // Direitos Humanos & Igualdade
  mulher: ['genero', 'violencia contra a mulher', 'feminicidio', 'igualdade', 'maternidade'],
  negro: ['antirracismo', 'racial', 'igualdade racial', 'quilombola', 'cotas'],
  lgbt: ['diversidade', 'direitos lgbt', 'homofobia', 'transfobia', 'cidadania'],
  moradia: ['habitacao', 'casa', 'teto', 'regularizacao', 'fundiaria', 'aluguel social', 'favela'],
  favela: ['comunidade', 'periferia', 'moradia', 'urbanizacao', 'saneamento', 'baixada'],
  baixada: ['periferia', 'fluminense', 'municipios', 'moradia', 'infraestrutura'],

  // Ciência, Tecnologia & Inovação
  tecnologia: ['inovacao', 'digital', 'ciencia', 'ia', 'inteligencia artificial', 'conectividade', 'internet'],
  internet: ['conectividade', 'digital', 'banda larga', 'inclusao digital'],
  ia: ['inteligencia artificial', 'tecnologia', 'algoritmo', 'automacao', 'dados'],
};

/**
 * Remove acentos, pontuações e converte para minúsculas
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrai tokens relevantes descartando stopwords
 */
const STOPWORDS = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
  'em', 'no', 'na', 'nos', 'nas', 'para', 'por', 'com', 'sem', 'sob', 'sobre',
  'que', 'qual', 'quais', 'e', 'ou', 'se', 'mas', 'como', 'mais', 'este', 'esta',
  'esse', 'essa', 'aquele', 'aquela', 'ele', 'ela', 'eles', 'elas', 'qual', 'o que',
  'candidato', 'proposta', 'sobre', 'tem', 'faz', 'quer', 'vai', 'diz', 'pergunte'
]);

export function extractKeywords(rawQuery: string): string[] {
  const normalized = normalizeText(rawQuery);
  const words = normalized.split(' ').filter(w => w.length >= 2 && !STOPWORDS.has(w));
  return Array.from(new Set(words));
}

/**
 * Expande keywords com o dicionário de sinônimos cívicos
 */
export function expandKeywords(keywords: string[]): string[] {
  const expanded = new Set<string>(keywords);

  for (const kw of keywords) {
    if (CIVIC_SYNONYMS[kw]) {
      for (const syn of CIVIC_SYNONYMS[kw]) {
        expanded.add(normalizeText(syn));
      }
    }
    // Varredura reversa de sinônimos
    for (const [key, list] of Object.entries(CIVIC_SYNONYMS)) {
      if (list.includes(kw)) {
        expanded.add(normalizeText(key));
        for (const sibling of list) {
          expanded.add(normalizeText(sibling));
        }
      }
    }
  }

  return Array.from(expanded);
}

/**
 * Extrai um snippet contextual com limite de tamanho
 */
function extractContextSnippet(text: string, queryWords: string[], maxLength = 130): string {
  if (!text) return '';
  const normText = normalizeText(text);

  let bestIndex = -1;
  for (const qw of queryWords) {
    const idx = normText.indexOf(qw);
    if (idx !== -1) {
      bestIndex = idx;
      break;
    }
  }

  if (bestIndex === -1) {
    return text.length > maxLength ? text.substring(0, maxLength).trim() + '...' : text;
  }

  const start = Math.max(0, bestIndex - 40);
  const end = Math.min(text.length, bestIndex + 90);
  let snippet = text.substring(start, end).trim();

  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  return snippet;
}

/**
 * Mecanismo de busca semântica client-side em propostas de mandato
 */
export function searchMandateProposals(
  query: string,
  proposals: MandateProposalDetail[]
): CivicSearchResult[] {
  if (!query || !query.trim() || !proposals || proposals.length === 0) {
    return [];
  }

  const directKeywords = extractKeywords(query);
  if (directKeywords.length === 0) return [];

  const allQueryTerms = expandKeywords(directKeywords);
  const results: CivicSearchResult[] = [];

  proposals.forEach((p, idx) => {
    let score = 0;
    const matchedTerms: string[] = [];
    let bestSnippet = '';
    let matchField: CivicSearchResult['matchField'] = 'general';

    const normTitle = normalizeText(p.title || '');
    const normPillar = normalizeText(`${p.pillar} ${p.pillarInfo?.label || ''}`);
    const normDiretrizes = normalizeText(p.diretrizes || '');
    const normMetas = (p.metasAcoes || []).map(m => normalizeText(m)).join(' ');
    const normDiagnostico = normalizeText(p.diagnostico || '');
    const normDesc = normalizeText(p.description || '');

    // 1. Título e Pilar (Peso 3.0x)
    let titleHit = 0;
    for (const term of allQueryTerms) {
      const isDirect = directKeywords.includes(term);
      const mult = isDirect ? 1.0 : 0.6;
      if (normTitle.includes(term) || normPillar.includes(term)) {
        titleHit += 35 * mult;
        matchedTerms.push(term);
        if (!bestSnippet) {
          bestSnippet = p.title;
          matchField = 'title';
        }
      }
    }

    // 2. Diretriz Prioritária (Peso 2.0x)
    let diretrizHit = 0;
    for (const term of allQueryTerms) {
      const isDirect = directKeywords.includes(term);
      const mult = isDirect ? 1.0 : 0.6;
      if (normDiretrizes.includes(term)) {
        diretrizHit += 25 * mult;
        matchedTerms.push(term);
        if (matchField !== 'title') {
          bestSnippet = extractContextSnippet(p.diretrizes, directKeywords);
          matchField = 'diretrizes';
        }
      }
    }

    // 3. Metas e Ações Práticas (Peso 2.0x)
    let metasHit = 0;
    for (const term of allQueryTerms) {
      const isDirect = directKeywords.includes(term);
      const mult = isDirect ? 1.0 : 0.6;
      if (normMetas.includes(term)) {
        metasHit += 25 * mult;
        matchedTerms.push(term);
        if (matchField !== 'title' && matchField !== 'diretrizes') {
          // Achar a meta que mais combina
          const matchedMeta = (p.metasAcoes || []).find(m => normalizeText(m).includes(term)) || p.metasAcoes?.[0] || '';
          bestSnippet = extractContextSnippet(matchedMeta, directKeywords);
          matchField = 'metasAcoes';
        }
      }
    }

    // 4. Diagnóstico Geral (Peso 1.0x)
    let diagHit = 0;
    for (const term of allQueryTerms) {
      const isDirect = directKeywords.includes(term);
      const mult = isDirect ? 1.0 : 0.5;
      if (normDiagnostico.includes(term) || normDesc.includes(term)) {
        diagHit += 15 * mult;
        matchedTerms.push(term);
        if (!bestSnippet) {
          bestSnippet = extractContextSnippet(p.diagnostico || p.description, directKeywords);
          matchField = 'diagnostico';
        }
      }
    }

    score = Math.min(100, Math.round(titleHit + diretrizHit + metasHit + diagHit));

    // Filtrar scores insignificantes (< 15%)
    if (score >= 15) {
      results.push({
        proposalIndex: idx,
        proposal: p,
        relevanceScore: score,
        matchedSnippet: bestSnippet || p.title,
        matchField,
        matchedKeywords: Array.from(new Set(matchedTerms)),
      });
    }
  });

  // Ordenar por relevância decrescente
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}
