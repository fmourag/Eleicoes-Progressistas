"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CIVIC_SYNONYMS = void 0;
exports.normalizeText = normalizeText;
exports.extractKeywords = extractKeywords;
exports.expandKeywords = expandKeywords;
exports.searchMandateProposals = searchMandateProposals;
exports.CIVIC_SYNONYMS = {
    creche: ['educacao', 'infantil', 'escola', 'ensino', 'vaga', 'crianca', 'infancia'],
    escola: ['educacao', 'ensino', 'creche', 'pedagogico', 'professor', 'merenda'],
    educacao: ['ensino', 'escola', 'creche', 'formacao', 'alfabetizacao', 'universidade'],
    universidade: ['faculdade', 'ensino superior', 'pesquisa', 'ciencia', 'bolsa'],
    esgoto: ['saneamento', 'agua', 'tratamento', 'coleta', 'poluicao', 'baia', 'rio'],
    agua: ['saneamento', 'abastecimento', 'recursos hidricos', 'hidrica', 'esgoto', 'torneira'],
    saneamento: ['agua', 'esgoto', 'drenagem', 'universalizacao', 'residuos', 'agenersa'],
    lixo: ['residuos', 'solidos', 'coleta', 'reciclagem', 'catadores', 'aterro', 'limpeza'],
    ambiente: ['sustentavel', 'sustentabilidade', 'clima', 'ecologica', 'floresta', 'preservacao'],
    clima: ['meio ambiente', 'transicao ecologica', 'aquecimento', 'descarbonizacao'],
    remedio: ['medicamento', 'farmacia', 'saude', 'distribuicao', 'sus'],
    hospital: ['saude', 'sus', 'upa', 'atendimento', 'leito', 'emergencia', 'clinica'],
    saude: ['sus', 'hospital', 'remedio', 'medico', 'atencao basica', 'vacina', 'posto'],
    medico: ['saude', 'doutor', 'consulta', 'fila', 'especialista', 'ubs'],
    tarifa: ['passagem', 'transporte', 'onibus', 'metro', 'trem', 'barca', 'tarifa zero'],
    onibus: ['transporte', 'mobilidade', 'tarifa', 'frota', 'corredor', 'brt', 'linha'],
    transporte: ['mobilidade', 'tarifa', 'onibus', 'trem', 'metro', 'ciclovia', 'deslocamento'],
    trem: ['transporte', 'mobilidade', 'ferrovia', 'supervia', 'estacao', 'trilhos'],
    metro: ['transporte', 'metroviario', 'mobilidade', 'linha', 'expansao'],
    imposto: ['tributo', 'taxa', 'tributacao', 'progressiva', 'reforma tributaria', 'fiscal', 'isencao'],
    tributo: ['imposto', 'taxa', 'arrecadacao', 'justica fiscal', 'progressividade'],
    salario: ['remuneracao', 'renda', 'piso', 'minimo', 'trabalho', 'emprego'],
    trabalho: ['emprego', 'renda', 'salario', 'carteira', 'formalizacao', 'trabalhador', 'mei'],
    emprego: ['trabalho', 'vaga', 'oportunidade', 'renda', 'qualificacao', 'capacitacao'],
    seguranca: ['policia', 'violencia', 'crime', 'prevencao', 'armas', 'homicidios', 'comunidade'],
    policia: ['seguranca', 'militar', 'civil', 'patrulhamento', 'batalhao', 'investigacao'],
    arma: ['desarmamento', 'porte', 'posse', 'armas', 'violencia', 'controle de armas'],
    armas: ['arma', 'desarmamento', 'porte', 'violencia', 'controle'],
    mulher: ['genero', 'violencia contra a mulher', 'feminicidio', 'igualdade', 'maternidade'],
    negro: ['antirracismo', 'racial', 'igualdade racial', 'quilombola', 'cotas'],
    lgbt: ['diversidade', 'direitos lgbt', 'homofobia', 'transfobia', 'cidadania'],
    moradia: ['habitacao', 'casa', 'teto', 'regularizacao', 'fundiaria', 'aluguel social', 'favela'],
    favela: ['comunidade', 'periferia', 'moradia', 'urbanizacao', 'saneamento', 'baixada'],
    baixada: ['periferia', 'fluminense', 'municipios', 'moradia', 'infraestrutura'],
    tecnologia: ['inovacao', 'digital', 'ciencia', 'ia', 'inteligencia artificial', 'conectividade', 'internet'],
    internet: ['conectividade', 'digital', 'banda larga', 'inclusao digital'],
    ia: ['inteligencia artificial', 'tecnologia', 'algoritmo', 'automacao', 'dados'],
};
function normalizeText(text) {
    if (!text)
        return '';
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
const STOPWORDS = new Set([
    'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
    'em', 'no', 'na', 'nos', 'nas', 'para', 'por', 'com', 'sem', 'sob', 'sobre',
    'que', 'qual', 'quais', 'e', 'ou', 'se', 'mas', 'como', 'mais', 'este', 'esta',
    'esse', 'essa', 'aquele', 'aquela', 'ele', 'ela', 'eles', 'elas', 'qual', 'o que',
    'candidato', 'proposta', 'sobre', 'tem', 'faz', 'quer', 'vai', 'diz', 'pergunte'
]);
function extractKeywords(rawQuery) {
    const normalized = normalizeText(rawQuery);
    const words = normalized.split(' ').filter(w => w.length >= 2 && !STOPWORDS.has(w));
    return Array.from(new Set(words));
}
function expandKeywords(keywords) {
    const expanded = new Set(keywords);
    for (const kw of keywords) {
        if (exports.CIVIC_SYNONYMS[kw]) {
            for (const syn of exports.CIVIC_SYNONYMS[kw]) {
                expanded.add(normalizeText(syn));
            }
        }
        for (const [key, list] of Object.entries(exports.CIVIC_SYNONYMS)) {
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
function extractContextSnippet(text, queryWords, maxLength = 130) {
    if (!text)
        return '';
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
    if (start > 0)
        snippet = '...' + snippet;
    if (end < text.length)
        snippet = snippet + '...';
    return snippet;
}
function searchMandateProposals(query, proposals) {
    if (!query || !query.trim() || !proposals || proposals.length === 0) {
        return [];
    }
    const directKeywords = extractKeywords(query);
    if (directKeywords.length === 0)
        return [];
    const allQueryTerms = expandKeywords(directKeywords);
    const results = [];
    proposals.forEach((p, idx) => {
        let score = 0;
        const matchedTerms = [];
        let bestSnippet = '';
        let matchField = 'general';
        const normTitle = normalizeText(p.title || '');
        const normPillar = normalizeText(`${p.pillar} ${p.pillarInfo?.label || ''}`);
        const normDiretrizes = normalizeText(p.diretrizes || '');
        const normMetas = (p.metasAcoes || []).map(m => normalizeText(m)).join(' ');
        const normDiagnostico = normalizeText(p.diagnostico || '');
        const normDesc = normalizeText(p.description || '');
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
        let metasHit = 0;
        for (const term of allQueryTerms) {
            const isDirect = directKeywords.includes(term);
            const mult = isDirect ? 1.0 : 0.6;
            if (normMetas.includes(term)) {
                metasHit += 25 * mult;
                matchedTerms.push(term);
                if (matchField !== 'title' && matchField !== 'diretrizes') {
                    const matchedMeta = (p.metasAcoes || []).find(m => normalizeText(m).includes(term)) || p.metasAcoes?.[0] || '';
                    bestSnippet = extractContextSnippet(matchedMeta, directKeywords);
                    matchField = 'metasAcoes';
                }
            }
        }
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
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}
//# sourceMappingURL=civic-search.js.map