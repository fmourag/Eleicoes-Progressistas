import { MandateProposalDetail } from '@np/shared';
export interface CivicSearchResult {
    proposalIndex: number;
    proposal: MandateProposalDetail;
    relevanceScore: number;
    matchedSnippet: string;
    matchField: 'title' | 'diretrizes' | 'metasAcoes' | 'diagnostico' | 'general';
    matchedKeywords: string[];
}
export declare const CIVIC_SYNONYMS: Record<string, string[]>;
export declare function normalizeText(text: string): string;
export declare function extractKeywords(rawQuery: string): string[];
export declare function expandKeywords(keywords: string[]): string[];
export declare function searchMandateProposals(query: string, proposals: MandateProposalDetail[]): CivicSearchResult[];
