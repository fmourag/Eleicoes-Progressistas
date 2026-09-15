import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PROGRESSIVE_KEYWORDS = [
  'PT',
  'PSB',
  'PSOL',
  'PCDOB',
  'PC DO B',
  'PV',
  'REDE',
  'PDT',
  'UP',
  'PCB',
  'PCO',
  'PSTU',
  'FE BRASIL',
  'BRASIL DA ESPERANCA',
  'BRASIL DA ESPERANÇA',
  'PSOL REDE',
  'FEDERACAO',
  'FEDERAÇÃO',
];

const OFFICIAL_PHOTOS_MAP: Record<string, string> = {
  // Presidente 2026
  '280002542548': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg/500px-Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg',
  '280001600001': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg/500px-Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg',
  '280002551975': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Edmilson_Costa_%28cropped%29.jpg/500px-Edmilson_Costa_%28cropped%29.jpg',
  '280002538811': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Samara_Martins_em_2024.jpg/500px-Samara_Martins_em_2024.jpg',
  '280002541457': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Hertz_Dias_%28cropped%29.jpg/500px-Hertz_Dias_%28cropped%29.jpg',
  '280002552487': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Rui_Costa_Pimenta_2018.jpg/500px-Rui_Costa_Pimenta_2018.jpg',

  // Governadores
  'gov_rj_paes': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Eduardo_Paes%2C_October_2024.jpg/500px-Eduardo_Paes%2C_October_2024.jpg',
  '190002540001': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Eduardo_Paes%2C_October_2024.jpg/500px-Eduardo_Paes%2C_October_2024.jpg',
  '190002540198': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/2020_CYRO_GARCIA_CANDIDATO_PREFEITO_RJ_RIO_DE_JANEIRO_TSE_%28190000858699%29.jpg/500px-2020_CYRO_GARCIA_CANDIDATO_PREFEITO_RJ_RIO_DE_JANEIRO_TSE_%28190000858699%29.jpg',
  'gov_rj_cyro': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/2020_CYRO_GARCIA_CANDIDATO_PREFEITO_RJ_RIO_DE_JANEIRO_TSE_%28190000858699%29.jpg/500px-2020_CYRO_GARCIA_CANDIDATO_PREFEITO_RJ_RIO_DE_JANEIRO_TSE_%28190000858699%29.jpg',
  '190002540200': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Juliete_Pantoja_%28foto_oficial_para_o_TSE%29_-_2022_-_FRJ190001609712_div.jpg',
  'gov_rj_juliete': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Juliete_Pantoja_%28foto_oficial_para_o_TSE%29_-_2022_-_FRJ190001609712_div.jpg',
  '190002547272': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Juliete_Pantoja_%28foto_oficial_para_o_TSE%29_-_2022_-_FRJ190001609712_div.jpg',
  'gov_sp_haddad': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Fernando_Haddad_posse_min._da_Fazenda.jpg/500px-Fernando_Haddad_posse_min._da_Fazenda.jpg',
  'gov_ba_jeronimo': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/18_01_2023_-_Visita_de_Cortesia_Jer%C3%B4nimo_Rodrigues_%28Governador_do_Estado_da_Bahia-BA%29_%2852635213362%29_%28cropped%29.jpg/500px-18_01_2023_-_Visita_de_Cortesia_Jer%C3%B4nimo_Rodrigues_%28Governador_do_Estado_da_Bahia-BA%29_%2852635213362%29_%28cropped%29.jpg',
  'gov_pi_rafael': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/Rafael_Fonteles_%28Foto_Oficial%29.jpg/500px-Rafael_Fonteles_%28Foto_Oficial%29.jpg',
  'gov_rn_fatima': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/F%C3%A1tima_Bezerra%2C_2023.jpg/500px-F%C3%A1tima_Bezerra%2C_2023.jpg',
  'gov_pb_azevedo': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/Jo%C3%A3o_Azev%C3%AAdo%2C_May_2023_%28cropped%29.jpg/500px-Jo%C3%A3o_Azev%C3%AAdo%2C_May_2023_%28cropped%29.jpg',
  'gov_ap_clecio': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Cl%C3%A9cio_Lu%C3%ADs_em_2023.jpg/500px-Cl%C3%A9cio_Lu%C3%ADs_em_2023.jpg',
  'gov_rj_neves': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Rodrigo_Neves_em_2018.jpg/500px-Rodrigo_Neves_em_2018.jpg',
  'gov_rs_pretto': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Edegar_Pretto_em_2022.jpg/500px-Edegar_Pretto_em_2022.jpg',
  'gov_df_grass': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/75/Leandro_Grass_em_2022.jpg/500px-Leandro_Grass_em_2022.jpg',
};

async function main() {
  console.log('🔄 Iniciando Reconciliação Nacional de Apoios, Coligações, Situação TSE e Fotos...');

  // 1. Atualiza candidaturaStatus para DEFERIDO para todas as candidaturas ativas com fichaLimpa
  const statusRes = await prisma.candidate.updateMany({
    where: {
      fichaLimpa: true,
      candidaturaStatus: 'EM_ANALISE',
    },
    data: {
      candidaturaStatus: 'DEFERIDO',
    },
  });
  console.log(`✅ Status regularizado para DEFERIDO em ${statusRes.count} candidatos com ficha limpa.`);

  // 2. Reconcilia Eduardo Paes (RJ - Governador com apoio progressista)
  const paesUpdated = await prisma.candidate.updateMany({
    where: {
      OR: [
        { tseId: 'gov_rj_paes' },
        { name: { contains: 'EDUARDO DA COSTA PAES', mode: 'insensitive' } },
        { name: { contains: 'EDUARDO PAES', mode: 'insensitive' } },
      ],
    },
    data: {
      party: 'PSD',
      partyNumber: 55,
      numeroUrna: '55',
      cargo: 'GOVERNADOR',
      level: 'ESTADUAL',
      state: 'RJ',
      electionYear: 2026,
      candidaturaStatus: 'DEFERIDO',
      fichaLimpa: true,
      visible: true,
      isProgressiveSupported: true,
      supportedBy: 'Coligação É a Vez do Povo (PSD / PT / PSB / PCdoB / PV / PDT)',
      coalition: 'PSD / PT / PSB / PCdoB / PV / PDT',
      photoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Eduardo_Paes%2C_October_2024.jpg/500px-Eduardo_Paes%2C_October_2024.jpg',
    },
  });
  console.log(`✅ Eduardo Paes configurado com apoio progressista (${paesUpdated.count} registros).`);

  // Se Eduardo Paes ainda não existir com tseId 'gov_rj_paes', cria o registro oficial
  const paesCheck = await prisma.candidate.findFirst({
    where: { OR: [{ tseId: 'gov_rj_paes' }, { tseId: '190002540001' }] },
  });
  if (!paesCheck) {
    await prisma.candidate.create({
      data: {
        tseId: 'gov_rj_paes',
        name: 'Eduardo da Costa Paes',
        socialName: 'Eduardo Paes',
        party: 'PSD',
        partyNumber: 55,
        numeroUrna: '55',
        cargo: 'GOVERNADOR',
        level: 'ESTADUAL',
        state: 'RJ',
        municipality: 'RIO DE JANEIRO',
        cpfHash: 'hash_paes_rj',
        electionYear: 2026,
        candidaturaStatus: 'DEFERIDO',
        fichaLimpa: true,
        visible: true,
        isProgressiveSupported: true,
        supportedBy: 'Coligação É a Vez do Povo (PSD / PT / PSB / PCdoB / PV / PDT)',
        coalition: 'PSD / PT / PSB / PCdoB / PV / PDT',
        photoUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Eduardo_Paes%2C_October_2024.jpg/500px-Eduardo_Paes%2C_October_2024.jpg',
        profileScores: {
          p1: 0.88, p2: 0.82, p3: 0.85, p4: 0.86, p5: 0.88, p6: 0.80,
          p7: 0.84, p8: 0.86, p9: 0.88, p10: 0.85, p11: 0.88, p12: 0.85, p13: 0.90,
        },
      },
    });
    console.log('✅ Registro oficial de Eduardo Paes criado no banco.');
  }

  // 3. Reconciliação Nacional: Qualquer candidato que tenha coligação progressista recebe isProgressiveSupported = true
  for (const kw of PROGRESSIVE_KEYWORDS) {
    const coalRes = await prisma.candidate.updateMany({
      where: {
        coalition: { contains: kw, mode: 'insensitive' },
        isProgressiveSupported: false,
      },
      data: {
        isProgressiveSupported: true,
        visible: true,
        candidaturaStatus: 'DEFERIDO',
      },
    });
    if (coalRes.count > 0) {
      console.log(`✅ Reconciliados ${coalRes.count} candidatos com coligação contendo '${kw}'.`);
    }
  }

  // 4. Aplicação de fotos oficiais mapeadas
  for (const [tseId, photoUrl] of Object.entries(OFFICIAL_PHOTOS_MAP)) {
    const pRes = await prisma.candidate.updateMany({
      where: { tseId },
      data: { photoUrl },
    });
    if (pRes.count > 0) {
      console.log(`📸 Foto aplicada para TSE ID ${tseId}: ${photoUrl}`);
    }
  }

  console.log('🎉 Reconciliação nacional concluída com sucesso!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
