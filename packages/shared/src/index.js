"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROGRESSIVE_GUIDELINE_NOTICE = exports.EXCLUDED_CONSERVATIVE_PARTIES = exports.UPCOMING_ELECTION = exports.CURRENT_ELECTION_YEAR = exports.CARGOS_BY_LEVEL = exports.PILLAR_DESCRIPTIONS = void 0;
__exportStar(require("./quiz-core"), exports);
exports.PILLAR_DESCRIPTIONS = {
    p1: 'Saúde, educação e assistência social',
    p2: 'Direitos humanos e combate a desigualdades',
    p3: 'Meio ambiente e economia verde',
    p4: 'Soberania, cultura e identidade nacional',
    p5: 'Indústria, tecnologia e geração de emprego',
    p6: 'Tributação justa, salário mínimo e transferência de renda',
    p7: 'Idosos, crianças, PcD e populações tradicionais',
    p8: 'Transparência, desburocratização e fiscalização',
    p9: 'Saúde pública universal, gratuita e eficiente (SUS)',
    p10: 'Segurança pública com inteligência e prevenção social',
};
exports.CARGOS_BY_LEVEL = {
    MUNICIPAL: ['VEREADOR', 'PREFEITO'],
    ESTADUAL: ['DEPUTADO_ESTADUAL', 'GOVERNADOR', 'SENADOR'],
    FEDERAL: ['DEPUTADO_FEDERAL', 'SENADOR', 'PRESIDENTE'],
};
exports.CURRENT_ELECTION_YEAR = 2026;
exports.UPCOMING_ELECTION = {
    year: 2026,
    type: 'GERAIS',
    label: 'Eleições Gerais 2026',
    sourceNotice: 'Candidaturas Ativas TSE/TRE',
    cargos: [
        'DEPUTADO_ESTADUAL',
        'DEPUTADO_FEDERAL',
        'SENADOR',
        'GOVERNADOR',
        'PRESIDENTE',
    ],
};
exports.EXCLUDED_CONSERVATIVE_PARTIES = [
    'PL',
    'NOVO',
    'UNIÃO',
    'UNIAO',
    'UNIÃO BRASIL',
    'UNIAO BRASIL',
    'PP',
    'REPUBLICANOS',
    'PRD',
    'MISSÃO',
    'MISSAO',
];
exports.PROGRESSIVE_GUIDELINE_NOTICE = "💡 Diretriz de Alinhamento: Mapeamento exclusivo de candidaturas de campo progressista.";
//# sourceMappingURL=index.js.map