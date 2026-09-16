// ─── Input Types ─────────────────────────────────────────────────────────────

export interface NewsInput {
  text?: string;
  url?: string;
  headline?: string;
  description?: string;
  mode?: 'text' | 'url' | 'headline';
  demoCase?: 1 | 2 | 3;
}

// ─── Claim Types ──────────────────────────────────────────────────────────────

export type ClaimVerdict =
  | 'VERIFIED'
  | 'LIKELY_TRUE'
  | 'UNVERIFIED'
  | 'MISLEADING'
  | 'LIKELY_FALSE'
  | 'FALSE';

export interface Evidence {
  id: string;
  claimId?: string;
  sourceTitle: string;
  publisher: string;
  publisherUrl: string;
  publicationDate: string;
  url: string;
  excerpt: string;
  relevance: 'SUPPORTING' | 'CONTRADICTING' | 'NEUTRAL';
  explanation: string;
  isDemo?: boolean;
}

export interface Claim {
  id: string;
  analysisId?: string;
  claimText: string;
  verdict: ClaimVerdict;
  confidence: number; // 0-100
  explanation: string;
  supportingEvidence: Evidence[];
  contradictingEvidence: Evidence[];
}

// ─── Source Credibility ───────────────────────────────────────────────────────

export interface SourceCredibility {
  overall: number; // 0-100
  publisherScore: number;
  transparencyScore: number;
  citationsScore: number;
  domainScore: number;
  authorScore: number;
  signals: CredibilitySignal[];
  domain?: string;
  publisherName?: string;
  hasHttps: boolean;
  hasAuthor: boolean;
  hasCitations: boolean;
  hasDate: boolean;
}

export interface CredibilitySignal {
  type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  label: string;
  description: string;
}

// ─── Context Analysis ─────────────────────────────────────────────────────────

export interface ContextAnalysis {
  verdict: 'AUTHENTIC_CONTEXT' | 'MISLEADING_CONTEXT' | 'UNVERIFIABLE' | 'LIKELY_MISLEADING';
  confidence: number;
  imageAuthenticity?: 'LIKELY_AUTHENTIC' | 'LIKELY_AI_GENERATED' | 'UNKNOWN';
  originalDate?: string;
  claimedDate?: string;
  contextMatchScore: number; // 0-100
  issues: ContextIssue[];
  explanation: string;
}

export interface ContextIssue {
  type: 'DATE_MISMATCH' | 'LOCATION_MISMATCH' | 'PERSON_MISMATCH' | 'EVENT_MISMATCH' | 'FABRICATED_ATTRIBUTION';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

// ─── Language Analysis ────────────────────────────────────────────────────────

export interface LanguageSignals {
  clickbaitScore: number; // 0-100
  emotionalLanguageScore: number;
  unsupportedCertaintyScore: number;
  missingAttributionScore: number;
  sensationalismScore: number;
  allCapsCount: number;
  exclamationCount: number;
  triggerWords: string[];
  overallManipulationScore: number;
  summary: string;
}

// ─── News DNA ─────────────────────────────────────────────────────────────────

export interface NewsDNANode {
  id: string;
  type: 'ORIGINAL_CLAIM' | 'PUBLISHED_ARTICLE' | 'SOCIAL_MEDIA' | 'MODIFIED_VERSION' | 'VIRAL_CLAIM';
  label: string;
  description: string;
  date?: string;
  source?: string;
  url?: string;
  isSimulated: boolean;
}

export interface NewsDNALink {
  source: string;
  target: string;
  relationship: 'PUBLISHED' | 'SHARED' | 'MODIFIED' | 'VIRAL_SPREAD';
}

export interface NewsDNA {
  nodes: NewsDNANode[];
  links: NewsDNALink[];
  isSimulated: boolean;
  propagationLabel: string;
}

// ─── Truth Score ──────────────────────────────────────────────────────────────

export type OverallVerdict =
  | 'VERIFIED'
  | 'LIKELY_TRUE'
  | 'UNVERIFIED'
  | 'MISLEADING'
  | 'LIKELY_FALSE'
  | 'INSUFFICIENT_EVIDENCE';

export interface TruthScoreFactor {
  name: string;
  weight: number; // percentage
  score: number; // 0-100
  contribution: number; // weighted score
  explanation: string;
}

export interface TruthScore {
  overall: number; // 0-100
  verdict: OverallVerdict;
  factors: TruthScoreFactor[];
  explanation: string[];
}

// ─── Full Analysis ────────────────────────────────────────────────────────────

export interface NewsAnalysis {
  id: string;
  inputText: string;
  headline: string;
  url?: string;
  sourceUrl?: string;
  extractedContent?: string;
  truthScore: TruthScore;
  claims: Claim[];
  sourceCredibility: SourceCredibility;
  contextAnalysis: ContextAnalysis;
  languageSignals: LanguageSignals;
  newsDNA: NewsDNA;
  isDemo: boolean;
  demoCase?: number;
  processingSteps: ProcessingStep[];
  createdAt: string;
  analysisVersion: string;
}

export interface ProcessingStep {
  step: string;
  label: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  duration?: number;
}

// ─── History ──────────────────────────────────────────────────────────────────

export interface AnalysisHistoryItem {
  id: string;
  headline: string;
  truthScore: number;
  verdict: OverallVerdict;
  isDemo: boolean;
  createdAt: string;
  url?: string;
}
