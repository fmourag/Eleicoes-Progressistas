import { PrismaClient, Cargo, ElectionLevel, CandidaturaStatus } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
  },
});

const EXCLUDED_CONSERVATIVE_PARTIES = [
  'PL',
  'REPUBLICANOS',
  'REPUBLICANO',
  'PP',
  'UNIÃO',
  'UNIAO',
  'UNIÃO BRASIL',
  'UNIAO BRASIL',
  'PATRIOTA',
  'PATRIOTAS',
  'AVANTE',
  'PRD',
  'MDB',
  'PODE',
  'PODEMOS',
  'NOVO',
  'PSDB',
  'MISSÃO',
  'MISSAO',
];

const PARTY_NUMBERS: Record<string, number> = {
  PT: 13,
  PSOL: 50,
  PSB: 40,
  PCDOB: 65,
  PDT: 12,
  REDE: 18,
  PV: 43,
  CIDADANIA: 23,
  SOLIDARIEDADE: 77,
  AVANTE: 70,
  PODE: 20,
  MDB: 15,
  PSD: 55,
  PSDB: 45,
  AGIR: 36,
  PMB: 35,
  DC: 27,
  PCB: 21,
  PCO: 29,
  PSTU: 16,
  UP: 80,
  REPUBLICANOS: 10,
};

function getPartyNumber(partySigla: string): number {
  return PARTY_NUMBERS[partySigla?.toUpperCase()] || 13;
}

function generateScores(party: string, cargo: string): Record<string, number> {
  const p = party.toUpperCase();
  if (['PSOL', 'UP', 'PCB', 'PSTU', 'PCO'].includes(p)) {
    return { p1: 0.96, p2: 0.98, p3: 0.92, p4: 0.94, p5: 0.93, p6: 0.98, p7: 0.99, p8: 0.90, p9: 0.98, p10: 0.95, p11: 0.98, p12: 0.99, p13: 0.88 };
  }
  if (['PT', 'PCDOB'].includes(p)) {
    return { p1: 0.94, p2: 0.95, p3: 0.90, p4: 0.92, p5: 0.91, p6: 0.95, p7: 0.96, p8: 0.88, p9: 0.95, p10: 0.88, p11: 0.96, p12: 0.97, p13: 0.92 };
  }
  if (['PSB', 'PDT'].includes(p)) {
    return { p1: 0.95, p2: 0.88, p3: 0.88, p4: 0.90, p5: 0.90, p6: 0.88, p7: 0.90, p8: 0.86, p9: 0.92, p10: 0.86, p11: 0.94, p12: 0.93, p13: 0.90 };
  }
  if (['REDE', 'PV'].includes(p)) {
    return { p1: 0.90, p2: 0.86, p3: 0.99, p4: 0.88, p5: 0.86, p6: 0.84, p7: 0.90, p8: 0.86, p9: 0.90, p10: 0.85, p11: 0.92, p12: 0.88, p13: 0.89 };
  }
  if (['AGIR', 'SOLIDARIEDADE'].includes(p)) {
    return { p1: 0.86, p2: 0.82, p3: 0.80, p4: 0.84, p5: 0.84, p6: 0.84, p7: 0.88, p8: 0.82, p9: 0.88, p10: 0.82, p11: 0.86, p12: 0.82, p13: 0.86 };
  }
  if (['PSD', 'CIDADANIA', 'PMB'].includes(p)) {
    return { p1: 0.85, p2: 0.80, p3: 0.82, p4: 0.85, p5: 0.85, p6: 0.78, p7: 0.80, p8: 0.82, p9: 0.85, p10: 0.85, p11: 0.85, p12: 0.80, p13: 0.88 };
  }
  if (['REPUBLICANOS', 'PL', 'NOVO', 'PP', 'UNIÃO', 'PRD', 'PATRIOTA', 'AVANTE', 'MDB', 'PODE', 'PODEMOS', 'PSDB'].includes(p)) {
    return { p1: 0.32, p2: 0.28, p3: 0.22, p4: 0.35, p5: 0.40, p6: 0.20, p7: 0.24, p8: 0.30, p9: 0.32, p10: 0.35, p11: 0.30, p12: 0.25, p13: 0.45 };
  }
  return { p1: 0.88, p2: 0.85, p3: 0.85, p4: 0.75, p5: 0.80, p6: 0.85, p7: 0.88, p8: 0.80, p9: 0.90, p10: 0.85, p11: 0.88, p12: 0.86, p13: 0.88 };
}

async function fetchFederalDeputies() {
  console.log('📡 Buscando Deputados Federais em exercício na API Oficial da Câmara...');
  try {
    const res = await fetch('https://dadosabertos.camara.leg.br/api/v2/deputados?ordem=ASC&ordenarPor=nome', {
      headers: { Accept: 'application/json', 'User-Agent': 'EleicoesProgressistas/2.2.0' },
    });
    if (!res.ok) throw new Error(`Erro API Câmara: ${res.status}`);
    const json: any = await res.json();
    const dados: any[] = json.dados || [];

    const progressive = dados.filter(
      (d) => d.siglaPartido && !EXCLUDED_CONSERVATIVE_PARTIES.includes(d.siglaPartido.toUpperCase())
    );
    console.log(`✅ ${progressive.length} Deputados Federais progressistas e democráticos obtidos.`);
    return progressive;
  } catch (err) {
    console.warn('Falha na API da Câmara:', (err as Error).message);
    return [];
  }
}

async function fetchSenators() {
  console.log('📡 Buscando Senadores da República em exercício na API Oficial do Senado...');
  try {
    const res = await fetch('https://legis.senado.leg.br/dadosabertos/senador/lista/atual.json', {
      headers: { Accept: 'application/json', 'User-Agent': 'EleicoesProgressistas/2.2.0' },
    });
    if (!res.ok) throw new Error(`Erro API Senado: ${res.status}`);
    const json: any = await res.json();
    const parl: any[] = json.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar || [];

    const progressive = parl.filter((s) => {
      const party = s.IdentificacaoParlamentar?.SiglaPartidoParlamentar?.toUpperCase();
      return party && !EXCLUDED_CONSERVATIVE_PARTIES.includes(party);
    });
    console.log(`✅ ${progressive.length} Senadores progressistas e democráticos obtidos.`);
    return progressive;
  } catch (err) {
    console.warn('Falha na API do Senado:', (err as Error).message);
    return [];
  }
}

const REAL_GOVERNORS = [
  // Região Norte
  { tseId: 'gov_ac_jorge', name: 'Jorge Ney Viana Macedo Neves', socialName: 'Jorge Viana', viceName: 'Marcus Alexandre', party: 'PT', state: 'AC', municipality: 'Rio Branco', photoUrl: '/candidates/gov_ac_jorge.jpg' },
  { tseId: 'gov_ap_clecio', name: 'Clécio Luís Vilhena Vieira', socialName: 'Clécio Luís', viceName: 'Antônio Teles Júnior', party: 'SOLIDARIEDADE', state: 'AP', municipality: 'Macapá', photoUrl: '/candidates/gov_ap_clecio.jpg' },
  { tseId: 'gov_am_braga', name: 'Carlos Eduardo de Souza Braga', socialName: 'Eduardo Braga', viceName: 'Anne Moura', party: 'MDB', state: 'AM', municipality: 'Manaus', photoUrl: '/candidates/gov_am_braga.jpg' },
  { tseId: 'gov_pa_helder', name: 'Helder Zahluth Barbalho', socialName: 'Helder Barbalho', viceName: 'Hana Ghassan Tuma', party: 'MDB', state: 'PA', municipality: 'Belém', photoUrl: '/candidates/gov_pa_helder.jpg' },
  { tseId: 'gov_ro_daniel', name: 'Daniel Pereira', socialName: 'Daniel Pereira', viceName: 'Anselmo de Jesus', party: 'SOLIDARIEDADE', state: 'RO', municipality: 'Porto Velho', photoUrl: '/candidates/gov_ro_daniel.jpg' },
  { tseId: 'gov_rr_teresa', name: 'Maria Teresa Saenz Surita Jucá', socialName: 'Teresa Surita', viceName: 'Édio Lopes', party: 'MDB', state: 'RR', municipality: 'Boa Vista', photoUrl: '/candidates/gov_rr_teresa.jpg' },
  { tseId: 'gov_to_mourao', name: 'Paulo Roberto Mourão', socialName: 'Paulo Mourão', viceName: 'Professora Germana Pires', party: 'PT', state: 'TO', municipality: 'Palmas', photoUrl: '/candidates/gov_to_mourao.jpg' },

  // Região Nordeste
  { tseId: 'gov_al_dantas', name: 'Paulo Suruagy do Amaral Dantas', socialName: 'Paulo Dantas', viceName: 'José Wanderley Neto', party: 'MDB', state: 'AL', municipality: 'Maceió', photoUrl: '/candidates/gov_al_dantas.jpg' },
  { tseId: 'gov_ba_jeronimo', name: 'Jerônimo Rodrigues Souza', socialName: 'Jerônimo Rodrigues', viceName: 'Geraldo Júnior', party: 'PT', state: 'BA', municipality: 'Salvador', photoUrl: '/candidates/gov_ba_jeronimo.jpg' },
  { tseId: 'gov_ce_elmano', name: 'Elmano de Freitas da Costa', socialName: 'Elmano de Freitas', viceName: 'Jade Romero', party: 'PT', state: 'CE', municipality: 'Fortaleza', photoUrl: '/candidates/gov_ce_elmano.jpg' },
  { tseId: 'gov_ma_brandao', name: 'Carlos Orleans Brandão Júnior', socialName: 'Carlos Brandão', viceName: 'Felipe Camarão', party: 'PSB', state: 'MA', municipality: 'São Luís', photoUrl: '/candidates/gov_ma_brandao.jpg' },
  { tseId: 'gov_pb_azevedo', name: 'João Azevêdo Lins Filho', socialName: 'João Azevêdo', viceName: 'Lucas Ribeiro', party: 'PSB', state: 'PB', municipality: 'João Pessoa', photoUrl: '/candidates/gov_pb_azevedo.jpg' },
  { tseId: 'gov_pe_cabral', name: 'Danilo Jorge de Barros Cabral', socialName: 'Danilo Cabral', viceName: 'Luciana Santos', party: 'PSB', state: 'PE', municipality: 'Recife', photoUrl: '/candidates/gov_pe_cabral.jpg' },
  { tseId: 'gov_pi_rafael', name: 'Rafael Tajra Fonteles', socialName: 'Rafael Fonteles', viceName: 'Themístocles Filho', party: 'PT', state: 'PI', municipality: 'Teresina', photoUrl: '/candidates/gov_pi_rafael.jpg' },
  { tseId: 'gov_rn_fatima', name: 'Maria de Fátima Bezerra', socialName: 'Fátima Bezerra', viceName: 'Walter Alves', party: 'PT', state: 'RN', municipality: 'Natal', photoUrl: '/candidates/gov_rn_fatima.jpg' },
  { tseId: 'gov_se_mitidieri', name: 'Fábio Cruz Mitidieri', socialName: 'Fábio Mitidieri', viceName: 'Zezinho Sobral', party: 'PSD', state: 'SE', municipality: 'Aracaju', photoUrl: '/candidates/gov_se_mitidieri.jpg' },

  // Região Centro-Oeste
  { tseId: 'gov_df_grass', name: 'Leandro Antonio Grass Peixoto', socialName: 'Leandro Grass', viceName: 'Olgamir Amancia', party: 'PV', state: 'DF', municipality: 'Brasília', photoUrl: '/candidates/gov_df_grass.jpg' },
  { tseId: 'gov_go_wolmir', name: 'Wolmir Therezio Amado', socialName: 'Professor Wolmir Amado', viceName: 'Fernando Tibúrcio', party: 'PT', state: 'GO', municipality: 'Goiânia', photoUrl: '/candidates/gov_go_wolmir.jpg' },
  { tseId: 'gov_mt_natasha', name: 'Natasha Slhessarenko', socialName: 'Dra. Natasha Slhessarenko', viceName: 'Vinicius Hugueney', party: 'PSB', state: 'MT', municipality: 'Cuiabá', photoUrl: '/candidates/gov_mt_natasha.jpg' },
  { tseId: 'gov_ms_giselle', name: 'Giselle Marques de Araújo', socialName: 'Giselle Marques', viceName: 'Mário Fonseca', party: 'PT', state: 'MS', municipality: 'Campo Grande', photoUrl: '/candidates/gov_ms_giselle.jpg' },

  // Região Sudeste
  { tseId: 'gov_es_casagrande', name: 'José Renato Casagrande', socialName: 'Renato Casagrande', viceName: 'Ricardo Ferraço', party: 'PSB', state: 'ES', municipality: 'Vitória', photoUrl: '/candidates/gov_es_casagrande.jpg' },
  { tseId: 'gov_mg_silveira', name: 'Alexandre Silveira de Oliveira', socialName: 'Alexandre Silveira', viceName: 'Paulo Brant', party: 'PSD', state: 'MG', municipality: 'Belo Horizonte', photoUrl: '/candidates/gov_mg_silveira.jpg' },
  { tseId: 'gov_rj_paes', name: 'Eduardo da Costa Paes', socialName: 'Eduardo Paes', viceName: 'Eduardo Cavaliere', party: 'PSD', state: 'RJ', municipality: 'Rio de Janeiro', photoUrl: '/candidates/gov_rj_paes.jpg' },
  { tseId: 'gov_sp_franca', name: 'Márcio Luiz França Gomes', socialName: 'Márcio França', viceName: 'Juliano Medeiros', party: 'PSB', state: 'SP', municipality: 'São Paulo', photoUrl: '/candidates/gov_sp_franca.jpg', numeroUrna: '40', status: 'DEFERIDO' },
  { tseId: 'gov_sp_haddad', name: 'Fernando Haddad', socialName: 'Fernando Haddad', viceName: 'Lúcia França', party: 'PT', state: 'SP', municipality: 'São Paulo', photoUrl: '/candidates/gov_sp_haddad.jpg', numeroUrna: '13', status: 'EM_ANALISE' },
  { tseId: 'gov_sp_vivian', name: 'Vivian Mendes da Silva', socialName: 'Vivian Mendes', viceName: 'Tito Flávio', party: 'UP', state: 'SP', municipality: 'São Paulo', photoUrl: '/candidates/gov_sp_vivian.jpg', numeroUrna: '80', status: 'EM_ANALISE' },
  { tseId: 'gov_sp_machado', name: 'Carlos Alberto Machado', socialName: 'Carlos Machado', viceName: 'Edson Dorta', party: 'PCB', state: 'SP', municipality: 'São Paulo', photoUrl: '/candidates/gov_sp_machado.jpg', numeroUrna: '21', status: 'EM_ANALISE' },
  { tseId: 'gov_sp_izadora', name: 'Izadora Cristina Dias da Silva', socialName: 'Izadora Dias', viceName: 'Manoel Messias', party: 'PCO', state: 'SP', municipality: 'São Paulo', photoUrl: '/candidates/gov_sp_izadora.jpg', numeroUrna: '29', status: 'EM_ANALISE' },
  { tseId: 'gov_sp_veralucia', name: 'Vera Lúcia Pereira da Silva Salgado', socialName: 'Vera Lúcia', viceName: 'Gabriel Colombo', party: 'PSTU', state: 'SP', municipality: 'São Paulo', photoUrl: '/candidates/gov_sp_veralucia.jpg', numeroUrna: '16', status: 'EM_ANALISE' },
  { tseId: 'gov_sp_edjane', name: 'Edjane Lima de Sousa', socialName: 'Edjane Lima', viceName: 'Reinaldo Santos', party: 'AGIR', state: 'SP', municipality: 'São Paulo', photoUrl: '/candidates/gov_sp_edjane.jpg', numeroUrna: '36', status: 'EM_ANALISE' },

  // Região Sul
  { tseId: 'gov_pr_requiao', name: 'Roberto Requião de Mello e Silva', socialName: 'Roberto Requião', viceName: 'Jorge Samek', party: 'PT', state: 'PR', municipality: 'Curitiba', photoUrl: '/candidates/gov_pr_requiao.jpg' },
  { tseId: 'gov_rs_pretto', name: 'Edegar Pretto', socialName: 'Edegar Pretto', viceName: 'Pedro Ruas', party: 'PT', state: 'RS', municipality: 'Porto Alegre', photoUrl: '/candidates/gov_rs_pretto.jpg' },
  { tseId: 'gov_sc_decio', name: 'Décio Nery de Lima', socialName: 'Décio Lima', viceName: 'Marcio Búrigo', party: 'PT', state: 'SC', municipality: 'Florianópolis', photoUrl: '/candidates/gov_sc_decio.jpg' },
];

const REAL_SENATORS = [
  // Rio de Janeiro (RJ)
  {
    tseId: 'sen_rj_molon',
    name: 'Alessandro Lucci Cavalcanti Molon',
    socialName: 'Alessandro Molon',
    party: 'PSB',
    numeroUrna: '400',
    state: 'RJ',
    municipality: 'Rio de Janeiro',
    photoUrl: '/candidates/sen_rj_molon.jpg',
    governmentPlanSummary: 'Mandato no Senado Federal pelo RJ: Defesa da sustentabilidade ambiental, inovação tecnológica, integridade governamental e fortalecimento das instituições republicanas.',
    proposals: [
      { pillar: 'p3', title: 'Defesa Ambiental e Transição Ecológica Justa', description: 'Proteção dos biomas Mata Atlântica e Amazônia, combate ao desmatamento e fomento à bioeconomia.' },
      { pillar: 'p10', title: 'Transparência Pública e Combate à Corrupção', description: 'Autor do Marco Civil da Internet; defesa do controle social, integridade governamental e dados abertos.' },
      { pillar: 'p11', title: 'Educação Pública e Ciência Soberana', description: 'Fortalecimento do Fundeb, valorização do magistério e ampliação de investimentos em pesquisa científica.' },
    ],
  },
  {
    tseId: 'sen_rj_lindbergh',
    name: 'Lindbergh Farias',
    socialName: 'Lindbergh Farias',
    party: 'PT',
    numeroUrna: '131',
    state: 'RJ',
    municipality: 'Nova Iguaçu',
    photoUrl: '/candidates/sen_rj_lindbergh.jpg',
    governmentPlanSummary: 'Mandato no Senado Federal pelo RJ: Foco na valorização salarial, reindustrialização nacional e investimentos públicos em infraestrutura e seguridade social.',
    proposals: [
      { pillar: 'p2', title: 'Revogação dos Retrocessos Trabalhistas e Salário Digno', description: 'Fortalecimento dos direitos da classe trabalhadora, valorização real do salário mínimo e geração de empregos.' },
      { pillar: 'p5', title: 'Soberania Nacional e Reindustrialização Fluminense', description: 'Recuperação do parque naval e da cadeia produtiva de óleo, gás e energia no Estado do Rio de Janeiro.' },
      { pillar: 'p6', title: 'Combate à Desigualdade e Justiça Social', description: 'Reforma tributária progressiva, tributação de super-ricos e reforço contínuo dos programas de transferência de renda.' },
    ],
  },
  {
    tseId: 'sen_rj_benedita',
    name: 'Benedita Sousa da Silva Sampaio',
    socialName: 'Benedita da Silva',
    party: 'PT',
    numeroUrna: '130',
    state: 'RJ',
    municipality: 'Rio de Janeiro',
    photoUrl: '/candidates/sen_rj_benedita.jpg',
    governmentPlanSummary: 'Mandato no Senado Federal pelo RJ: Trajetória histórica na Constituinte de 1988, defesa dos direitos humanos, igualdade racial, direitos das mulheres e fortalecimento integral do SUS.',
    proposals: [
      { pillar: 'p7', title: 'Igualdade Racial e Defesa das Comunidades Periféricas', description: 'Políticas afirmativas, combate ao racismo estrutural, regularização fundiária e urbanização das favelas.' },
      { pillar: 'p9', title: 'Fortalecimento Integral do SUS e Saúde da Mulher', description: 'Defesa da saúde pública 100% gratuita, expansão da saúde da família e proteção integral dos direitos reprodutivos.' },
      { pillar: 'p12', title: 'Direitos das Mulheres e Igualdade de Oportunidades', description: 'Equiparação salarial real entre homens e mulheres, combate à violência de gênero e redes de apoio a mães trabalhadoras.' },
    ],
  },
  {
    tseId: 'sen_rj_tarcisio',
    name: 'Tarcísio Motta de Carvalho',
    socialName: 'Tarcísio Motta',
    party: 'PSOL',
    numeroUrna: '500',
    state: 'RJ',
    municipality: 'Rio de Janeiro',
    photoUrl: '/candidates/sen_rj_tarcisio.jpg',
    governmentPlanSummary: 'Mandato no Senado Federal pelo RJ: Defesa da educação pública de qualidade, segurança cidadã com inteligência policial, direitos humanos e cultura popular.',
    proposals: [
      { pillar: 'p11', title: 'Educação Pública Emancipatória e Valorização Docente', description: 'Garantia de 10% do PIB para educação, piso salarial nacional dos profissionais da educação e escolas inclusivas.' },
      { pillar: 'p10', title: 'Segurança Cidadã e Combate às Milícias e Crime Organizado', description: 'Desmilitarização, inteligência contra lavagem de dinheiro das milícias e defesa intransigente dos Direitos Humanos.' },
      { pillar: 'p8', title: 'Cultura Popular e Democracia Participativa', description: 'Fomento descentralizado à cultura popular, favelada e comunitária e orçamentos participativos deliberativos.' },
    ],
  },
  // São Paulo (SP)
  {
    tseId: 'sen_sp_franca',
    name: 'Márcio Luiz França Gomes',
    socialName: 'Márcio França',
    party: 'PSB',
    numeroUrna: '400',
    state: 'SP',
    municipality: 'São Paulo',
    photoUrl: '/candidates/280001600021.jpg',
    governmentPlanSummary: 'Mandato no Senado Federal por SP: Desenvolvimento econômico regional, apoio às micro e pequenas empresas, portos, aeroportos e inovação.',
    proposals: [
      { pillar: 'p5', title: 'Desenvolvimento e Logística Nacional', description: 'Modernização da infraestrutura portuária, ferroviária e hidroviária sustentável.' },
      { pillar: 'p6', title: 'Empreendedorismo Popular e Crédito Produtivo', description: 'Linhas de crédito acessíveis para cooperativas e pequenos negócios.' },
    ],
  },
  {
    tseId: 'sen_sp_juliana',
    name: 'Juliana Cardoso',
    socialName: 'Juliana Cardoso',
    party: 'PT',
    numeroUrna: '131',
    state: 'SP',
    municipality: 'São Paulo',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal por SP: Defesa dos povos indígenas, periferias, direitos humanos e políticas sociais inclusivas.',
    proposals: [
      { pillar: 'p7', title: 'Direitos dos Povos Originários e Periferias', description: 'Demarcação de terras indígenas, combate ao racismo e investimentos em saneamento.' },
      { pillar: 'p12', title: 'Direitos das Mulheres e Igualdade de Gênero', description: 'Combate ao feminicídio e programas de autonomia financeira feminina.' },
    ],
  },
  // Minas Gerais (MG)
  {
    tseId: 'sen_mg_reginaldo',
    name: 'Reginaldo Lázaro de Oliveira Lopes',
    socialName: 'Reginaldo Lopes',
    party: 'PT',
    numeroUrna: '130',
    state: 'MG',
    municipality: 'Belo Horizonte',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal por MG: Relator da Reforma Tributária, defesa da educação e do desenvolvimento industrial mineiro.',
    proposals: [
      { pillar: 'p11', title: 'Revolução Educacional e Universidade Gratuita', description: 'Expansão dos Institutos Federais e consolidação do Fundeb permanente.' },
      { pillar: 'p5', title: 'Justiça Tributária e Reindustrialização', description: 'Simplificação tributária, desoneração do consumo e atração de indústrias sustentáveis.' },
    ],
  },
  {
    tseId: 'sen_mg_duda',
    name: 'Duda Salabert Rosa',
    socialName: 'Duda Salabert',
    party: 'PDT',
    numeroUrna: '120',
    state: 'MG',
    municipality: 'Belo Horizonte',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal por MG: Defesa do meio ambiente, segurança hídrica da Serra do Curral, educação e direitos humanos.',
    proposals: [
      { pillar: 'p3', title: 'Proteção das Serras, Águas e Biomas Mineiros', description: 'Fim da mineração predatória em áreas de preservação ambiental e transição ecológica justa.' },
      { pillar: 'p7', title: 'Cidadania Plena, Direitos LGBTQIA+ e Diversidade', description: 'Inclusão produtiva, respeito à diversidade e criminalização de toda forma de discriminação.' },
    ],
  },
  // Distrito Federal (DF)
  {
    tseId: 'sen_df_erika',
    name: 'Erika Jucene Kokay',
    socialName: 'Erika Kokay',
    party: 'PT',
    numeroUrna: '130',
    state: 'DF',
    municipality: 'Brasília',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal pelo DF: Defesa dos serviços públicos, direitos humanos, autonomia política do DF e valorização dos servidores.',
    proposals: [
      { pillar: 'p10', title: 'Defesa dos Direitos Humanos e Serviços Públicos', description: 'Valorização do funcionalismo público e combate ao desmonte do Estado social.' },
      { pillar: 'p2', title: 'Proteção aos Trabalhadores e Bancários', description: 'Combate à precarização laboral e defesa das estatais estratégicas.' },
    ],
  },
  // Bahia (BA)
  {
    tseId: 'sen_ba_lidice',
    name: 'Lídice da Mata e Souza',
    socialName: 'Lídice da Mata',
    party: 'PSB',
    numeroUrna: '400',
    state: 'BA',
    municipality: 'Salvador',
    photoUrl: '/candidates/280001600012.jpg',
    governmentPlanSummary: 'Mandato no Senado Federal pela BA: Defesa da cultura, educação, igualdade de gênero e desenvolvimento socioeconômico do Nordeste.',
    proposals: [
      { pillar: 'p8', title: 'Fortalecimento da Cultura Brasileira e Nordestina', description: 'Valorização do patrimônio histórico, descentralização de recursos culturais e fomento às artes.' },
      { pillar: 'p12', title: 'Empoderamento Feminino e Combate à Violência', description: 'Ampliação de delegacias da mulher e políticas públicas de equidade salarial.' },
    ],
  },
  // Ceará (CE)
  {
    tseId: 'sen_ce_luizianne',
    name: 'Luizianne de Oliveira Lins',
    socialName: 'Luizianne Lins',
    party: 'PT',
    numeroUrna: '130',
    state: 'CE',
    municipality: 'Fortaleza',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal pelo CE: Desenvolvimento urbano sustentável, habitação popular, combate à seca e inclusão social.',
    proposals: [
      { pillar: 'p1', title: 'Habitação Popular e Direito à Cidade', description: 'Ampliação do Minha Casa Minha Vida e regularização fundiária urbana no Nordeste.' },
      { pillar: 'p6', title: 'Segurança Hídrica e Convivência com o Semiárido', description: 'Cisternas, energia solar comunitária e apoio à agricultura familiar camponesa.' },
    ],
  },
  // Pernambuco (PE)
  {
    tseId: 'sen_pe_marilia',
    name: 'Marília Valença Rocha Arraes de Alencar',
    socialName: 'Marília Arraes',
    party: 'SOLIDARIEDADE',
    numeroUrna: '770',
    state: 'PE',
    municipality: 'Recife',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal por PE: Defesa da previdência pública, assistência social, emprego digno e desenvolvimento regional do Nordeste.',
    proposals: [
      { pillar: 'p2', title: 'Seguridade Social e Assistência Pública', description: 'Fortalecimento da previdência social pública e combate às fraudes e perdas de benefícios.' },
      { pillar: 'p5', title: 'Polo Industrial e Tecnológico do Nordeste', description: 'Estímulo à atração de indústrias sustentáveis e centros de tecnologia em Pernambuco.' },
    ],
  },
  // Rio Grande do Sul (RS)
  {
    tseId: 'sen_rs_manuela',
    name: 'Manuela Pinto Vieira d\'Ávila',
    socialName: 'Manuela d\'Ávila',
    party: 'PCDOB',
    numeroUrna: '650',
    state: 'RS',
    municipality: 'Porto Alegre',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal pelo RS: Combate à desinformação, direitos das mulheres, defesa da democracia e reconstrução climática do RS.',
    proposals: [
      { pillar: 'p10', title: 'Combate às Fake News e Defesa Democrática', description: 'Regulação democrática de plataformas digitais, educação midiática e integridade informacional.' },
      { pillar: 'p3', title: 'Adaptação Climática e Reconstrução Ecológica', description: 'Fundo nacional de emergência e adaptação climática com foco nas cidades gaúchas.' },
    ],
  },
  // Paraná (PR)
  {
    tseId: 'sen_pr_carol',
    name: 'Ana Carolina Dartora',
    socialName: 'Carol Dartora',
    party: 'PT',
    numeroUrna: '131',
    state: 'PR',
    municipality: 'Curitiba',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal pelo PR: Primeira deputada negra eleita pelo PR, defesa intransigente dos direitos humanos, educação pública e igualdade racial.',
    proposals: [
      { pillar: 'p7', title: 'Igualdade Racial e Ações Afirmativas', description: 'Cotas permanentes no serviço público e nas pós-graduações, com fiscalização anti-fraude.' },
      { pillar: 'p11', title: 'Educação Pública Plural e Antirracista', description: 'Implementação efetiva da história afro-brasileira e indígena nos currículos escolares.' },
    ],
  },
  // Santa Catarina (SC)
  {
    tseId: 'sen_sc_decio',
    name: 'Décio Nery de Lima',
    socialName: 'Décio Lima',
    party: 'PT',
    numeroUrna: '130',
    state: 'SC',
    municipality: 'Florianópolis',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal por SC: Fortalecimento das micro e pequenas empresas (Sebrae), inovação tecnológica e integração porto-indústria.',
    proposals: [
      { pillar: 'p5', title: 'Apoio às Pequenas Empresas e Inovação', description: 'Crédito desburocratizado para inovação e desenvolvimento produtivo catarinense.' },
      { pillar: 'p3', title: 'Infraestrutura Resiliente a Enchentes e Desastres', description: 'Obras de macrodrenagem e prevenção de catástrofes climáticas no Vale do Itajaí.' },
    ],
  },
  // Alagoas (AL)
  {
    tseId: 'sen_al_ronaldo',
    name: 'Ronaldo Medeiros',
    socialName: 'Ronaldo Medeiros',
    party: 'PT',
    numeroUrna: '130',
    state: 'AL',
    municipality: 'Maceió',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal por AL: Defesa dos trabalhadores rurais, reforma agrária popular, combate à pobreza e fortalecimento da saúde pública.',
    proposals: [
      { pillar: 'p2', title: 'Proteção ao Trabalhador Rural e Urbano', description: 'Combate ao trabalho análogo à escravidão e garantia de direitos sindicais.' },
      { pillar: 'p6', title: 'Agricultura Familiar e Segurança Alimentar', description: 'Fortalecimento do PAA (Programa de Aquisição de Alimentos) e Pronaf em Alagoas.' },
    ],
  },
  // Paraíba (PB)
  {
    tseId: 'sen_pb_anastacio',
    name: 'Frei Anastácio Ribeiro',
    socialName: 'Frei Anastácio',
    party: 'PT',
    numeroUrna: '130',
    state: 'PB',
    municipality: 'João Pessoa',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal pela PB: Histórico líder das lutas camponesas e da agricultura familiar, ecologia e justiça social no Nordeste.',
    proposals: [
      { pillar: 'p6', title: 'Agricultura Familiar e Reforma Agrária', description: 'Distribuição justa de terras férteis e fomento à agroecologia sem veneno.' },
      { pillar: 'p3', title: 'Convivência Digna com o Semiárido e Energia Limpa', description: 'Projetos comunitários de dessalinização e energia solar popular na Paraíba.' },
    ],
  },
  // Rondônia (RO)
  {
    tseId: 'sen_ro_fatima',
    name: 'Fátima Cleide Rodrigues da Silva',
    socialName: 'Fátima Cleide',
    party: 'PT',
    numeroUrna: '130',
    state: 'RO',
    municipality: 'Porto Velho',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal por RO: Ex-senadora, defesa da Amazônia sustentável, valorização da educação pública e direitos dos povos da floresta.',
    proposals: [
      { pillar: 'p3', title: 'Desenvolvimento Sustentável da Amazônia Ocidental', description: 'Combate ao desmatamento ilegal e incentivo ao extrativismo florestal de base comunitária.' },
      { pillar: 'p11', title: 'Piso Salarial e Valorização dos Professores', description: 'Defesa da educação pública no campo e nas cidades de Rondônia.' },
    ],
  },
  // Rio Grande do Norte (RN)
  {
    tseId: 'sen_rn_natalia',
    name: 'Natália Bastos Bonavides',
    socialName: 'Natália Bonavides',
    party: 'PT',
    numeroUrna: '130',
    state: 'RN',
    municipality: 'Natal',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal pelo RN: Advogada popular, defesa da classe trabalhadora, habitação popular, juventude e direitos humanos.',
    proposals: [
      { pillar: 'p2', title: 'Direitos dos Trabalhadores por Aplicativos', description: 'Regulamentação trabalhista protetiva com seguridade social para trabalhadores de plataformas.' },
      { pillar: 'p1', title: 'Despejo Zero e Moradia Digna', description: 'Proteção contra despejos forçados e financiamento para habitação de interesse social.' },
    ],
  },
  // Pará (PA)
  {
    tseId: 'sen_pa_edmilson',
    name: 'Edmilson Brito Rodrigues',
    socialName: 'Edmilson Rodrigues',
    party: 'PSOL',
    numeroUrna: '500',
    state: 'PA',
    municipality: 'Belém',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal pelo PA: Arquiteto e urbanista, defesa da Amazônia viva, soberania dos povos ribeirinhos, educação e cultura amazônica.',
    proposals: [
      { pillar: 'p3', title: 'Amazônia Viva e Justiça Climática (COP30)', description: 'Recursos internacionais e nacionais diretos para os povos tradicionais da floresta.' },
      { pillar: 'p8', title: 'Valorização da Identidade e Cultura Amazônica', description: 'Fomento a artistas, museus, mestres de carimbó e culinária paraense tradicional.' },
    ],
  },
  // Amapá (AP)
  {
    tseId: 'sen_ap_camilo',
    name: 'Camilo Capiberibe',
    socialName: 'Camilo Capiberibe',
    party: 'PSB',
    numeroUrna: '400',
    state: 'AP',
    municipality: 'Macapá',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal pelo AP: Ex-governador, defesa do desenvolvimento sustentável do Amapá, bioeconomia e proteção dos recursos hídricos.',
    proposals: [
      { pillar: 'p3', title: 'Bioeconomia e Proteção da Foz do Amazonas', description: 'Transição energética limpa com salvaguardas socioambientais rigorosas.' },
      { pillar: 'p5', title: 'Conectividade e Desenvolvimento Regional Amapaense', description: 'Cabos de fibra óptica subaquática e integração logística para o Amapá.' },
    ],
  },
  // Acre (AC)
  {
    tseId: 'sen_ac_jorge',
    name: 'Jorge Ney Viana Macedo Neves',
    socialName: 'Jorge Viana',
    party: 'PT',
    numeroUrna: '130',
    state: 'AC',
    municipality: 'Rio Branco',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal pelo AC: Engenheiro florestal, ex-governador e ex-senador, referência internacional em florestania e desenvolvimento verde.',
    proposals: [
      { pillar: 'p3', title: 'Florestania e Manejo Florestal Sustentável', description: 'Criação de riquezas preservando a floresta em pé e valorizando seringueiros e povos originários.' },
      { pillar: 'p5', title: 'Integração Sul-Americana e Rota Transoceânica', description: 'Abertura de mercados para produtos sustentáveis da Amazônia pelo Oceano Pacífico.' },
    ],
  },
  // Amazonas (AM)
  {
    tseId: 'sen_am_marcelo',
    name: 'Marcelo Ramos Rodrigues',
    socialName: 'Marcelo Ramos',
    party: 'PT',
    numeroUrna: '130',
    state: 'AM',
    municipality: 'Manaus',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal pelo AM: Defesa intransigente da Zona Franca de Manaus, interiorização do desenvolvimento e ciência amazônica.',
    proposals: [
      { pillar: 'p5', title: 'Preservação da Zona Franca e Nova Indústria Verde', description: 'Segurança jurídica para a ZFM com investimentos vinculados em bioindústria e semicondutores.' },
      { pillar: 'p11', title: 'Universidade e Centros de Pesquisa na Amazônia', description: 'Investimentos massivos em biotecnologia e fármacos a partir da biodiversidade amazônica.' },
    ],
  },
  // Roraima (RR)
  {
    tseId: 'sen_rr_evangelista',
    name: 'Evangelista Siqueira',
    socialName: 'Evangelista Siqueira',
    party: 'PT',
    numeroUrna: '130',
    state: 'RR',
    municipality: 'Boa Vista',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal por RR: Defesa da demarcação e proteção das terras indígenas, combate ao garimpo ilegal e saúde básica nas fronteiras.',
    proposals: [
      { pillar: 'p7', title: 'Proteção aos Povos Yanomami e Macuxi', description: 'Extirpação definitiva do garimpo ilegal, despoluição por mercúrio e proteção sanitária.' },
      { pillar: 'p9', title: 'Saúde Pública de Fronteira e Assistência Humanitária', description: 'Apoio humanitário estruturado e recursos federais para a rede pública de Roraima.' },
    ],
  },
  // Tocantins (TO)
  {
    tseId: 'sen_to_mourao',
    name: 'Paulo Roberto Mourão',
    socialName: 'Paulo Mourão',
    party: 'PT',
    numeroUrna: '130',
    state: 'TO',
    municipality: 'Palmas',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal pelo TO: Agroecologia, convivência harmoniosa do agronegócio sustentável com pequenos produtores e preservação do Cerrado.',
    proposals: [
      { pillar: 'p3', title: 'Conservação das Águas e do Berço das Águas do Cerrado', description: 'Combate à desertificação e fomento ao plantio sustentável de grãos com matas ciliares protegidas.' },
      { pillar: 'p6', title: 'Crédito e Apoio à Agricultura Familiar Tocantinense', description: 'Eletrificação rural sustentável e compras públicas governamentais dos pequenos agricultores.' },
    ],
  },
  // Goiás (GO)
  {
    tseId: 'sen_go_otoni',
    name: 'Rubens Otoni Vieira Oliveira',
    socialName: 'Rubens Otoni',
    party: 'PT',
    numeroUrna: '130',
    state: 'GO',
    municipality: 'Anápolis',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal por GO: Defesa da transparência nos gastos públicos, ferrovia Norte-Sul e educação pública de qualidade.',
    proposals: [
      { pillar: 'p5', title: 'Logística Ferroviária e Industrialização do Centro-Oeste', description: 'Ampliação do transporte de cargas e passageiros limpo por trilhos.' },
      { pillar: 'p10', title: 'Transparência e Combate aos Privilégios Corporativos', description: 'Fim do orçamento secreto e controle rigoroso das renúncias fiscais.' },
    ],
  },
  // Mato Grosso (MT)
  {
    tseId: 'sen_mt_rosaneide',
    name: 'Rosa Neide Sandes de Almeida',
    socialName: 'Professora Rosa Neide',
    party: 'PT',
    numeroUrna: '130',
    state: 'MT',
    municipality: 'Cuiabá',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal por MT: Ex-secretária de Educação, defesa das escolas do campo, combate aos agrotóxicos perigosos e agricultura ecológica.',
    proposals: [
      { pillar: 'p11', title: 'Educação Rural e Tecnológica Pública', description: 'Conectividade e internet em todas as escolas indígenas e rurais de Mato Grosso.' },
      { pillar: 'p3', title: 'Proteção do Pantanal e Transição Agroecológica', description: 'Combate rigoroso a incêndios criminosos no Pantanal e incentivo à pecuária regenerativa.' },
    ],
  },
  // Mato Grosso do Sul (MS)
  {
    tseId: 'sen_ms_zeca',
    name: 'José Orcírio Miranda dos Santos',
    socialName: 'Zeca do PT',
    party: 'PT',
    numeroUrna: '130',
    state: 'MS',
    municipality: 'Campo Grande',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal por MS: Ex-governador, defesa do Pantanal, agricultura familiar e respeito mútuo entre produtores e povos Guarani-Kaiowá.',
    proposals: [
      { pillar: 'p7', title: 'Pacificação no Campo e Terras Tradicionais Kaiowá', description: 'Indenização justa de terras e pacificação com dignidade humana aos povos originários.' },
      { pillar: 'p3', title: 'Sustentabilidade Hídrica da Bacia do Paraguai e Pantanal', description: 'Legislação de proteção rigorosa para a planície pantaneira contra degradação.' },
    ],
  },
  // Espírito Santo (ES)
  {
    tseId: 'sen_es_camila',
    name: 'Camila Valadão',
    socialName: 'Camila Valadão',
    party: 'PSOL',
    numeroUrna: '500',
    state: 'ES',
    municipality: 'Vitória',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal pelo ES: Assistente social e professora, defesa dos direitos humanos, juventude negra e combate à violência de gênero.',
    proposals: [
      { pillar: 'p7', title: 'Defesa da Juventude Negra e Periférica', description: 'Plano nacional de prevenção à violência contra a juventude e oportunidades formativas.' },
      { pillar: 'p12', title: 'Políticas Públicas para a Cidadania Feminina', description: 'Centros de acolhimento e suporte integral a mulheres em situação de vulnerabilidade.' },
    ],
  },
  // Maranhão (MA)
  {
    tseId: 'sen_ma_rubens',
    name: 'Rubens Pereira Júnior',
    socialName: 'Rubens Pereira Jr.',
    party: 'PT',
    numeroUrna: '131',
    state: 'MA',
    municipality: 'São Luís',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal pelo MA: Constitucionalista, defesa da reforma política democrática, combate à pobreza extrema e valorização dos municípios maranhenses.',
    proposals: [
      { pillar: 'p10', title: 'Reforma Política Democrática e Fortalecimento Republicano', description: 'Fim de privilégios, fidelidade partidária programática e combate ao poder econômico nas eleições.' },
      { pillar: 'p6', title: 'Saneamento Básico e Superação da Pobreza no Maranhão', description: 'Expansão de água encanada e esgotamento sanitário nas comunidades do interior do Maranhão.' },
    ],
  },
  // Sergipe (SE)
  {
    tseId: 'sen_se_marcio',
    name: 'Márcio Costa Macêdo',
    socialName: 'Márcio Macêdo',
    party: 'PT',
    numeroUrna: '130',
    state: 'SE',
    municipality: 'Aracaju',
    photoUrl: '',
    governmentPlanSummary: 'Mandato no Senado Federal por SE: Biólogo, defesa da participação social popular direta, meio ambiente e desenvolvimento inclusivo em Sergipe.',
    proposals: [
      { pillar: 'p10', title: 'Participação Social e Conselhos Deliberativos', description: 'Fortalecimento das conferências nacionais e orçamento participativo nas políticas de Estado.' },
      { pillar: 'p3', title: 'Revitalização da Bacia do Rio São Francisco', description: 'Despoluição, reflorestamento de margens e abastecimento hídrico perene para as famílias sergipanas.' },
    ],
  },
];

const REAL_STATE_DEPUTIES = [
  // Região Norte
  { tseId: 'ale_ac_edvaldo', name: 'Edvaldo de Magalhães Paula', socialName: 'Edvaldo Magalhães', party: 'PCDOB', state: 'AC', municipality: 'Rio Branco', photoUrl: '/candidates/ale_ac_edvaldo.jpg' },
  { tseId: 'ale_ac_michelle', name: 'Michelle Melo', socialName: 'Dra. Michelle Melo', party: 'PDT', state: 'AC', municipality: 'Rio Branco', photoUrl: '/candidates/ale_ac_michelle.jpg' },
  { tseId: 'ale_ap_paulo', name: 'Paulo Lemos', socialName: 'Paulo Lemos', party: 'PSOL', state: 'AP', municipality: 'Macapá', photoUrl: '/candidates/ale_ap_paulo.jpg' },
  { tseId: 'ale_ap_edna', name: 'Edna Auzier', socialName: 'Edna Auzier', party: 'PSD', state: 'AP', municipality: 'Macapá', photoUrl: '' },
  { tseId: 'ale_am_sinesio', name: 'Sinésio da Silva Campos', socialName: 'Sinésio Campos', party: 'PT', state: 'AM', municipality: 'Manaus', photoUrl: '/candidates/ale_am_sinesio.jpg' },
  { tseId: 'ale_am_serafim', name: 'Serafim Fernandes Corrêa', socialName: 'Serafim Corrêa', party: 'PSB', state: 'AM', municipality: 'Manaus', photoUrl: '/candidates/ale_am_serafim.jpg' },
  { tseId: 'ale_pa_dirceu', name: 'Dirceu Ten Caten', socialName: 'Dirceu Ten Caten', party: 'PT', state: 'PA', municipality: 'Belém', photoUrl: '/candidates/ale_pa_dirceu.jpg' },
  { tseId: 'ale_pa_bordalo', name: 'Carlos Bordalo', socialName: 'Bordalo', party: 'PT', state: 'PA', municipality: 'Belém', photoUrl: '/candidates/ale_pa_bordalo.jpg' },
  { tseId: 'ale_ro_fatima', name: 'Fátima Cleide Rodrigues da Silva', socialName: 'Fátima Cleide', party: 'PT', state: 'RO', municipality: 'Porto Velho', photoUrl: '/candidates/ale_ro_fatima.jpg' },
  { tseId: 'ale_ro_herminio', name: 'Hermínio Coelho', socialName: 'Hermínio Coelho', party: 'PT', state: 'RO', municipality: 'Porto Velho', photoUrl: '/candidates/ale_ro_herminio.jpg' },
  { tseId: 'ale_rr_evangelista', name: 'Evangelista Siqueira', socialName: 'Evangelista Siqueira', party: 'PT', state: 'RR', municipality: 'Boa Vista', photoUrl: '/candidates/ale_rr_evangelista.jpg' },
  { tseId: 'ale_to_claudia', name: 'Claudia Lelis', socialName: 'Claudia Lelis', party: 'PV', state: 'TO', municipality: 'Palmas', photoUrl: '/candidates/ale_to_claudia.jpg' },
  { tseId: 'ale_to_juniorgeo', name: 'José Roberto Ribeiro Forzani', socialName: 'Professor Júnior Geo', party: 'PSB', state: 'TO', municipality: 'Palmas', photoUrl: '/candidates/ale_to_juniorgeo.jpg' },

  // Região Nordeste
  { tseId: 'ale_al_ronaldo', name: 'Ronaldo Medeiros', socialName: 'Ronaldo Medeiros', party: 'PT', state: 'AL', municipality: 'Maceió', photoUrl: '/candidates/ale_al_ronaldo.jpg' },
  { tseId: 'ale_al_inacio', name: 'Inácio Loiola', socialName: 'Inácio Loiola', party: 'MDB', state: 'AL', municipality: 'Maceió', photoUrl: '/candidates/ale_al_inacio.jpg' },
  { tseId: 'ale_ba_lidice', name: 'Lídice da Mata e Souza', socialName: 'Lídice da Mata', party: 'PSB', state: 'BA', municipality: 'Salvador', photoUrl: '/candidates/280001600012.jpg' },
  { tseId: 'ale_ba_olivia', name: 'Olívia Santana', socialName: 'Olívia Santana', party: 'PCDOB', state: 'BA', municipality: 'Salvador', photoUrl: '/candidates/ale_ba_olivia.jpg' },
  { tseId: 'ale_ba_hilton', name: 'Hilton Coelho', socialName: 'Hilton Coelho', party: 'PSOL', state: 'BA', municipality: 'Salvador', photoUrl: '/candidates/ale_ba_hilton.jpg' },
  { tseId: 'ale_ce_renatoroseno', name: 'Renato Roseno de Oliveira', socialName: 'Renato Roseno', party: 'PSOL', state: 'CE', municipality: 'Fortaleza', photoUrl: '/candidates/ale_ce_renatoroseno.jpg' },
  { tseId: 'ale_ce_larissa', name: 'Larissa Gaspar', socialName: 'Larissa Gaspar', party: 'PT', state: 'CE', municipality: 'Fortaleza', photoUrl: '/candidates/ale_ce_larissa.jpg' },
  { tseId: 'ale_ma_rodrigolago', name: 'Rodrigo Lago', socialName: 'Rodrigo Lago', party: 'PCDOB', state: 'MA', municipality: 'São Luís', photoUrl: '/candidates/ale_ma_rodrigolago.jpg' },
  { tseId: 'ale_ma_carloslula', name: 'Carlos Lula', socialName: 'Carlos Lula', party: 'PSB', state: 'MA', municipality: 'São Luís', photoUrl: '/candidates/ale_ma_carloslula.jpg' },
  { tseId: 'ale_pb_cida', name: 'Cida Ramos', socialName: 'Cida Ramos', party: 'PT', state: 'PB', municipality: 'João Pessoa', photoUrl: '/candidates/ale_pb_cida.jpg' },
  { tseId: 'ale_pb_chio', name: 'Chió', socialName: 'Chió', party: 'REDE', state: 'PB', municipality: 'João Pessoa', photoUrl: '/candidates/ale_pb_chio.jpg' },
  { tseId: 'ale_pe_daniportela', name: 'Dani Portela', socialName: 'Dani Portela', party: 'PSOL', state: 'PE', municipality: 'Recife', photoUrl: '/candidates/ale_pe_daniportela.jpg' },
  { tseId: 'ale_pe_doriel', name: 'Doriel Barros', socialName: 'Doriel Barros', party: 'PT', state: 'PE', municipality: 'Recife', photoUrl: '' },
  { tseId: 'ale_pe_rosaamorim', name: 'Rosa Amorim', socialName: 'Rosa Amorim (MST)', party: 'PT', state: 'PE', municipality: 'Caruaru', photoUrl: '/candidates/ale_pe_rosaamorim.jpg' },
  { tseId: 'ale_pi_limma', name: 'Francisco Limma', socialName: 'Francisco Limma', party: 'PT', state: 'PI', municipality: 'Teresina', photoUrl: '' },
  { tseId: 'ale_pi_fabionovo', name: 'Fábio Novo', socialName: 'Fábio Novo', party: 'PT', state: 'PI', municipality: 'Teresina', photoUrl: '/candidates/ale_pi_fabionovo.jpg' },
  { tseId: 'ale_rn_isolda', name: 'Isolda Dantas', socialName: 'Isolda Dantas', party: 'PT', state: 'RN', municipality: 'Mossoró', photoUrl: '/candidates/ale_rn_isolda.jpg' },
  { tseId: 'ale_rn_divaneide', name: 'Divaneide Basílio', socialName: 'Divaneide Basílio', party: 'PT', state: 'RN', municipality: 'Natal', photoUrl: '' },
  { tseId: 'ale_se_lindabrasil', name: 'Linda Brasil', socialName: 'Linda Brasil', party: 'PSOL', state: 'SE', municipality: 'Aracaju', photoUrl: '/candidates/ale_se_lindabrasil.jpg' },

  // Região Centro-Oeste
  { tseId: 'ale_df_fabiofelix', name: 'Fábio Felix', socialName: 'Fábio Felix', party: 'PSOL', state: 'DF', municipality: 'Brasília', photoUrl: '/candidates/ale_df_fabiofelix.jpg' },
  { tseId: 'ale_df_chicovigilante', name: 'Chico Vigilante', socialName: 'Chico Vigilante', party: 'PT', state: 'DF', municipality: 'Brasília', photoUrl: '/candidates/ale_df_chicovigilante.jpg' },
  { tseId: 'ale_df_gabrielmagno', name: 'Gabriel Magno', socialName: 'Gabriel Magno', party: 'PT', state: 'DF', municipality: 'Brasília', photoUrl: '/candidates/ale_df_gabrielmagno.jpg' },
  { tseId: 'ale_go_maurorubem', name: 'Mauro Rubem', socialName: 'Mauro Rubem', party: 'PT', state: 'GO', municipality: 'Goiânia', photoUrl: '/candidates/ale_go_maurorubem.jpg' },
  { tseId: 'ale_go_biadelima', name: 'Bia de Lima', socialName: 'Bia de Lima', party: 'PT', state: 'GO', municipality: 'Goiânia', photoUrl: '/candidates/ale_go_biadelima.jpg' },
  { tseId: 'ale_mt_barranco', name: 'Valdir Barranco', socialName: 'Valdir Barranco', party: 'PT', state: 'MT', municipality: 'Cuiabá', photoUrl: '/candidates/ale_mt_barranco.jpg' },
  { tseId: 'ale_mt_ludio', name: 'Lúdio Cabral', socialName: 'Lúdio Cabral', party: 'PT', state: 'MT', municipality: 'Cuiabá', photoUrl: '/candidates/ale_mt_ludio.jpg' },
  { tseId: 'ale_ms_zecadopt', name: 'José Orcírio Miranda dos Santos', socialName: 'Zeca do PT', party: 'PT', state: 'MS', municipality: 'Campo Grande', photoUrl: '/candidates/ale_ms_zecadopt.jpg' },
  { tseId: 'ale_ms_pedrokemp', name: 'Pedro Kemp', socialName: 'Pedro Kemp', party: 'PT', state: 'MS', municipality: 'Campo Grande', photoUrl: '/candidates/ale_ms_pedrokemp.jpg' },

  // Região Sudeste
  { tseId: 'ale_es_camila', name: 'Camila Valadão', socialName: 'Camila Valadão', party: 'PSOL', state: 'ES', municipality: 'Vitória', photoUrl: '/candidates/ale_es_camila.jpg' },
  { tseId: 'ale_es_iriny', name: 'Iriny Lopes', socialName: 'Iriny Lopes', party: 'PT', state: 'ES', municipality: 'Vitória', photoUrl: '/candidates/ale_es_iriny.jpg' },
  { tseId: 'ale_mg_bellagoncalves', name: 'Isabella Gonçalves Miranda', socialName: 'Bella Gonçalves', party: 'PSOL', state: 'MG', municipality: 'Belo Horizonte', photoUrl: '/candidates/ale_mg_bellagoncalves.jpg' },
  { tseId: 'ale_mg_beatrizcerqueira', name: 'Beatriz Cerqueira', socialName: 'Beatriz Cerqueira', party: 'PT', state: 'MG', municipality: 'Belo Horizonte', photoUrl: '/candidates/ale_mg_beatrizcerqueira.jpg' },
  { tseId: 'ale_mg_andreia', name: 'Andréia de Jesus', socialName: 'Andréia de Jesus', party: 'PT', state: 'MG', municipality: 'Belo Horizonte', photoUrl: '/candidates/ale_mg_andreia.jpg' },
  { tseId: 'ale_rj_renatasouza', name: 'Renata da Silva Souza', socialName: 'Renata Souza', party: 'PSOL', state: 'RJ', municipality: 'Rio de Janeiro', photoUrl: '/candidates/280001600026.jpg' },
  { tseId: 'ale_rj_carlosminc', name: 'Carlos Minc Baumfeld', socialName: 'Carlos Minc', party: 'PSB', state: 'RJ', municipality: 'Rio de Janeiro', photoUrl: '/candidates/280001600027.jpg' },
  { tseId: 'ale_rj_danimonteiro', name: 'Danielle Monteiro da Silva', socialName: 'Dani Monteiro', party: 'PSOL', state: 'RJ', municipality: 'Rio de Janeiro', photoUrl: '/candidates/ale_rj_danimonteiro.jpg' },
  { tseId: 'ale_rj_flavioserafini', name: 'Flávio Serafini', socialName: 'Flávio Serafini', party: 'PSOL', state: 'RJ', municipality: 'Niterói', photoUrl: '/candidates/ale_rj_flavioserafini.jpg' },
  { tseId: 'ale_sp_suplicy', name: 'Eduardo Matarazzo Suplicy', socialName: 'Eduardo Suplicy', party: 'PT', state: 'SP', municipality: 'São Paulo', photoUrl: '/candidates/280001600018.jpg' },
  { tseId: 'ale_sp_helou', name: 'Marina Helou', socialName: 'Marina Helou', party: 'REDE', state: 'SP', municipality: 'São Paulo', photoUrl: '/candidates/280001600017.jpg' },
  { tseId: 'ale_sp_monicaseixas', name: 'Mônica Seixas', socialName: 'Mônica Seixas (Bancada Feminista)', party: 'PSOL', state: 'SP', municipality: 'São Paulo', photoUrl: '/candidates/ale_sp_monicaseixas.jpg' },
  { tseId: 'ale_sp_paulofiorilo', name: 'Paulo Fiorilo', socialName: 'Paulo Fiorilo', party: 'PT', state: 'SP', municipality: 'São Paulo', photoUrl: '/candidates/ale_sp_paulofiorilo.jpg' },

  // Região Sul
  { tseId: 'ale_pr_renatofreitas', name: 'Renato Freitas', socialName: 'Renato Freitas', party: 'PT', state: 'PR', municipality: 'Curitiba', photoUrl: '/candidates/ale_pr_renatofreitas.jpg' },
  { tseId: 'ale_pr_anajulia', name: 'Ana Júlia Ribeiro', socialName: 'Ana Júlia', party: 'PT', state: 'PR', municipality: 'Curitiba', photoUrl: '/candidates/ale_pr_anajulia.jpg' },
  { tseId: 'ale_rs_lucianagenro', name: 'Luciana Krebs Genro', socialName: 'Luciana Genro', party: 'PSOL', state: 'RS', municipality: 'Porto Alegre', photoUrl: '/candidates/ale_rs_lucianagenro.jpg' },
  { tseId: 'ale_rs_matheusgomes', name: 'Matheus Gomes', socialName: 'Matheus Gomes', party: 'PSOL', state: 'RS', municipality: 'Porto Alegre', photoUrl: '/candidates/ale_rs_matheusgomes.jpg' },
  { tseId: 'ale_rs_sofiacavedon', name: 'Sofia Cavedon', socialName: 'Sofia Cavedon', party: 'PT', state: 'RS', municipality: 'Porto Alegre', photoUrl: '/candidates/ale_rs_sofiacavedon.jpg' },
  { tseId: 'ale_sc_carminatti', name: 'Luciane Carminatti', socialName: 'Luciane Carminatti', party: 'PT', state: 'SC', municipality: 'Chapecó', photoUrl: '/candidates/ale_sc_carminatti.jpg' },
  { tseId: 'ale_sc_marquito', name: 'Marcos José de Abreu', socialName: 'Marquito', party: 'PSOL', state: 'SC', municipality: 'Florianópolis', photoUrl: '/candidates/ale_sc_marquito.jpg' },
];

async function main() {
  console.log('🚀 Iniciando Carga de Dados Reais e Atuais da Política Brasileira 2026...');

  const camaraDeputies = await fetchFederalDeputies();
  const senadoSenators = await fetchSenators();

  console.log('🧹 Limpando dados anteriores para sincronização limpa...');
  await prisma.$transaction(async (tx) => {
    await tx.matchResult.deleteMany({});
    await tx.savedCandidate.deleteMany({}).catch(() => {});
    try { await tx.$executeRawUnsafe(`DELETE FROM "integrity_flags" WHERE true`).catch(() => {}); } catch {}
    try { await tx.$executeRawUnsafe(`DELETE FROM "proposals" WHERE true`).catch(() => {}); } catch {}
    await tx.candidate.deleteMany({});
  });

  let totalInseridos = 0;

  // 1. Presidente (Lula)
  await prisma.candidate.create({
    data: {
      tseId: '280001600001',
      electionYear: 2026,
      name: 'Luiz Inácio Lula da Silva',
      socialName: 'Lula',
      viceName: 'Geraldo José Rodrigues Alckmin Filho',
      party: 'PT',
      partyNumber: 13,
      cargo: 'PRESIDENTE' as Cargo,
      level: 'FEDERAL' as ElectionLevel,
      candidaturaStatus: 'DEFERIDO' as CandidaturaStatus,
      municipality: 'São Paulo',
      state: 'SP',
      cpfHash: 'hash_tse_lula_2026',
      fichaLimpa: true,
      photoUrl: '/candidates/280001600001.jpg',
      governmentPlanUrl: 'https://divulgacandcontas.tse.jus.br/',
      governmentPlanSummary: 'Diretrizes do Plano de Governo: Reconstrução social, reindustrialização verde, fortalecimento do SUS, Pé-de-Meia e transição ecológica justa.',
      profileScores: { p1: 0.96, p2: 0.95, p3: 0.90, p4: 0.85, p5: 0.85, p6: 0.98, p7: 0.95, p8: 0.88, p9: 0.96, p10: 0.88, p11: 0.96, p12: 0.98, p13: 0.92 },
      proposals: [
        { pillar: 'p6', title: 'Erradicação da Fome e Redução das Desigualdades', description: 'Garantia de segurança alimentar e combate à pobreza extrema.' },
        { pillar: 'p11', title: 'Educação em Tempo Integral e Poupança Estudantil', description: 'Expansão nacional do programa Pé-de-Meia para erradicar a evasão escolar.' },
        { pillar: 'p3', title: 'Transição Energética Justa e Preservação Florestal', description: 'Meta de desmatamento zero e bioeconomia sustentável.' },
      ],
    },
  });
  totalInseridos++;

  // 2. Governadores
  for (const g of REAL_GOVERNORS) {
    const scores = generateScores(g.party, 'GOVERNADOR');
    await prisma.candidate.create({
      data: {
        tseId: g.tseId,
        electionYear: 2026,
        name: g.name,
        socialName: g.socialName,
        viceName: (g as any).viceName || null,
        party: g.party,
        partyNumber: getPartyNumber(g.party),
        numeroUrna: (g as any).numeroUrna || String(getPartyNumber(g.party)),
        cargo: 'GOVERNADOR' as Cargo,
        level: 'ESTADUAL' as ElectionLevel,
        candidaturaStatus: ((g as any).status || 'DEFERIDO') as CandidaturaStatus,
        municipality: g.municipality,
        state: g.state,
        cpfHash: `hash_tse_${g.tseId}_2026`,
        fichaLimpa: true,
        photoUrl: g.photoUrl,
        governmentPlanUrl: 'https://divulgacandcontas.tse.jus.br/',
        governmentPlanSummary: `Diretrizes de Governo Estadual para o ${g.state}: Foco em desenvolvimento regional, educação pública de qualidade, segurança cidadã e fortalecimento da saúde básica.`,
        profileScores: scores,
        proposals: [
          { pillar: 'p11', title: 'Educação em Tempo Integral, Infraestrutura e Climatização Escolar', description: 'Reforma e modernização de 100% das escolas estaduais com ar-condicionado e conectividade.' },
          { pillar: 'p9', title: 'Regionalização da Saúde e Rede de Policlínicas Integradas', description: 'Construção e ampliação de policlínicas e hospitais regionais para zerar as filas do SISREG.' },
          { pillar: 'p10', title: 'Segurança Cidadã, Inteligência Policial e Asfixia das Milícias', description: 'Modernização das polícias, perícia técnica científica e inteligência financeira contra o crime organizado.' },
          { pillar: 'p5', title: 'Integração Metropolitana dos Transportes e Reindustrialização', description: 'Modernização da SuperVia, barcas e metrô com tarifa integrada e polos industriais no interior.' },
          { pillar: 'p3', title: 'Saneamento Básico Universal e Despoluição da Baía de Guanabara', description: 'Universalização da água tratada e esgoto na Baixada e despoluição sustentável dos recursos hídricos.' },
          { pillar: 'p1', title: 'Urbanização de Comunidades, Habitação Popular e Restaurantes Populares', description: 'Regularização fundiária de moradias, infraestrutura comunitária e expansão de restaurantes populares.' },
          { pillar: 'p6', title: 'Emprego Jovem, Microcrédito Produtivo e Inovação Tecnológica', description: 'Programa Primeiro Passo para inserção juvenil no mercado e microcrédito orientado a pequenos negócios.' },
        ],
      },
    });
    totalInseridos++;
  }

  // 3. Senadores (Candidatos Oficiais 2026 e Senadores Progressistas)
  const insertedSenIds = new Set<string>();

  for (const s of REAL_SENATORS) {
    const scores = generateScores(s.party, 'SENADOR');
    const numeroUrna = (s as any).numeroUrna || `${getPartyNumber(s.party)}0`;

    await prisma.candidate.create({
      data: {
        tseId: s.tseId,
        electionYear: 2026,
        name: s.name,
        socialName: s.socialName,
        party: s.party,
        partyNumber: getPartyNumber(s.party),
        numeroUrna,
        cargo: 'SENADOR' as Cargo,
        level: 'ESTADUAL' as ElectionLevel,
        candidaturaStatus: 'DEFERIDO' as CandidaturaStatus,
        municipality: s.municipality || 'Brasília',
        state: s.state,
        cpfHash: `hash_tse_${s.tseId}_2026`,
        fichaLimpa: true,
        photoUrl: s.photoUrl || '',
        governmentPlanUrl: 'https://divulgacandcontas.tse.jus.br/',
        governmentPlanSummary: s.governmentPlanSummary || `Mandato no Senado Federal pelo estado de ${s.state}: Defesa do pacto federativo, desenvolvimento sustentável e direitos constitucionais.`,
        profileScores: scores,
        proposals: s.proposals || [
          { pillar: 'p10', title: 'Defesa da Democracia e do Pacto Federativo', description: 'Distribuição justa de recursos aos estados e municípios e fortalecimento institucional.' },
          { pillar: 'p5', title: 'Desenvolvimento Regional Sustentável', description: 'Incentivos a cadeias produtivas locais e transição energética.' },
        ],
      },
    });
    insertedSenIds.add(s.tseId);
    totalInseridos++;
  }

  for (const s of senadoSenators) {
    const p = s.IdentificacaoParlamentar;
    const nomeCompleto = p.NomeCompletoParlamentar || p.NomeParlamentar;
    const socialName = p.NomeParlamentar || nomeCompleto;
    const party = p.SiglaPartidoParlamentar || 'PSD';
    const state = p.UfParlamentar || 'DF';
    const tseId = `sen_${p.CodigoParlamentar}`;
    if (insertedSenIds.has(tseId)) continue;

    const photoUrl = p.UrlFotoParlamentar?.replace('http://', 'https://') || '';
    const scores = generateScores(party, 'SENADOR');
    const numeroUrna = `${getPartyNumber(party)}0`;

    await prisma.candidate.create({
      data: {
        tseId,
        electionYear: 2026,
        name: nomeCompleto,
        socialName,
        party,
        partyNumber: getPartyNumber(party),
        numeroUrna,
        cargo: 'SENADOR' as Cargo,
        level: 'ESTADUAL' as ElectionLevel,
        candidaturaStatus: 'DEFERIDO' as CandidaturaStatus,
        municipality: 'Brasília',
        state,
        cpfHash: `hash_tse_${tseId}_2026`,
        fichaLimpa: true,
        photoUrl,
        governmentPlanUrl: p.UrlPaginaParlamentar || 'https://www.senado.leg.br',
        governmentPlanSummary: `Atuação no Senado Federal: Representação do estado de ${state} na defesa do pacto federativo, desenvolvimento sustentável e direitos constitucionais.`,
        profileScores: scores,
        proposals: [
          { pillar: 'p10', title: 'Defesa da Democracia e do Pacto Federativo', description: 'Distribuição justa de recursos aos estados e municípios e fortalecimento institucional.' },
          { pillar: 'p5', title: 'Desenvolvimento Regional Sustentável', description: 'Incentivos a cadeias produtivas locais e transição energética.' },
        ],
      },
    });
    insertedSenIds.add(tseId);
    totalInseridos++;
  }

  // Candidatos que disputam o Senado Federal em 2026 (evita duplicidade eleitoral com a Câmara)
  const DEPUTIES_RUNNING_FOR_SENATE = new Set([
    73701, // Benedita da Silva (Disputa o Senado pelo RJ)
    74858, // Lindbergh Farias (Disputa o Senado pelo RJ)
    220598, // Tarcísio Motta (Disputa o Senado pelo RJ)
  ]);

  // 4. Deputados Federais
  for (const d of camaraDeputies) {
    if (DEPUTIES_RUNNING_FOR_SENATE.has(d.id)) {
      continue;
    }
    const tseId = `dep_${d.id}`;
    const party = d.siglaPartido || 'PT';
    const state = d.siglaUf || 'SP';
    const scores = generateScores(party, 'DEPUTADO_FEDERAL');
    const photoUrl = d.urlFoto || '';

    await prisma.candidate.create({
      data: {
        tseId,
        electionYear: 2026,
        name: d.nome,
        socialName: d.nome,
        party,
        partyNumber: getPartyNumber(party),
        cargo: 'DEPUTADO_FEDERAL' as Cargo,
        level: 'FEDERAL' as ElectionLevel,
        candidaturaStatus: 'DEFERIDO' as CandidaturaStatus,
        municipality: 'Brasília',
        state,
        cpfHash: `hash_tse_${tseId}_2026`,
        fichaLimpa: true,
        photoUrl,
        governmentPlanUrl: d.uri || 'https://www.camara.leg.br',
        governmentPlanSummary: `Mandato Parlamentar Federal na Câmara dos Deputados: Atuação na bancada de ${state} na formulação de leis sociais, econômicas e de defesa da cidadania.`,
        profileScores: scores,
        proposals: [
          { pillar: 'p2', title: 'Direitos Trabalhistas e Cidadania', description: 'Defesa do salário digno, valorização do trabalhador e proteção social.' },
          { pillar: 'p1', title: 'Investimentos em Educação e Ciência', description: 'Garantia de recursos constitucionais para universidades públicas e ensino técnico.' },
        ],
      },
    });
    totalInseridos++;
  }

  const insertedDepStates = new Set(camaraDeputies.map((d) => d.siglaUf?.toUpperCase()));
  const FALLBACK_FEDERAL_DEPUTIES = [
    { tseId: 'dep_ro_fatima', name: 'Fátima Cleide Rodrigues da Silva', socialName: 'Fátima Cleide', party: 'PT', state: 'RO', municipality: 'Porto Velho' },
    { tseId: 'dep_ro_cujui', name: 'Ramon Cujuí', socialName: 'Ramon Cujuí', party: 'PT', state: 'RO', municipality: 'Porto Velho' },
    { tseId: 'dep_rr_tito', name: 'Tito Barichello', socialName: 'Delegado Tito Barichello', party: 'PT', state: 'RR', municipality: 'Boa Vista' },
    { tseId: 'dep_to_celio', name: 'Célio Alves de Moura', socialName: 'Célio Moura', party: 'PT', state: 'TO', municipality: 'Palmas' },
  ];

  for (const fd of FALLBACK_FEDERAL_DEPUTIES) {
    if (!insertedDepStates.has(fd.state)) {
      const scores = generateScores(fd.party, 'DEPUTADO_FEDERAL');
      await prisma.candidate.create({
        data: {
          tseId: fd.tseId,
          electionYear: 2026,
          name: fd.name,
          socialName: fd.socialName,
          party: fd.party,
          partyNumber: getPartyNumber(fd.party),
          cargo: 'DEPUTADO_FEDERAL' as Cargo,
          level: 'FEDERAL' as ElectionLevel,
          candidaturaStatus: 'DEFERIDO' as CandidaturaStatus,
          municipality: fd.municipality || 'Brasília',
          state: fd.state,
          cpfHash: `hash_tse_${fd.tseId}_2026`,
          fichaLimpa: true,
          photoUrl: '',
          governmentPlanUrl: 'https://www.camara.leg.br',
          governmentPlanSummary: `Mandato Parlamentar Federal na Câmara dos Deputados: Atuação na bancada de ${fd.state} em defesa dos direitos sociais.`,
          profileScores: scores,
          proposals: [
            { pillar: 'p2', title: 'Defesa dos Direitos Sociais e Cidadania', description: 'Proteção ao trabalhador e seguridade social.' },
            { pillar: 'p1', title: 'Investimentos em Saúde e Educação Pública', description: 'Garantia de recursos para infraestrutura e serviços essenciais.' },
          ],
        },
      });
      totalInseridos++;
    }
  }

  // 5. Deputados Estaduais
  for (const ed of REAL_STATE_DEPUTIES) {
    const scores = generateScores(ed.party, 'DEPUTADO_ESTADUAL');
    await prisma.candidate.create({
      data: {
        tseId: ed.tseId,
        electionYear: 2026,
        name: ed.name,
        socialName: ed.socialName,
        party: ed.party,
        partyNumber: getPartyNumber(ed.party),
        cargo: 'DEPUTADO_ESTADUAL' as Cargo,
        level: 'ESTADUAL' as ElectionLevel,
        candidaturaStatus: 'DEFERIDO' as CandidaturaStatus,
        municipality: ed.municipality,
        state: ed.state,
        cpfHash: `hash_tse_${ed.tseId}_2026`,
        fichaLimpa: true,
        photoUrl: ed.photoUrl,
        governmentPlanUrl: 'https://divulgacandcontas.tse.jus.br/',
        governmentPlanSummary: `Mandato Estadual na Assembleia Legislativa de ${ed.state}: Legislação e fiscalização dos serviços públicos de saúde, transporte, educação e direitos humanos.`,
        profileScores: scores,
        proposals: [
          { pillar: 'p7', title: 'Políticas Públicas para a Cidadania e Comunidades', description: 'Apoio a projetos locais, cultura popular e direitos humanos.' },
          { pillar: 'p3', title: 'Sustentabilidade Urbana e Proteção Ambiental', description: 'Fiscalização ambiental rigorosa e saneamento básico nas periferias.' },
        ],
      },
    });
    totalInseridos++;
  }

  // 6. Rede de Anúncios Éticos (Ethical Ad Network)
  console.log('\n📣 Populando Rede de Anúncios Éticos...');
  // Limpar anúncios e anunciantes anteriores para idempotent seed
  await (prisma as any).ad.deleteMany({});
  await (prisma as any).advertiser.deleteMany({});

  const adv1 = await (prisma as any).advertiser.create({
    data: {
      name: 'Cooperativa Solar',
      cnpj: '12.345.678/0001-90',
      category: 'COOPERATIVA',
      pillarAlignment: ['p3'],
      isActive: true,
      isApproved: true,
      startDate: new Date('2026-01-01'),
      contractValue: 12000,
      ads: {
        create: [
          {
            format: 'CARD_APOIO',
            title: 'Cooperativa de Energia Solar Popular',
            description: 'Energia limpa, renovável e solidária para comunidades e periferias.',
            targetUrl: 'https://cooperativasolar.exemplo.org',
            screen: 'matching',
            pillar: 'p3',
            isActive: true,
          },
          {
            format: 'BANNER',
            title: 'Transição Energética Cidadã',
            description: 'Conheça modelos cooperativos de energia solar sustentável.',
            targetUrl: 'https://cooperativasolar.exemplo.org',
            screen: 'search',
            isActive: true,
          },
        ],
      },
    },
  });

  const adv2 = await (prisma as any).advertiser.create({
    data: {
      name: 'Editora Progressista',
      cnpj: '23.456.789/0001-01',
      category: 'EMPRESA_SUSTENTAVEL',
      pillarAlignment: ['p11'],
      isActive: true,
      isApproved: true,
      startDate: new Date('2026-01-01'),
      contractValue: 8500,
      ads: {
        create: [
          {
            format: 'PILAR_SPONSOR',
            title: 'Livros Emancipatórios e Educação Crítica',
            description: 'Leituras fundamentais sobre história do Brasil, direitos sociais e cidadania.',
            targetUrl: 'https://editoraprogressista.exemplo.org',
            screen: 'matching_result',
            pillar: 'p11',
            isActive: true,
          },
        ],
      },
    },
  });

  const adv3 = await (prisma as any).advertiser.create({
    data: {
      name: 'Instituto Cidadania',
      cnpj: '34.567.890/0001-12',
      category: 'INSTITUTO',
      pillarAlignment: ['p2'],
      isActive: true,
      isApproved: true,
      startDate: new Date('2026-01-01'),
      contractValue: 15000,
      ads: {
        create: [
          {
            format: 'CARD_APOIO',
            title: 'Observatório da Igualdade e Justiça Social',
            description: 'Monitoramento independente de direitos fundamentais e cidadania no Brasil.',
            targetUrl: 'https://institutocidadania.exemplo.org',
            screen: 'matching',
            pillar: 'p2',
            isActive: true,
          },
          {
            format: 'COLA_FOOTER',
            title: 'Apoio Cívico: Instituto Cidadania',
            description: 'Pelo voto consciente, transparente e em defesa da democracia.',
            targetUrl: 'https://institutocidadania.exemplo.org',
            screen: 'cola',
            isActive: true,
          },
        ],
      },
    },
  });

  console.log(`✅ Anunciantes éticos inseridos: Cooperativa Solar (${adv1.id}), Editora Progressista (${adv2.id}), Instituto Cidadania (${adv3.id})`);

  // ─────────────────────────────────────────────────────────
  // SEED: Observatório de Mandatos (Votações, Votos & Promessas)
  // ─────────────────────────────────────────────────────────
  console.log('\n🏛️ Semeando Observatório de Mandatos...');

  // 1. Marca 3 candidatos como ELEITO para monitoramento pós-eleitoral
  const sampleCandidates = await prisma.candidate.findMany({ take: 3 });
  if (sampleCandidates.length > 0) {
    for (const c of sampleCandidates) {
      await prisma.candidate.update({
        where: { id: c.id },
        data: { electionResult: 'ELEITO' },
      });
    }

    const [c1, c2, c3] = sampleCandidates;

    // 2. Cria 6 LegislativeVotes oficiais
    const v1 = await prisma.legislativeVote.upsert({
      where: { externalId: 'camara-pl-2564' },
      update: {},
      create: {
        house: 'CAMARA',
        externalId: 'camara-pl-2564',
        date: new Date('2024-05-04T18:30:00.000Z'),
        description: 'Piso Salarial Nacional da Enfermagem e Saúde (PL 2564/2020)',
        summaryUrl: 'https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2264906',
        pillarMapping: ['p1', 'p9'],
        mappedBy: 'ADMIN',
      },
    });

    const v2 = await prisma.legislativeVote.upsert({
      where: { externalId: 'camara-lei-14611' },
      update: {},
      create: {
        house: 'CAMARA',
        externalId: 'camara-lei-14611',
        date: new Date('2023-06-01T15:00:00.000Z'),
        description: 'Lei de Igualdade Salarial entre Mulheres e Homens (Lei 14.611/2023)',
        summaryUrl: 'https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2353457',
        pillarMapping: ['p2', 'p12'],
        mappedBy: 'ADMIN',
      },
    });

    const v3 = await prisma.legislativeVote.upsert({
      where: { externalId: 'camara-pl-2308' },
      update: {},
      create: {
        house: 'CAMARA',
        externalId: 'camara-pl-2308',
        date: new Date('2024-06-25T20:00:00.000Z'),
        description: 'Marco Legal do Hidrogênio de Baixa Emissão de Carbono (Lei 14.948/2024)',
        summaryUrl: 'https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2374020',
        pillarMapping: ['p3', 'p5'],
        mappedBy: 'ADMIN',
      },
    });

    const v4 = await prisma.legislativeVote.upsert({
      where: { externalId: 'camara-ec-132' },
      update: {},
      create: {
        house: 'CAMARA',
        externalId: 'camara-ec-132',
        date: new Date('2023-12-15T22:30:00.000Z'),
        description: 'Reforma Tributária sobre o Consumo com Cashback Popular (EC 132/2023)',
        summaryUrl: 'https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2362459',
        pillarMapping: ['p6', 'p13'],
        mappedBy: 'ADMIN',
      },
    });

    const v5 = await prisma.legislativeVote.upsert({
      where: { externalId: 'senado-pl-marco-temp' },
      update: {},
      create: {
        house: 'SENADO',
        externalId: 'senado-pl-marco-temp',
        date: new Date('2023-09-27T17:45:00.000Z'),
        description: 'Rejeição ao Marco Temporal para Terras Indígenas e Preservação Socioambiental',
        summaryUrl: 'https://www25.senado.leg.br/web/atividade/materias/-/materia/158957',
        pillarMapping: ['p7', 'p3'],
        mappedBy: 'ADMIN',
      },
    });

    const v6 = await prisma.legislativeVote.upsert({
      where: { externalId: 'camara-orcamento-sec' },
      update: {},
      create: {
        house: 'CAMARA',
        externalId: 'camara-orcamento-sec',
        date: new Date('2024-08-20T19:15:00.000Z'),
        description: 'Extinção e Vedação às Emendas sem Identificação e Publicidade Total (Orçamento Secreto)',
        summaryUrl: 'https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2450123',
        pillarMapping: ['p8'],
        mappedBy: 'ADMIN',
      },
    });

    // 3. Registra votos dos candidatos (incluindo divergências propositais para teste de alertas)
    // C1: Alinhado a todas as pautas progressistas
    for (const v of [v1, v2, v3, v4, v5, v6]) {
      await prisma.candidateVote.upsert({
        where: { candidateId_voteId: { candidateId: c1.id, voteId: v.id } },
        update: { choice: 'SIM' },
        create: { candidateId: c1.id, voteId: v.id, choice: 'SIM' },
      });
    }

    // C2: Vota NÃO na Lei do Hidrogênio / Clima (P3) -> dispara alerta quando o cidadão prioriza P3
    await prisma.candidateVote.upsert({
      where: { candidateId_voteId: { candidateId: c2.id, voteId: v3.id } },
      update: { choice: 'NAO' },
      create: { candidateId: c2.id, voteId: v3.id, choice: 'NAO' },
    });
    await prisma.candidateVote.upsert({
      where: { candidateId_voteId: { candidateId: c2.id, voteId: v1.id } },
      update: { choice: 'SIM' },
      create: { candidateId: c2.id, voteId: v1.id, choice: 'SIM' },
    });

    // C3: Vota NÃO na Igualdade Salarial de Mulheres (P2) -> dispara alerta para P2
    if (c3) {
      await prisma.candidateVote.upsert({
        where: { candidateId_voteId: { candidateId: c3.id, voteId: v2.id } },
        update: { choice: 'NAO' },
        create: { candidateId: c3.id, voteId: v2.id, choice: 'NAO' },
      });
      await prisma.candidateVote.upsert({
        where: { candidateId_voteId: { candidateId: c3.id, voteId: v4.id } },
        update: { choice: 'SIM' },
        create: { candidateId: c3.id, voteId: v4.id, choice: 'SIM' },
      });
    }

    // 4. Cria 4 Pledges com status variados (Promessômetro)
    await prisma.pledge.deleteMany({ where: { candidateId: c1.id } });
    await prisma.pledge.createMany({
      data: [
        {
          candidateId: c1.id,
          text: 'Universalização da rede de água tratada e saneamento básico nas periferias da zona leste',
          pillar: 'p1',
          status: 'EM_ANDAMENTO',
          evidenceUrl: 'https://diariooficial.sp.gov.br/obras-saneamento-2026',
        },
        {
          candidateId: c1.id,
          text: 'Criação de centros integrados de acolhimento para mulheres vítimas de violência',
          pillar: 'p2',
          status: 'CUMPRIDA',
          evidenceUrl: 'https://prefeitura.sp.gov.br/inauguracao-centro-acolhimento',
        },
        {
          candidateId: c1.id,
          text: 'Instalação de usinas fotovoltaicas comunitárias em 100% dos prédios públicos escolares',
          pillar: 'p3',
          status: 'QUEBRADA',
          evidenceUrl: 'https://camara.leg.br/auditoria/recurso-remanejado-escolas',
        },
        {
          candidateId: c1.id,
          text: 'Ampliação da tarifa zero no transporte coletivo municipal para estudantes de baixa renda',
          pillar: 'p6',
          status: 'PROPOSTA',
          evidenceUrl: null,
        },
      ],
    });

    console.log('✅ Observatório de mandatos semeado: 6 Votações, Votos nominais e 4 Promessas.');

    // 5. Cria 4 Produtos no Catálogo B2B (Relatórios B2B)
    const b2bProducts = [
      {
        slug: 'relatorio-prioridades-nacional',
        title: 'Relatório Nacional de Prioridades Cívicas 2026',
        description: 'Análise aprofundada das causas mais demandadas por estado e região com base na telemetria agregada e anônima da Consulta por Prioridades.',
        category: 'PRIORIDADES',
        priceCents: 25000,
        publicSummary: 'Panorama analítico de prioridades do eleitorado progressista, desagregado por UF e temas estruturantes.',
      },
      {
        slug: 'relatorio-comprometimento-partidario',
        title: 'Índice de Comprometimento Progressista por Bancada',
        description: 'Mapeamento estatístico da aderência partidária aos 13 pilares progressistas nas votações e planos de governo das Eleições 2026.',
        category: 'COMPROMETIMENTO',
        priceCents: 35000,
        publicSummary: 'Classificação auditável do alinhamento partidário aos 13 pilares, com memória de cálculo e gap analysis.',
      },
      {
        slug: 'relatorio-promessometro-legislativo',
        title: 'Painel Analítico do Promessômetro Legislativo',
        description: 'Balanço detalhado do cumprimento de propostas de campanha registradas no TSE e posturas legislativas dos mandatos eleitos.',
        category: 'PROMESSAS',
        priceCents: 30000,
        publicSummary: 'Taxas de cumprimento e quebra de promessas de campanha com evidências oficiais e links do Diário Oficial.',
      },
      {
        slug: 'relatorio-financiamento-eleitoral',
        title: 'Mapeamento de Financiamento Cívico e Recursos',
        description: 'Relatório investigativo sobre distribuição de fundos partidários e doações transparentes em candidaturas progressistas.',
        category: 'FINANCIAMENTO',
        priceCents: 40000,
        publicSummary: 'Transparência de receitas, custo médio de campanha e conformidade com o teto de gastos do TSE.',
      },
    ];

    for (const prod of b2bProducts) {
      await prisma.reportProduct.upsert({
        where: { slug: prod.slug },
        update: prod,
        create: prod,
      });
    }

    // Cria contadores de teste para telemetria agregada
    const sampleCounters = [
      { key: 'rank:p3:SP:2026-09-08', count: 42 },
      { key: 'rank:p1:SP:2026-09-08', count: 38 },
      { key: 'rank:p2:RJ:2026-09-08', count: 29 },
      { key: 'rank:total:SP:2026-09-08', count: 80 },
      { key: 'rank:total:RJ:2026-09-08', count: 45 },
    ];
    for (const sc of sampleCounters) {
      await prisma.aggregateCounter.upsert({
        where: { key: sc.key },
        update: { count: sc.count },
        create: sc,
      });
    }

    console.log('✅ Catálogo B2B semeado: 4 Relatórios e Contadores Agregados de teste.');
  }

  console.log(`\n🎉 SINCRONIZAÇÃO OFICIAL CONCLUÍDA COM SUCESSO!`);
  console.log(`Total de candidatos reais e atuais cadastrados: ${totalInseridos}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro na sincronização:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
