"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCORE_LABELS = exports.MAX_PRIORITIES = exports.PRIORITY_THEMES = exports.CORE_STATEMENTS = exports.PILLAR_DISPLAY_LIST = exports.PILLAR_LABELS = exports.PILLARS = void 0;
exports.computeCoreScores = computeCoreScores;
exports.buildQuizResult = buildQuizResult;
exports.PILLARS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'];
exports.PILLAR_LABELS = {
    p1: 'Bem-Estar',
    p2: 'Justiça Social',
    p3: 'Desenvolvimento Sustentável',
    p4: 'Valores Nacionais',
    p5: 'Reindustrialização',
    p6: 'Distribuição Justa de Renda',
    p7: 'Proteção do Vulnerável',
    p8: 'Governo Eficiente',
    p9: 'Saúde Pública (Gratuita e Eficiente)',
    p10: 'Segurança Pública (Abordagem Legal e Social)',
};
exports.PILLAR_DISPLAY_LIST = [
    { id: 'p1', label: 'Bem-Estar', icon: '🏥' },
    { id: 'p2', label: 'Justiça Social', icon: '⚖️' },
    { id: 'p3', label: 'Desenvolvimento Sustentável', icon: '🌿' },
    { id: 'p4', label: 'Valores Nacionais', icon: '🇧🇷' },
    { id: 'p5', label: 'Reindustrialização', icon: '🏭' },
    { id: 'p6', label: 'Distribuição Justa de Renda', icon: '💰' },
    { id: 'p7', label: 'Proteção do Vulnerável', icon: '🛡️' },
    { id: 'p8', label: 'Governo Eficiente', icon: '📊' },
    { id: 'p9', label: 'Saúde Pública', icon: '🩺' },
    { id: 'p10', label: 'Segurança Pública', icon: '🚓' },
];
exports.CORE_STATEMENTS = [
    { id: 'p1_1', pillar: 'p1', text: 'O governo deve ampliar o acesso gratuito à saúde e educação públicas de qualidade para todos.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p1_2', pillar: 'p1', text: 'O Estado deve investir fortemente em saneamento básico, água potável e moradia digna.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p1_3', pillar: 'p1', text: 'Merenda e transporte escolar de qualidade devem ser 100% garantidos pelo poder público.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p2_1', pillar: 'p2', text: 'A desigualdade racial e de gênero exige políticas afirmativas, cotas e ações estruturais ativas do Estado.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p2_2', pillar: 'p2', text: 'Direitos civis e de cidadania devem ser garantidos igualmente a todas as pessoas, sem discriminação.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p2_3', pillar: 'p2', text: 'O combate à violência contra as mulheres e a proteção de minorias devem ser prioridades estatais.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p3_1', pillar: 'p3', text: 'O desenvolvimento econômico deve priorizar energias renováveis e o rigoroso respeito ao meio ambiente.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p3_2', pillar: 'p3', text: 'O desmatamento ilegal e crimes ambientais devem ter punições criminais e financeiras severas.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p3_3', pillar: 'p3', text: 'Cidades e estados devem criar planos de resiliência climática para proteger áreas de risco contra tragédias.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p4_1', pillar: 'p4', text: 'A soberania e a defesa dos recursos estratégicos do Brasil devem guiar a política externa e comercial.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p4_2', pillar: 'p4', text: 'A cultura, a arte, a ciência e o patrimônio histórico brasileiros devem ser protegidos e incentivados.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p4_3', pillar: 'p4', text: 'O Brasil deve manter autonomia e não se submeter a imposições de potências estrangeiras.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p5_1', pillar: 'p5', text: 'O governo deve investir e apoiar a reindustrialização verde do país para gerar empregos qualificados.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p5_2', pillar: 'p5', text: 'A tecnologia e a inovação desenvolvidas no Brasil devem ter prioridade em compras públicas.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p5_3', pillar: 'p5', text: 'Linhas de crédito acessíveis devem ser garantidas para micro, pequenas e médias empresas industriais.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p6_1', pillar: 'p6', text: 'O sistema de impostos deve ser progressivo, cobrando proporcionalmente mais de quem tem mais renda e patrimônio.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p6_2', pillar: 'p6', text: 'O salário mínimo e a renda das famílias trabalhadoras devem ter ganhos reais acima da inflação.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p6_3', pillar: 'p6', text: 'O combate à sonegação fiscal de grandes grupos econômicos deve ser intensificado para financiar serviços públicos.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p7_1', pillar: 'p7', text: 'Crianças, idosos e pessoas com deficiência devem ter proteção social integral garantida por lei.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p7_2', pillar: 'p7', text: 'Programas de garantia de renda e segurança alimentar são fundamentais para combater a pobreza e a fome.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p7_3', pillar: 'p7', text: 'O Estado deve oferecer centros de acolhimento e assistência digna para pessoas em situação de rua.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p8_1', pillar: 'p8', text: 'Agentes políticos condenados por atos de corrupção devem ser impedidos de exercer cargos públicos.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p8_2', pillar: 'p8', text: 'Todos os gastos públicos e metas de campanha devem ser 100% transparentes e auditáveis pelo cidadão.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p8_3', pillar: 'p8', text: 'O combate ao desperdício e a avaliação de desempenho dos serviços estatais devem ser permanentes.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p9_1', pillar: 'p9', text: 'O SUS deve ser fortalecido e 100% gratuito, proibindo qualquer tipo de privatização ou cobrança de serviços de saúde.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p9_2', pillar: 'p9', text: 'O investimento público em leitos de UTI, hospitais regionais e atendimento especializado deve ser prioridade orçamentária.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p9_3', pillar: 'p9', text: 'A valorização dos profissionais de saúde e a contratação de médicos para periferias e interior devem ser garantidas.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p9_4', pillar: 'p9', text: 'A gestão do sistema de saúde deve ser altamente eficiente, informatizada e focada em medicina preventiva e vacinação.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p10_1', pillar: 'p10', text: 'A segurança pública deve combinar inteligência policial, cumprimento rigoroso da lei e combate severo ao crime organizado.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p10_2', pillar: 'p10', text: 'Políticas de prevenção à violência devem focar em inclusão social, iluminação pública, educação e oportunidades para a juventude.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p10_3', pillar: 'p10', text: 'O uso de câmeras corporais em policiais e o respeito aos direitos humanos devem ser diretrizes para garantir a legalidade das operações.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
    { id: 'p10_4', pillar: 'p10', text: 'O investimento em perícia técnica, investigação de homicídios e desarticulação financeira de facções criminosas deve ser prioritário.', agreeScore: 100, neutralScore: 50, disagreeScore: 0 },
];
exports.PRIORITY_THEMES = exports.PILLARS.map((p) => ({
    pillar: p,
    label: exports.PILLAR_LABELS[p],
}));
exports.MAX_PRIORITIES = 3;
function computeCoreScores(answers) {
    const pillarBuckets = {
        p1: [], p2: [], p3: [], p4: [],
        p5: [], p6: [], p7: [], p8: [],
        p9: [], p10: [],
    };
    for (const statement of exports.CORE_STATEMENTS) {
        const answer = answers[statement.id] ?? answers[statement.pillar];
        let score = 50;
        if (answer === 'agree')
            score = 100;
        else if (answer === 'disagree')
            score = 0;
        pillarBuckets[statement.pillar].push(score);
    }
    const scores = {};
    for (const pillar of exports.PILLARS) {
        const values = pillarBuckets[pillar];
        if (values.length === 0) {
            scores[pillar] = 50;
        }
        else {
            const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
            scores[pillar] = Math.round(avg);
        }
    }
    return scores;
}
function buildQuizResult(answers, priorities) {
    return {
        coreScores: computeCoreScores(answers),
        priorityPillars: priorities.slice(0, exports.MAX_PRIORITIES),
    };
}
exports.SCORE_LABELS = {
    100: 'Concordo',
    50: 'Neutro',
    0: 'Discordo',
};
//# sourceMappingURL=quiz-core.js.map