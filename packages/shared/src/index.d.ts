import { PillarId } from './quiz-core';
export * from './quiz-core';
export declare const PILLAR_DESCRIPTIONS: Record<PillarId, string>;
export interface PillarScores {
    p1: number;
    p2: number;
    p3: number;
    p4: number;
    p5: number;
    p6: number;
    p7: number;
    p8: number;
    p9?: number;
    p10?: number;
}
export type Cargo = 'VEREADOR' | 'PREFEITO' | 'VICE_PREFEITO' | 'DEPUTADO_ESTADUAL' | 'GOVERNADOR' | 'VICE_GOVERNADOR' | 'SENADOR' | 'DEPUTADO_FEDERAL' | 'PRESIDENTE' | 'VICE_PRESIDENTE';
export type ElectionLevel = 'MUNICIPAL' | 'ESTADUAL' | 'FEDERAL';
export type CandidaturaStatus = 'EM_ANALISE' | 'DEFERIDO' | 'INDEFERIDO' | 'CASSADO' | 'RENUNCIA';
export interface Candidate {
    id: string;
    tseId: string;
    name: string;
    socialName?: string | null;
    viceName?: string | null;
    party: string;
    partyNumber: number;
    cargo: Cargo;
    level: ElectionLevel;
    candidaturaStatus: CandidaturaStatus;
    dataRegistro?: string;
    hasWarning?: boolean;
    warningMessage?: string;
    municipality?: string;
    state?: string;
    cpfHash?: string;
    photoUrl?: string | null;
    fichaLimpa: boolean;
    financedBy?: Record<string, unknown>;
    votingHistory?: Record<string, unknown>;
    proposals?: Record<string, unknown>;
    governmentPlanUrl?: string | null;
    governmentPlanSummary?: string | null;
    profileScores?: PillarScores;
}
export declare const CARGOS_BY_LEVEL: Record<ElectionLevel, Cargo[]>;
export type ElectionYear = 2022 | 2024 | 2026;
export declare const CURRENT_ELECTION_YEAR: ElectionYear;
export declare const UPCOMING_ELECTION: {
    year: ElectionYear;
    type: "GERAIS";
    label: string;
    sourceNotice: string;
    cargos: Cargo[];
};
export declare const EXCLUDED_CONSERVATIVE_PARTIES: readonly ["PL", "NOVO", "UNIÃO", "UNIAO", "UNIÃO BRASIL", "UNIAO BRASIL", "PP", "REPUBLICANOS", "PRD", "MISSÃO", "MISSAO"];
export declare const PROGRESSIVE_GUIDELINE_NOTICE = "\uD83D\uDCA1 Diretriz de Alinhamento: Mapeamento exclusivo de candidaturas de campo progressista.";
