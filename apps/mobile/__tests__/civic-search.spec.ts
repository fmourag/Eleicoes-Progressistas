import { searchMandateProposals } from '../utils/civic-search';
import { MandateProposalDetail } from '@np/shared';

const mockProposals: MandateProposalDetail[] = [
  {
    pillar: 'p3',
    pillarInfo: { label: 'Desenvolvimento Sustentável', icon: '🌿' },
    title: 'Defesa Ambiental e Transição Ecológica Justa',
    description: 'Universalização do saneamento e proteção de recursos hídricos.',
    mandatoScope: 'LEGISLATIVO FEDERAL',
    competenciaMandato: 'Representação parlamentar',
    diagnostico: 'Milhões de moradores da Baixada Fluminense ainda convivem com esgoto a céu aberto e falta de água tratada.',
    diretrizes: 'Fiscalização rigorosa e aceleração do cumprimento das metas contratuais de universalização do saneamento básico (água e esgoto) até 2030.',
    metasAcoes: [
      'Fiscalização contínua pela agência reguladora para cumprimento das metas de saneamento.',
      'Destinação de emendas para obras de coleta de esgoto e despoluição de bacias hidrográficas.',
      'Apoio a programas de reciclagem e gestão de resíduos sólidos comunitários.'
    ],
    beneficiarios: 'Moradores da Baixada e periferias',
    abrangencia: 'Estadual',
    impacto: 'Melhoria na saúde pública e redução de internações por veiculação hídrica.',
    viabilidadeOrcamentaria: 'Recursos do Fundo Nacional de Mudança do Clima e emendas parlamentares.',
    translatedText: 'Plano focado em água potável e esgoto tratado para todos.'
  },
  {
    pillar: 'p1',
    pillarInfo: { label: 'Educação Pública', icon: '📚' },
    title: 'Expansão da Educação Infantil e Ensino Integral',
    description: 'Garantia de creches e valorização dos profissionais da educação.',
    mandatoScope: 'LEGISLATIVO FEDERAL',
    competenciaMandato: 'Elaboração de leis orçamentárias',
    diagnostico: 'Falta de vagas em creches para mães trabalhadoras e evasão escolar no ensino médio.',
    diretrizes: 'Priorizar a destinação orçamentária do Fundeb para ampliação de vagas em creches públicas e tempo integral.',
    metasAcoes: [
      'Criação do programa nacional de apoio a creches comunitárias.',
      'Piso salarial nacional para os profissionais da educação básica.',
      'Bolsa permanência para estudantes vulneráveis.'
    ],
    beneficiarios: 'Crianças e jovens da rede pública',
    abrangencia: 'Nacional',
    impacto: 'Aumento da escolaridade e suporte às famílias trabalhadoras.',
    viabilidadeOrcamentaria: 'Aporte de 25% da complementação da União ao Fundeb.',
    translatedText: 'Mais creches e escolas em tempo integral com professores valorizados.'
  },
  {
    pillar: 'p4',
    pillarInfo: { label: 'Trabalho Digno', icon: '💼' },
    title: 'Emprego, Renda e Direitos Trabalhistas',
    description: 'Combate à precarização e incentivo ao microempreendedorismo.',
    mandatoScope: 'LEGISLATIVO FEDERAL',
    competenciaMandato: 'Legislação trabalhista e fiscal',
    diagnostico: 'Alto índice de informalidade e baixos salários na juventude.',
    diretrizes: 'Fortalecer a negociação coletiva e garantir tributação progressiva sobre lucros.',
    metasAcoes: [
      'Apoio à política de valorização do salário mínimo acima da inflação.',
      'Microcrédito produtivo orientado para pequenos negócios e MEIs.',
      'Isenção de imposto de renda para quem ganha até 5 salários mínimos.'
    ],
    beneficiarios: 'Trabalhadores formais, informais e microempreendedores',
    abrangencia: 'Nacional',
    impacto: 'Distribuição de renda e dinamização do consumo popular.',
    viabilidadeOrcamentaria: 'Reforma tributária progressiva.',
    translatedText: 'Salário valorizado e menos impostos para a classe trabalhadora.'
  }
];

describe('Civic Search (Client-Side Mandate Proposals)', () => {
  it('1. Correspondência exata de palavras-chave (ex: "saneamento")', () => {
    const results = searchMandateProposals('saneamento', mockProposals);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].proposal.pillar).toBe('p3');
    expect(results[0].relevanceScore).toBeGreaterThanOrEqual(50);
  });

  it('2. Expansão semântica via sinônimos cívicos ("água na torneira" encontra saneamento)', () => {
    const results = searchMandateProposals('agua na torneira', mockProposals);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].proposal.pillar).toBe('p3');
    expect(results[0].matchedSnippet).toContain('água');
  });

  it('2.1 Expansão semântica ("creche" encontra "Educação Infantil")', () => {
    const results = searchMandateProposals('vagas de creche', mockProposals);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].proposal.pillar).toBe('p1');
    expect(results[0].relevanceScore).toBeGreaterThanOrEqual(40);
  });

  it('2.2 Expansão semântica ("imposto" encontra tributação progressiva e salário)', () => {
    const results = searchMandateProposals('reduzir imposto', mockProposals);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].proposal.pillar).toBe('p4');
  });

  it('3. Ranqueamento correto por pontuação de relevância decrescente', () => {
    const results = searchMandateProposals('esgoto e saneamento basico', mockProposals);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].relevanceScore).toBeGreaterThanOrEqual(results[i].relevanceScore);
    }
  });

  it('4. Resiliência a acentos, maiúsculas/minúsculas e pontuações', () => {
    const r1 = searchMandateProposals('EDUCAÇÃO PÚBLICA!!', mockProposals);
    const r2 = searchMandateProposals('educacao publica', mockProposals);
    expect(r1.length).toBe(r2.length);
    expect(r1[0]?.proposal.pillar).toBe('p1');
  });

  it('5. Consultas vazias ou stopwords retornam array vazio', () => {
    expect(searchMandateProposals('', mockProposals)).toEqual([]);
    expect(searchMandateProposals('   ', mockProposals)).toEqual([]);
    expect(searchMandateProposals('de do que', mockProposals)).toEqual([]);
  });
});
