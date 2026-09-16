import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
  },
});

const GOVERNOR_VICES: Record<string, string> = {
  'gov_rj_paes': 'Jane Reis',
  'Eduardo da Costa Paes': 'Jane Reis',
  'gov_sp_franca': 'Juliano Medeiros',
  'Márcio França': 'Juliano Medeiros',
  'Márcio Luiz França Gomes': 'Juliano Medeiros',
  'gov_sp_haddad': 'Lúcia França',
  'Fernando Haddad': 'Lúcia França',
  'gov_sp_vivian': 'Tito Flávio',
  'Vivian Mendes da Silva': 'Tito Flávio',
  'gov_sp_machado': 'Edson Dorta',
  'Carlos Alberto Machado': 'Edson Dorta',
  'gov_sp_izadora': 'Manoel Messias',
  'Izadora Cristina Dias da Silva': 'Manoel Messias',
  'gov_sp_veralucia': 'Gabriel Colombo',
  'Vera Lúcia Pereira da Silva Salgado': 'Gabriel Colombo',
  'gov_sp_edjane': 'Reinaldo Santos',
  'Edjane Lima de Sousa': 'Reinaldo Santos',
  'gov_ba_jeronimo': 'Geraldo Júnior',
  'Jerônimo Rodrigues Souza': 'Geraldo Júnior',
  'gov_ce_elmano': 'Jade Romero',
  'Elmano de Freitas da Costa': 'Jade Romero',
  'gov_ma_brandao': 'Felipe Camarão',
  'Carlos Orleans Brandão Júnior': 'Felipe Camarão',
  'gov_pb_azevedo': 'Lucas Ribeiro',
  'João Azevêdo Lins Filho': 'Lucas Ribeiro',
  'gov_pe_cabral': 'Luciana Santos',
  'Danilo Jorge de Barros Cabral': 'Luciana Santos',
  'gov_pi_rafael': 'Themístocles Filho',
  'Rafael Tajra Fonteles': 'Themístocles Filho',
  'gov_rn_fatima': 'Walter Alves',
  'Maria de Fátima Bezerra': 'Walter Alves',
  'gov_se_mitidieri': 'Zezinho Sobral',
  'Fábio Cruz Mitidieri': 'Zezinho Sobral',
  'gov_al_dantas': 'José Wanderley Neto',
  'Paulo Suruagy do Amaral Dantas': 'José Wanderley Neto',
  'gov_pa_helder': 'Hana Ghassan Tuma',
  'Helder Zahluth Barbalho': 'Hana Ghassan Tuma',
  'gov_ac_jorge': 'Marcus Alexandre',
  'Jorge Ney Viana Macedo Neves': 'Marcus Alexandre',
  'gov_ap_clecio': 'Antônio Teles Júnior',
  'Clécio Luís Vilhena Vieira': 'Antônio Teles Júnior',
  'gov_am_braga': 'Anne Moura',
  'Carlos Eduardo de Souza Braga': 'Anne Moura',
  'gov_ro_daniel': 'Anselmo de Jesus',
  'Daniel Pereira': 'Anselmo de Jesus',
  'gov_rr_teresa': 'Édio Lopes',
  'Maria Teresa Saenz Surita Jucá': 'Édio Lopes',
  'gov_to_mourao': 'Professora Germana Pires',
  'Paulo Roberto Mourão': 'Professora Germana Pires',
  'gov_df_grass': 'Olgamir Amancia',
  'Leandro Antonio Grass Peixoto': 'Olgamir Amancia',
  'gov_go_wolmir': 'Fernando Tibúrcio',
  'Wolmir Therezio Amado': 'Fernando Tibúrcio',
  'gov_mt_natasha': 'Vinicius Hugueney',
  'Natasha Slhessarenko': 'Vinicius Hugueney',
  'gov_ms_giselle': 'Mário Fonseca',
  'Giselle Marques de Araújo': 'Mário Fonseca',
  'gov_es_casagrande': 'Ricardo Ferraço',
  'José Renato Casagrande': 'Ricardo Ferraço',
  'gov_mg_silveira': 'Paulo Brant',
  'Alexandre Silveira de Oliveira': 'Paulo Brant',
  'gov_pr_requiao': 'Jorge Samek',
  'Roberto Requião de Mello e Silva': 'Jorge Samek',
  'gov_rs_pretto': 'Pedro Ruas',
  'Edegar Pretto': 'Pedro Ruas',
  'gov_sc_decio': 'Marcio Búrigo',
  'Décio Nery de Lima': 'Marcio Búrigo',
};

async function run() {
  console.log('🔄 Atualizando vice para Governadores...');
  const governors = await prisma.candidate.findMany({
    where: { cargo: 'GOVERNADOR' },
  });

  console.log(`Encontrados ${governors.length} governadores no banco.`);
  let updated = 0;

  for (const g of governors) {
    const vice = GOVERNOR_VICES[g.tseId] || GOVERNOR_VICES[g.name] || GOVERNOR_VICES[g.socialName || ''];
    if (vice) {
      await prisma.candidate.update({
        where: { id: g.id },
        data: { viceName: vice },
      });
      console.log(`  ✓ ${g.socialName || g.name} (${g.state}) -> Vice: ${vice}`);
      updated++;
    } else {
      console.log(`  ⚠️ Sem vice mapeado para: ${g.name} (${g.tseId})`);
    }
  }

  console.log(`✅ Total de governadores com vice atualizado: ${updated}/${governors.length}`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
