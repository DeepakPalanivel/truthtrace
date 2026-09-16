export type ClaimVerdict = 'VERIFIED' | 'LIKELY_TRUE' | 'UNVERIFIED' | 'MISLEADING' | 'LIKELY_FALSE' | 'FALSE';
export type OverallVerdict = 'VERIFIED' | 'LIKELY_TRUE' | 'UNVERIFIED' | 'MISLEADING' | 'LIKELY_FALSE' | 'INSUFFICIENT_EVIDENCE';

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
  confidence: number;
  explanation: string;
  supportingEvidence: Evidence[];
  contradictingEvidence: Evidence[];
}

export interface CredibilitySignal {
  type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  label: string;
  description: string;
}

export interface SourceCredibility {
  overall: number;
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

export interface ContextIssue {
  type: 'DATE_MISMATCH' | 'LOCATION_MISMATCH' | 'PERSON_MISMATCH' | 'EVENT_MISMATCH' | 'FABRICATED_ATTRIBUTION';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export interface ContextAnalysis {
  verdict: 'AUTHENTIC_CONTEXT' | 'MISLEADING_CONTEXT' | 'UNVERIFIABLE' | 'LIKELY_MISLEADING';
  confidence: number;
  imageAuthenticity?: 'LIKELY_AUTHENTIC' | 'LIKELY_AI_GENERATED' | 'UNKNOWN';
  originalDate?: string;
  claimedDate?: string;
  contextMatchScore: number;
  issues: ContextIssue[];
  explanation: string;
}

export interface LanguageSignals {
  clickbaitScore: number;
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

export interface TruthScoreFactor {
  name: string;
  weight: number;
  score: number;
  contribution: number;
  explanation: string;
}

export interface TruthScore {
  overall: number;
  verdict: OverallVerdict;
  factors: TruthScoreFactor[];
  explanation: string[];
}

export interface ProcessingStep {
  step: string;
  label: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  duration?: number;
}

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

export interface AnalysisHistoryItem {
  id: string;
  headline: string;
  truthScore: number;
  verdict: OverallVerdict;
  isDemo: boolean;
  createdAt: string;
  url?: string;
}

export interface NewsInput {
  text?: string;
  url?: string;
  headline?: string;
  description?: string;
  demoCase?: 1 | 2 | 3;
}
