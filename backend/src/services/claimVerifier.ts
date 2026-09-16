/**
 * TruthTrace Claim Verifier — heuristic fallback
 * Used when AI is unavailable. AI-powered evaluation is in aiInvestigator.ts.
 */

import { v4 as uuidv4 } from 'uuid';
import { search, rateSourceReliability, type SearchResult } from './searchService';
import type { Evidence, ClaimVerdict } from '../types/index';

// ─── Heuristic evidence evaluator ────────────────────────────────────────────

interface EvaluatedResult {
  result: SearchResult;
  relevance: 'SUPPORTING' | 'CONTRADICTING' | 'IRRELEVANT';
  explanation: string;
  reliability: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
}

function evaluateResult(claim: string, result: SearchResult): EvaluatedResult {
  const reliability = rateSourceReliability(result.url);
  const claimLower = claim.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const content = (result.snippet + ' ' + result.title).toLowerCase().replace(/[^a-z0-9\s]/g, ' ');

  // Extract meaningful words from claim (length > 3, not stop words)
  const stopWords = new Set(['this', 'that', 'with', 'from', 'have', 'been', 'were', 'will', 'what', 'when', 'where', 'which', 'their', 'there']);
  const claimWords = claimLower.split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));

  if (claimWords.length === 0) {
    return { result, relevance: 'IRRELEVANT', explanation: 'Could not extract meaningful words from claim.', reliability };
  }

  const matchCount = claimWords.filter(w => content.includes(w)).length;
  const matchRatio = matchCount / claimWords.length;

  // Debug log
  console.log(`  [EVAL] "${claim.substring(0, 40)}" vs "${result.title.substring(0, 40)}" → match:${matchCount}/${claimWords.length} (${(matchRatio * 100).toFixed(0)}%)`);

  // More lenient threshold — 15% match for relevance (was 25%, too strict)
  if (matchRatio < 0.15) {
    return { result, relevance: 'IRRELEVANT', explanation: 'Low topical overlap with claim.', reliability };
  }

  // Contradiction patterns
  const contradictions = [
    /no such (scheme|announcement|order|policy|program)/i,
    /did not (announce|sign|approve|confirm|launch)/i,
    /(false|fake|hoax|misleading|misinformation|debunked)/i,
    /not (true|correct|accurate|confirmed|real)/i,
    /deny|denied|denies|contradicts?/i,
    /no evidence.*claim/i,
    /could not be (verified|confirmed)/i,
    /fact.?check.*(false|mislead)/i,
  ];

  // Support patterns
  const supports = [
    /confirmed?|officially|officially announced/i,
    /is (the |a )?(current|serving|prime minister|president|ceo)/i,
    /took office|assumed office|sworn in/i,
    /successfully launched|mission.*success/i,
    /boil(s|ing)? at|degrees? celsius|standard.*pressure/i,
    /according to (official|government|ministry|prime minister)/i,
    /has been|has served|has held/i,
    /prime minister.*since|since \d{4}.*prime minister/i,
  ];

  const hasContradiction = contradictions.some(p => p.test(content));
  const hasSupport = supports.some(p => p.test(content));

  if (hasContradiction && reliability !== 'LOW') {
    return {
      result,
      relevance: 'CONTRADICTING',
      explanation: `Source contradicts the claim (${reliability} reliability source).`,
      reliability,
    };
  }

  if (hasSupport) {
    return {
      result,
      relevance: 'SUPPORTING',
      explanation: `Source supports the claim (${reliability} reliability).`,
      reliability,
    };
  }

  // Even without explicit support patterns, if match is strong → SUPPORTING
  if (matchRatio >= 0.3) {
    return {
      result,
      relevance: 'SUPPORTING',
      explanation: `Source discusses the same topic and is consistent with the claim.`,
      reliability,
    };
  }

  return {
    result,
    relevance: 'IRRELEVANT',
    explanation: 'Partial overlap but no clear support or contradiction.',
    reliability,
  };
}

// ─── Convert to Evidence ──────────────────────────────────────────────────────

function toEvidence(ev: EvaluatedResult, claimId: string): Evidence {
  const relevance: Evidence['relevance'] = ev.relevance === 'IRRELEVANT' ? 'NEUTRAL' : ev.relevance;
  let publisherName = 'Unknown';
  try { publisherName = new URL(ev.result.url).hostname.replace('www.', ''); } catch { /* ignore */ }

  return {
    id: uuidv4(),
    claimId,
    sourceTitle: ev.result.title || publisherName,
    publisher: `${publisherName} (${ev.reliability} reliability)`,
    publisherUrl: `https://${publisherName}`,
    publicationDate: ev.result.publishedDate || new Date().toISOString().split('T')[0],
    url: ev.result.url,
    excerpt: ev.result.snippet.substring(0, 300),
    relevance,
    explanation: ev.explanation,
    isDemo: false,
  };
}

// ─── Export: heuristic bulk evaluator ────────────────────────────────────────

export function evaluateResultsHeuristic(
  claimId: string,
  claimText: string,
  results: SearchResult[]
): { supportingEvidence: Evidence[]; contradictingEvidence: Evidence[] } {
  const evaluated = results.map(r => evaluateResult(claimText, r));

  const supporting = evaluated.filter(e => e.relevance === 'SUPPORTING').slice(0, 4);
  const contradicting = evaluated.filter(e => e.relevance === 'CONTRADICTING').slice(0, 3);

  console.log(`[HEURISTIC] ${claimText.substring(0, 50)} → support:${supporting.length} contra:${contradicting.length} irrelevant:${evaluated.filter(e => e.relevance === 'IRRELEVANT').length}`);

  return {
    supportingEvidence: supporting.map(e => toEvidence(e, claimId)),
    contradictingEvidence: contradicting.map(e => toEvidence(e, claimId)),
  };
}

// ─── Derive verdict from evidence ────────────────────────────────────────────

export function deriveClaimVerdict(
  supportingEvidence: Evidence[],
  contradictingEvidence: Evidence[],
  claimType: string
): { verdict: ClaimVerdict; confidence: number; explanation: string } {

  if (claimType === 'OPINION' || claimType === 'opinion') {
    return { verdict: 'UNVERIFIED', confidence: 40, explanation: 'This is an opinion — fact-checking does not apply.' };
  }

  const total = supportingEvidence.length + contradictingEvidence.length;
  if (total === 0) {
    return {
      verdict: 'UNVERIFIED', confidence: 30,
      explanation: 'No reliable evidence found to confirm or contradict this claim. This does NOT mean it is false.',
    };
  }

  const weightOf = (ev: Evidence[]) => ev.reduce((sum, e) => {
    const r = rateSourceReliability(e.url);
    return sum + (r === 'HIGH' ? 1.0 : r === 'MEDIUM' ? 0.6 : 0.3);
  }, 0);

  const supportW = weightOf(supportingEvidence);
  const contraW = weightOf(contradictingEvidence);
  const totalW = supportW + contraW;
  const supportRatio = totalW > 0 ? supportW / totalW : 0.5;

  if (contraW >= 1.5 && supportW < 0.5) {
    return {
      verdict: 'LIKELY_FALSE',
      confidence: Math.min(92, 60 + Math.round(contraW * 15)),
      explanation: `${contradictingEvidence.length} source(s) contradict this claim.`,
    };
  }

  const highSupport = supportingEvidence.filter(e => rateSourceReliability(e.url) === 'HIGH');
  if (supportW >= 1.5 && contraW < 0.5) {
    if (highSupport.length >= 2) {
      return {
        verdict: 'VERIFIED',
        confidence: Math.min(96, 70 + highSupport.length * 8),
        explanation: `${highSupport.length} high-reliability source(s) confirm this claim.`,
      };
    }
    return {
      verdict: 'LIKELY_TRUE',
      confidence: Math.min(88, 55 + Math.round(supportW * 12)),
      explanation: `${supportingEvidence.length} source(s) support this claim.`,
    };
  }

  if (supportW >= 0.5 && supportRatio >= 0.6) {
    return {
      verdict: 'LIKELY_TRUE',
      confidence: Math.min(78, 45 + Math.round(supportRatio * 30)),
      explanation: `Evidence leans supportive (${supportingEvidence.length} for, ${contradictingEvidence.length} against).`,
    };
  }

  if (contraW >= 0.5 && supportRatio < 0.4) {
    return {
      verdict: 'LIKELY_FALSE',
      confidence: Math.min(80, 45 + Math.round((1 - supportRatio) * 30)),
      explanation: `Evidence leans contradictory (${contradictingEvidence.length} against, ${supportingEvidence.length} for).`,
    };
  }

  return {
    verdict: 'UNVERIFIED', confidence: 45,
    explanation: `Mixed or inconclusive evidence (${supportingEvidence.length} supporting, ${contradictingEvidence.length} contradicting).`,
  };
}

// ─── Main heuristic verifier ──────────────────────────────────────────────────

export interface ClaimVerificationResult {
  claimId: string;
  verdict: ClaimVerdict;
  confidence: number;
  explanation: string;
  supportingEvidence: Evidence[];
  contradictingEvidence: Evidence[];
  searchProvider: string;
  queriesUsed: string[];
}

export async function verifyClaim(
  claimId: string,
  claimText: string,
  claimType: string
): Promise<ClaimVerificationResult> {
  // Generate queries
  const clean = claimText.replace(/["""'']/g, '').trim();
  const queries: string[] = [clean.substring(0, 120)];
  const words = clean.split(' ');
  if (words.length > 6) queries.push(words.slice(0, 6).join(' '));

  const allResults: SearchResult[] = [];
  let usedProvider = 'none';

  for (const query of queries) {
    if (allResults.length >= 6) break;
    try {
      const { results, provider } = await search(query);
      allResults.push(...results);
      if (provider !== 'none') usedProvider = provider;
    } catch { /* continue */ }
  }

  // Deduplicate
  const seen = new Set<string>();
  const deduped = allResults.filter(r => {
    if (!r.url || seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  const { supportingEvidence, contradictingEvidence } = evaluateResultsHeuristic(claimId, claimText, deduped);
  const { verdict, confidence, explanation } = deriveClaimVerdict(supportingEvidence, contradictingEvidence, claimType);

  return { claimId, verdict, confidence, explanation, supportingEvidence, contradictingEvidence, searchProvider: usedProvider, queriesUsed: queries };
}
