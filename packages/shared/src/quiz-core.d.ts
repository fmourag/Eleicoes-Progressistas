export declare const PILLARS: readonly ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10"];
export type PillarId = (typeof PILLARS)[number];
export declare const PILLAR_LABELS: Record<PillarId, string>;
export interface PillarDisplayItem {
    id: PillarId;
    label: string;
    icon: string;
}
export declare const PILLAR_DISPLAY_LIST: PillarDisplayItem[];
export interface CoreStatement {
    id: string;
    pillar: PillarId;
    text: string;
    agreeScore: 100;
    neutralScore: 50;
    disagreeScore: 0;
}
export declare const CORE_STATEMENTS: CoreStatement[];
export interface PriorityTheme {
    pillar: PillarId;
    label: string;
}
export declare const PRIORITY_THEMES: PriorityTheme[];
export declare const MAX_PRIORITIES = 3;
export type CoreScores = Record<PillarId, number>;
export interface QuizResult {
    coreScores: CoreScores;
    priorityPillars: PillarId[];
}
export declare function computeCoreScores(answers: Record<string, 'agree' | 'neutral' | 'disagree'>): CoreScores;
export declare function buildQuizResult(answers: Record<string, 'agree' | 'neutral' | 'disagree'>, priorities: PillarId[]): QuizResult;
export declare const SCORE_LABELS: Record<number, string>;
