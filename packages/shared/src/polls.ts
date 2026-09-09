import { Cargo } from './index';

export interface ElectionPollCandidate {
  candidateName: string;
  candidateId?: string;
  party?: string;
  percentual: number;
}

export interface PollExecutorDetail {
  instituto: string;
  razaoSocial?: string;
  cnpj?: string;
  contratante: string;
  origemRecursos: string;
  estatisticoResponsavel: string;
  registroConre: string;
}

export interface PollMethodologyDetail {
  metodologiaColeta: string;
  tipoEntrevista: string; // Ex: "Presencial Domiciliar (Face a Face)"
  planoAmostral: string;
  estratificacao: string;
  amostra: number;
  margemErro: number;
  nivelConfianca: number;
  periodoCampo: string;
  controleQualidade: string;
}

export interface ElectionPoll {
  id: string;
  tseRegistro: string; // Ex: BR-09412/2026, RJ-08421/2026
  instituto: string; // Ex: Datafolha, IPEC, Quaest
  contratante: string; // Ex: TV Globo, Folha de S.Paulo, Financiamento Próprio Acadêmico
  cargo: Cargo;
  state?: string; // Sigla da UF ou undefined se nacional (PRESIDENTE)
  dataDivulgacao: string; // Formato YYYY-MM-DD
  periodoCampo: string; // Ex: "01 a 02 de setembro de 2026"
  amostra: number; // Quantidade de entrevistados
  margemErro: number; // Ex: 2.0 (± 2 p.p.)
  nivelConfianca: number; // Ex: 95 (%)
  candidatos: ElectionPollCandidate[];
  isHomologadaTse: boolean;
  linkTse?: string;
  quemRealizou?: PollExecutorDetail;
  comoFoiFeita?: PollMethodologyDetail;
}


export interface PollComplianceResult {
  isCompliant: boolean;
  diasDesdeDivulgacao: number;
  criteriosAtendidos: string[];
  criteriosFalhos: string[];
  motivoDescarte?: string;
}

export interface CandidatePollDifference {
  valor: number; // Positivo se líder (+X.X%), negativo se atrás do líder (-Y.Y%), ou 0.0
  tipo: 'LIDER' | 'PERSEGUIDOR' | 'EMPATE';
  texto: string;
}

export type PerspectiveStatus = 'REMOTA' | 'EM_DISPUTA' | 'PROVAVEL';

export interface ElectionPerspectiveTrend {
  direcao: 'ALTA' | 'ESTAVEL' | 'QUEDA' | 'CONSOLIDADA';
  variacaoPontoPercentual?: number;
  totalPesquisasPeriodo: number;
  resumo: string;
}

export interface ElectionPerspective {
  status: PerspectiveStatus;
  label: 'Remota' | 'Em Disputa' | 'Provável';
  vagasDisponiveis: number;
  descricaoVagas: string;
  posicao: number;
  dentroDasVagas: boolean;
  diferencaCorte: number;
  tendencia30Dias: ElectionPerspectiveTrend;
  justificativa: string;
}

export interface CandidatePollResult {
  hasEligiblePoll: boolean;
  poll?: ElectionPoll;
  candidatePercentual?: number;
  leader?: ElectionPollCandidate;
  second?: ElectionPollCandidate;
  isLeader?: boolean;
  diferenca?: CandidatePollDifference;
  ranking?: number;
  totalCandidates?: number;
  perspectiva?: ElectionPerspective;
  audit: {
    seloConformidade: boolean;
    homologadoTse: boolean;
    tseRegistro?: string;
    diasDivulgacao?: number;
    instituto?: string;
    contratante?: string;
    criteriosAtendidos: string[];
    criteriosFalhos: string[];
    motivoTransparencia: string;
  };
}

export const MAX_POLL_AGE_DAYS = 10;
export const TREND_POLL_WINDOW_DAYS = 30;

// Lista de palavras-chave e termos vedados para Contratante, Instituto e Financiador
export const FORBIDDEN_ENTITIES_TERMS = [
  // Partidos políticos e coligações / fundações partidárias
  'partido',
  'coligacao',
  'coligação',
  'fundacao partidaria',
  'fundação partidária',
  'perseu abramo',
  'ulysses guimaraes',
  'ulysses guimarães',
  'indarte',
  'pt',
  'pl',
  'uniao brasil',
  'união brasil',
  'mdb',
  'psd',
  'psdb',
  'republicanos',
  'pdt',
  'psol',
  'novo',
  'pcdob',
  'avante',
  'solidariedade',
  // Mercado financeiro, bancos, fundos e corretoras
  'xp invest',
  'xp investimentos',
  'btg',
  'btg pactual',
  'genial',
  'genial investimentos',
  'modal',
  'modalmais',
  'santander',
  'itau',
  'itaú',
  'bradesco',
  'bb dtvm',
  'guide',
  'warren',
  'corretora',
  'mercado financeiro',
  'fundo de investimento',
  'gestora de recursos',
  'asset management',
  // Entidades patronais e sindicais
  'fiesp',
  'cni',
  'fecomercio',
  'fecomércio',
  'cna',
  'firjan',
  'cut',
  'forca sindical',
  'força sindical',
  'ugt',
  'ctb',
  'csb',
  'sindicato',
  'sindical',
  'patronal',
  'federacao das industrias',
  'federação das indústrias',
  'confederacao',
  'confederação',
  // Governos e órgãos da administração pública
  'secom',
  'governo federal',
  'governo do estado',
  'governo estadual',
  'prefeitura',
  'ministerio',
  'ministério',
  'secretaria',
  'orgao publico',
  'órgão público',
  // ONGs
  'ong',
  'organizacao nao governamental',
  'organização não governamental',
  'instituto brasil livre',
  'mbl',
  'vem pra rua',
  // Mídias sabidamente de extrema direita, fisiológicas ou parciais
  'jovem pan',
  'jovempan',
  'panflix',
  'record',
  'tv record',
  'grupo record',
  'r7',
  'sbt',
  'sistema brasileiro de televisao',
  'sistema brasileiro de televisão',
  'veja',
  'revista veja',
  'editora abril',
  'oeste',
  'revista oeste',
  'brasil paralelo',
  'brasilparalelo',
  'folha politica',
  'folha política',
  'pleno news',
  'plenonews',
  'gazeta do povo',
  'jornal da cidade online',
  'jco',
  // Mídias e institutos com histórico de viés tendencioso
  'datafolha',
  'folha da manha',
  'folha da manhã',
  'empresa folha da manha',
  'empresa folha da manhã',
  'grupo folha',
  // Grupos corporativistas e lobbies
  'cartorios',
  'cartórios',
  'lobby corporativo',
  'febraban',
  'associacao privada de classe',
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Compara dois nomes de candidatos considerando nomes completos, nomes de urna e supressão de sobrenomes intermediários.
 * Exemplo: "Eduardo da Costa Paes" casa com "Eduardo Paes".
 */
export function isCandidateNameMatch(nameA: string, nameB: string): boolean {
  const normA = normalizeText(nameA);
  const normB = normalizeText(nameB);
  if (!normA || !normB) return false;
  if (normA === normB || normA.includes(normB) || normB.includes(normA)) return true;

  const stopWords = new Set(['de', 'da', 'do', 'dos', 'das', 'e']);
  const wordsA = normA.split(/[\s\-()]+/).filter((w) => w.length > 2 && !stopWords.has(w));
  const wordsB = normB.split(/[\s\-()]+/).filter((w) => w.length > 2 && !stopWords.has(w));

  if (wordsA.length === 0 || wordsB.length === 0) return false;

  // Primeiro e último nome batem (ex: "Eduardo da Costa Paes" e "Eduardo Paes")
  if (wordsA.length >= 2 && wordsB.length >= 2) {
    if (wordsA[0] === wordsB[0] && wordsA[wordsA.length - 1] === wordsB[wordsB.length - 1]) {
      return true;
    }
  }

  // Todas as palavras significativas de uma estão contidas na outra
  const allBInA = wordsB.length >= 2 && wordsB.every((w) => wordsA.includes(w));
  const allAInB = wordsA.length >= 2 && wordsA.every((w) => wordsB.includes(w));
  if (allBInA || allAInB) return true;

  return false;
}

/**
 * Valida a conformidade de uma pesquisa eleitoral com base nos critérios legais do TSE
 * e nas vedações éticas de conflito de interesse.
 */
export function validatePollCompliance(
  poll: ElectionPoll,
  referenceDate: Date = new Date('2026-09-03T00:00:00'),
  maxAgeDays: number = MAX_POLL_AGE_DAYS
): PollComplianceResult {
  const criteriosAtendidos: string[] = [];
  const criteriosFalhos: string[] = [];

  // 1. Homologação no TSE/TREs
  const tseRegex = /^(BR|[A-Z]{2})-\d{4,6}\/\d{4}$/i;
  if (poll.isHomologadaTse && poll.tseRegistro && tseRegex.test(poll.tseRegistro)) {
    criteriosAtendidos.push(`Homologada na Justiça Eleitoral (Registro Oficial TSE: ${poll.tseRegistro})`);
  } else {
    criteriosFalhos.push('Não homologada ou sem registro regular ativo no sistema PesqEle do TSE/TRE');
  }

  // 2. Temporalidade não superior a maxAgeDays
  const pollDate = new Date(`${poll.dataDivulgacao}T23:59:59`);
  const diffMs = referenceDate.getTime() - pollDate.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays <= maxAgeDays) {
    criteriosAtendidos.push(`Divulgação recente (${diffDays === 0 ? 'hoje' : `há ${diffDays} dia(s)`}, limite: ${maxAgeDays} dias)`);
  } else {
    criteriosFalhos.push(`Pesquisa expirada (realizada há ${diffDays} dias, superior ao limite de ${maxAgeDays} dias)`);
  }

  // 3. Vedações Absolutas (Partidos, Mercado Financeiro, Sindicatos/Patronais, Governos, ONGs, Mídias parciais/extrema-direita)
  const normInstituto = normalizeText(poll.instituto || '');
  const normContratante = normalizeText(poll.contratante || '');
  const combinedActors = `${normInstituto} ${normContratante}`;

  const matchedForbidden: string[] = [];
  for (const term of FORBIDDEN_ENTITIES_TERMS) {
    const normTerm = normalizeText(term);
    if (new RegExp(`\\b${normTerm}\\b`, 'i').test(combinedActors) || combinedActors.includes(normTerm)) {
      matchedForbidden.push(term);
    }
  }

  if (matchedForbidden.length === 0) {
    criteriosAtendidos.push(`Independência comprovada: sem vínculo com partidos, mercado financeiro, entidades patronais/sindicais, governos ou mídias corporativas/fisiológicas`);
  } else {
    criteriosFalhos.push(
      `Conflito de interesse detectado: contratação ou realização associada a entes vedados (${matchedForbidden.slice(0, 3).join(', ')})`
    );
  }

  // 4. Critérios metodológicos mínimos
  if (poll.margemErro > 0 && poll.nivelConfianca >= 90 && poll.amostra >= 800) {
    criteriosAtendidos.push(`Critérios científicos regulares (Amostra: ${poll.amostra.toLocaleString('pt-BR')} eleitores, Margem de Erro: ± ${poll.margemErro.toFixed(1)} p.p., Confiança: ${poll.nivelConfianca}%)`);
  } else {
    criteriosFalhos.push('Amostra estatística insuficiente ou margem de erro não divulgada');
  }

  const isCompliant = criteriosFalhos.length === 0;

  return {
    isCompliant,
    diasDesdeDivulgacao: diffDays,
    criteriosAtendidos,
    criteriosFalhos,
    motivoDescarte: isCompliant ? undefined : criteriosFalhos.join('; '),
  };
}

/**
 * Retorna o número de vagas disponíveis e descrição constitucional/eleitoral para cada cargo
 */
export function getVagasCargo(cargo: Cargo, ano: number = 2026): { vagas: number; descricao: string } {
  switch (cargo) {
    case 'SENADOR':
      // Em 2026 ocorre a renovação de 2/3 do Senado Federal (Art. 46, § 2º da CF/88) -> 2 vagas por UF
      return {
        vagas: 2,
        descricao: '2 vagas disponíveis (Eleições Gerais 2026 — renovação de 2/3 do Senado Federal)',
      };
    case 'PRESIDENTE':
      return {
        vagas: 1,
        descricao: '1 vaga disponível (Eleição Majoritária Presidencial)',
      };
    case 'GOVERNADOR':
      return {
        vagas: 1,
        descricao: '1 vaga disponível (Eleição Majoritária Estadual)',
      };
    case 'PREFEITO':
      return {
        vagas: 1,
        descricao: '1 vaga disponível (Eleição Majoritária Municipal)',
      };
    case 'DEPUTADO_FEDERAL':
      return {
        vagas: 70,
        descricao: 'Vagas proporcionais distribuídas pelo quociente eleitoral e partidário',
      };
    case 'DEPUTADO_ESTADUAL':
      return {
        vagas: 70,
        descricao: 'Vagas proporcionais na Assembleia Legislativa pelo quociente partidário',
      };
    case 'VEREADOR':
      return {
        vagas: 25,
        descricao: 'Vagas proporcionais na Câmara Municipal definidas pela Lei Orgânica',
      };
    default:
      return {
        vagas: 1,
        descricao: '1 vaga disponível para o cargo',
      };
  }
}

/**
 * Calcula a tendência de intenção de voto do candidato em pesquisas dos últimos 30 dias
 * que satisfazem integralmente os critérios do sistema.
 */
export function computeCandidate30DaysTrend(
  candidate: { id?: string; name: string; cargo: Cargo; state?: string },
  candidatePolls: ElectionPoll[],
  referenceDate: Date = new Date('2026-09-03T00:00:00')
): ElectionPerspectiveTrend {
  const normCandName = normalizeText(candidate.name);

  // Filtrar pesquisas válidas e conformes divulgadas nos últimos 30 dias
  const compliantPolls30Days = candidatePolls
    .map((poll) => ({ poll, compliance: validatePollCompliance(poll, referenceDate, TREND_POLL_WINDOW_DAYS) }))
    .filter((item) => item.compliance.isCompliant)
    .sort((a, b) => new Date(a.poll.dataDivulgacao).getTime() - new Date(b.poll.dataDivulgacao).getTime()); // Cronológica ascendente

  if (compliantPolls30Days.length === 0) {
    return {
      direcao: 'CONSOLIDADA',
      totalPesquisasPeriodo: 0,
      resumo: 'Sem pesquisas registradas e independentes nos últimos 30 dias',
    };
  }

  if (compliantPolls30Days.length === 1) {
    return {
      direcao: 'CONSOLIDADA',
      totalPesquisasPeriodo: 1,
      resumo: 'Consolidado no levantamento oficial mais recente (1 pesquisa independente nos últimos 30 dias)',
    };
  }

  const findPercentual = (p: ElectionPoll) => {
    const cand = p.candidatos.find((c) => {
      if (candidate.id && c.candidateId && c.candidateId === candidate.id) return true;
      return isCandidateNameMatch(candidate.name, c.candidateName);
    });
    return cand ? cand.percentual : 0;
  };

  const oldestPoll = compliantPolls30Days[0].poll;
  const newestPoll = compliantPolls30Days[compliantPolls30Days.length - 1].poll;

  const pctOldest = findPercentual(oldestPoll);
  const pctNewest = findPercentual(newestPoll);

  const delta = parseFloat((pctNewest - pctOldest).toFixed(1));

  let direcao: 'ALTA' | 'ESTAVEL' | 'QUEDA' = 'ESTAVEL';
  let resumo = '';

  if (delta > 0.5) {
    direcao = 'ALTA';
    resumo = `+${delta.toFixed(1).replace('.', ',')} p.p. (Crescimento nos últimos 30 dias em ${compliantPolls30Days.length} levantamentos)`;
  } else if (delta < -0.5) {
    direcao = 'QUEDA';
    resumo = `${delta.toFixed(1).replace('.', ',')} p.p. (Oscilação negativa nos últimos 30 dias em ${compliantPolls30Days.length} levantamentos)`;
  } else {
    direcao = 'ESTAVEL';
    resumo = `Estabilidade (${delta >= 0 ? '+' : ''}${delta.toFixed(1).replace('.', ',')} p.p. nos últimos 30 dias em ${compliantPolls30Days.length} levantamentos)`;
  }

  return {
    direcao,
    variacaoPontoPercentual: delta,
    totalPesquisasPeriodo: compliantPolls30Days.length,
    resumo,
  };
}

/**
 * Calcula a perspectiva de eleição (Remota, Em Disputa, Provável) e sua justificativa técnica
 */
export function computeElectionPerspective(params: {
  candidate: { id?: string; name: string; cargo: Cargo; state?: string };
  sortedCandidates: ElectionPollCandidate[];
  candidateIndex: number;
  candidatePercentual: number;
  margemErro: number;
  vagas: number;
  descricaoVagas: string;
  tendencia30Dias: ElectionPerspectiveTrend;
}): ElectionPerspective {
  const {
    candidate,
    sortedCandidates,
    candidateIndex,
    candidatePercentual,
    margemErro,
    vagas,
    descricaoVagas,
    tendencia30Dias,
  } = params;

  // Candidato não pontuou ou não encontrado
  if (candidateIndex === -1 || candidatePercentual === 0) {
    return {
      status: 'REMOTA',
      label: 'Remota',
      vagasDisponiveis: vagas,
      descricaoVagas,
      posicao: sortedCandidates.length + 1,
      dentroDasVagas: false,
      diferencaCorte: -999,
      tendencia30Dias,
      justificativa: `O candidato não registrou pontuação expressiva nas pesquisas oficiais homologadas nos últimos 30 dias. Para o cargo de ${candidate.cargo.replace(/_/g, ' ')}, com ${vagas} vaga(s) disponível(is), sua perspectiva atual de eleição é classificada como Remota.`,
    };
  }

  const posicao = candidateIndex + 1;
  const dentroDasVagas = posicao <= vagas;

  let diferencaCorte = 0;
  let status: PerspectiveStatus = 'REMOTA';
  let label: 'Remota' | 'Em Disputa' | 'Provável' = 'Remota';
  let justificativa = '';

  const margemSeguranca = parseFloat((margemErro * 1.5).toFixed(1));

  if (dentroDasVagas) {
    // Candidato dentro do número de vagas
    const primeiroFora = sortedCandidates[vagas] ?? null;

    if (!primeiroFora) {
      diferencaCorte = candidatePercentual;
      status = 'PROVAVEL';
      label = 'Provável';
      justificativa = `Ocupa o ${posicao}º lugar com ${candidatePercentual.toFixed(1).replace('.', ',')}%, dentro das ${vagas} vaga(s) em disputa para ${candidate.cargo.replace(/_/g, ' ')}, com folga isolada. Tendência dos últimos 30 dias: ${tendencia30Dias.resumo}.`;
    } else {
      diferencaCorte = parseFloat((candidatePercentual - primeiroFora.percentual).toFixed(1));

      if (diferencaCorte >= margemSeguranca && tendencia30Dias.direcao !== 'QUEDA') {
        status = 'PROVAVEL';
        label = 'Provável';
        justificativa = `O candidato ocupa o ${posicao}º lugar com ${candidatePercentual.toFixed(1).replace('.', ',')}%, posicionando-se dentro da zona de eleição (${vagas} vaga(s) disponíveis para ${candidate.cargo.replace(/_/g, ' ')}). Mantém vantagem consistente de +${diferencaCorte.toFixed(1).replace('.', ',')} p.p. sobre o primeiro concorrente fora das vagas (${primeiroFora.candidateName} com ${primeiroFora.percentual.toFixed(1).replace('.', ',')}%), folga superior à margem de erro de ±${margemErro.toFixed(1).replace('.', ',')} p.p. A tendência nos últimos 30 dias (${tendencia30Dias.resumo}) confirma a perspectiva favorável.`;
      } else {
        status = 'EM_DISPUTA';
        label = 'Em Disputa';
        justificativa = `O candidato ocupa o ${posicao}º lugar com ${candidatePercentual.toFixed(1).replace('.', ',')}%, dentro da faixa de ${vagas} vaga(s). No entanto, a vantagem sobre o concorrente imediato fora da zona (${primeiroFora.candidateName} com ${primeiroFora.percentual.toFixed(1).replace('.', ',')}%) é de +${diferencaCorte.toFixed(1).replace('.', ',')} p.p., situando-se sob pressão da margem de erro de ±${margemErro.toFixed(1).replace('.', ',')} p.p., caracterizando disputa acirrada pela última vaga. (${tendencia30Dias.resumo})`;
      }
    }
  } else {
    // Candidato fora do número de vagas
    const ultimoDentro = sortedCandidates[vagas - 1] ?? sortedCandidates[0];
    const distancia = parseFloat((ultimoDentro.percentual - candidatePercentual).toFixed(1));
    diferencaCorte = -distancia;

    const distanciaRecuperavel = parseFloat((margemErro * 2.0).toFixed(1));

    // Exceção de 2º Turno em eleições majoritárias executivas (Presidente e Governador)
    const isSegundoTurnoExecutivo =
      vagas === 1 &&
      posicao === 2 &&
      (candidate.cargo === 'PRESIDENTE' || candidate.cargo === 'GOVERNADOR' || candidate.cargo === 'PREFEITO') &&
      candidatePercentual >= 20.0;

    if (distancia <= distanciaRecuperavel || isSegundoTurnoExecutivo || (distancia <= 7.0 && tendencia30Dias.direcao === 'ALTA')) {
      status = 'EM_DISPUTA';
      label = 'Em Disputa';
      if (isSegundoTurnoExecutivo && distancia > distanciaRecuperavel) {
        justificativa = `O candidato figura no ${posicao}º lugar com ${candidatePercentual.toFixed(1).replace('.', ',')}%, a -${distancia.toFixed(1).replace('.', ',')} p.p. do líder (${ultimoDentro.candidateName} com ${ultimoDentro.percentual.toFixed(1).replace('.', ',')}%). Em eleição executiva para ${candidate.cargo.replace(/_/g, ' ')}, esse patamar o credencia para a disputa de 2º Turno. (${tendencia30Dias.resumo})`;
      } else {
        justificativa = `O candidato figura no ${posicao}º lugar com ${candidatePercentual.toFixed(1).replace('.', ',')}%, a -${distancia.toFixed(1).replace('.', ',')} p.p. da zona de corte (${ultimoDentro.candidateName} no ${vagas}º lugar com ${ultimoDentro.percentual.toFixed(1).replace('.', ',')}%). Como a distância é compatível com a margem de erro (±${margemErro.toFixed(1).replace('.', ',')} p.p.) e intervalo de empate técnico, a vaga segue em disputa aberta. (${tendencia30Dias.resumo})`;
      }
    } else {
      status = 'REMOTA';
      label = 'Remota';
      justificativa = `O candidato ocupa o ${posicao}º lugar com ${candidatePercentual.toFixed(1).replace('.', ',')}%, distante -${distancia.toFixed(1).replace('.', ',')} p.p. da zona de eleição (última vaga ocupada por ${ultimoDentro.candidateName} com ${ultimoDentro.percentual.toFixed(1).replace('.', ',')}% para ${vagas} vaga(s)). A diferença supera com folga a margem de erro de ±${margemErro.toFixed(1).replace('.', ',')} p.p., tornando a perspectiva estatística de eleição remota no quadro atual dos últimos 30 dias. (${tendencia30Dias.resumo})`;
    }
  }

  return {
    status,
    label,
    vagasDisponiveis: vagas,
    descricaoVagas,
    posicao,
    dentroDasVagas,
    diferencaCorte,
    tendencia30Dias,
    justificativa,
  };
}

/**
 * Calcula o percentual do candidato e a diferença em relação ao mais votado
 */
export function computeCandidatePollResult(
  candidate: { id?: string; name: string; cargo: Cargo; state?: string },
  polls: ElectionPoll[],
  referenceDate: Date = new Date('2026-09-03T00:00:00')
): CandidatePollResult {
  const normCandName = normalizeText(candidate.name);

  // Informações de vagas do cargo
  const vagasInfo = getVagasCargo(candidate.cargo);

  // Filtrar apenas pesquisas que correspondem ao mesmo cargo e UF (se aplicável)
  const candidatePolls = polls.filter((p) => {
    if (p.cargo !== candidate.cargo) return false;
    if (p.cargo === 'PRESIDENTE') return true;
    if (candidate.state && p.state) {
      return normalizeText(candidate.state) === normalizeText(p.state);
    }
    return true;
  });

  // Calcular tendência de intenção de voto nos últimos 30 dias com base nas pesquisas conformes
  const tendencia30Dias = computeCandidate30DaysTrend(candidate, candidatePolls, referenceDate);

  // Filtrar apenas pesquisas que passam rigorosamente na validação de conformidade (<= 10 dias)
  const compliantPolls = candidatePolls
    .map((poll) => ({ poll, compliance: validatePollCompliance(poll, referenceDate, MAX_POLL_AGE_DAYS) }))
    .filter((item) => item.compliance.isCompliant)
    .sort((a, b) => new Date(b.poll.dataDivulgacao).getTime() - new Date(a.poll.dataDivulgacao).getTime());

  if (compliantPolls.length === 0) {
    // Nenhuma pesquisa cumpre cumulativamente as condições
    return {
      hasEligiblePoll: false,
      audit: {
        seloConformidade: false,
        homologadoTse: false,
        criteriosAtendidos: [],
        criteriosFalhos: [
          'Nenhuma pesquisa eleitoral nos últimos 10 dias atende cumulativamente aos requisitos de homologação no TSE e independência irrestrita (vedação a partidos, mercado financeiro, sindicatos/patronais, governos e mídias corporativas/fisiológicas).'
        ],
        motivoTransparencia:
          'Em conformidade com a política de transparência e integridade cívica, pesquisas com mais de 10 dias ou financiadas por entes com conflito de interesse são rigorosamente desconsideradas.',
      },
    };
  }

  const { poll, compliance } = compliantPolls[0];

  // Ordenar candidatos da pesquisa pelo percentual decrescente
  const sortedCandidates = [...poll.candidatos].sort((a, b) => b.percentual - a.percentual);

  // Localizar o candidato na pesquisa por ID ou por similaridade de nome
  const candidateIndex = sortedCandidates.findIndex((c) => {
    if (candidate.id && c.candidateId && c.candidateId === candidate.id) return true;
    return isCandidateNameMatch(candidate.name, c.candidateName);
  });

  const leader = sortedCandidates[0];
  const second = sortedCandidates[1] ?? null;

  if (candidateIndex === -1) {
    // Candidato não pontuou ou não foi incluído na pesquisa estimulada selecionada
    const perspectiva = computeElectionPerspective({
      candidate,
      sortedCandidates,
      candidateIndex: -1,
      candidatePercentual: 0,
      margemErro: poll.margemErro,
      vagas: vagasInfo.vagas,
      descricaoVagas: vagasInfo.descricao,
      tendencia30Dias,
    });

    return {
      hasEligiblePoll: true,
      poll,
      candidatePercentual: 0,
      leader,
      second: second || undefined,
      isLeader: false,
      diferenca: {
        valor: -leader.percentual,
        tipo: 'PERSEGUIDOR',
        texto: `Não pontuou na pesquisa (-${leader.percentual.toFixed(1).replace('.', ',')}% em relação ao líder ${leader.candidateName})`,
      },
      ranking: sortedCandidates.length + 1,
      totalCandidates: sortedCandidates.length,
      perspectiva,
      audit: {
        seloConformidade: true,
        homologadoTse: true,
        tseRegistro: poll.tseRegistro,
        diasDivulgacao: compliance.diasDesdeDivulgacao,
        instituto: poll.instituto,
        contratante: poll.contratante,
        criteriosAtendidos: compliance.criteriosAtendidos,
        criteriosFalhos: [],
        motivoTransparencia: 'Pesquisa oficial homologada no TSE e auditada como 100% independente.',
      },
    };
  }

  const candInPoll = sortedCandidates[candidateIndex];
  const candidatePercentual = candInPoll.percentual;
  const isLeader = candidateIndex === 0;

  let diferenca: CandidatePollDifference;

  if (isLeader) {
    if (second) {
      const vantagem = parseFloat((candidatePercentual - second.percentual).toFixed(1));
      if (vantagem === 0) {
        diferenca = {
          valor: 0,
          tipo: 'EMPATE',
          texto: `Empate técnico na liderança com ${second.candidateName} (${second.percentual.toFixed(1).replace('.', ',')}%)`,
        };
      } else {
        diferenca = {
          valor: vantagem,
          tipo: 'LIDER',
          texto: `Líder da pesquisa (+${vantagem.toFixed(1).replace('.', ',')}% à frente do 2º colocado, ${second.candidateName})`,
        };
      }
    } else {
      diferenca = {
        valor: 0,
        tipo: 'LIDER',
        texto: `Líder isolado da pesquisa (${candidatePercentual.toFixed(1).replace('.', ',')}%)`,
      };
    }
  } else {
    const distancia = parseFloat((leader.percentual - candidatePercentual).toFixed(1));
    diferenca = {
      valor: -distancia,
      tipo: 'PERSEGUIDOR',
      texto: `Diferença de -${distancia.toFixed(1).replace('.', ',')}% em relação ao líder (${leader.candidateName} com ${leader.percentual.toFixed(1).replace('.', ',')}%)`,
    };
  }

  const perspectiva = computeElectionPerspective({
    candidate,
    sortedCandidates,
    candidateIndex,
    candidatePercentual,
    margemErro: poll.margemErro,
    vagas: vagasInfo.vagas,
    descricaoVagas: vagasInfo.descricao,
    tendencia30Dias,
  });

  return {
    hasEligiblePoll: true,
    poll,
    candidatePercentual,
    leader,
    second: second || undefined,
    isLeader,
    diferenca,
    ranking: candidateIndex + 1,
    totalCandidates: sortedCandidates.length,
    perspectiva,
    audit: {
      seloConformidade: true,
      homologadoTse: true,
      tseRegistro: poll.tseRegistro,
      diasDivulgacao: compliance.diasDesdeDivulgacao,
      instituto: poll.instituto,
      contratante: poll.contratante,
      criteriosAtendidos: compliance.criteriosAtendidos,
      criteriosFalhos: [],
      motivoTransparencia: 'Pesquisa oficial homologada no TSE e auditada como 100% independente.',
    },
  };
}
