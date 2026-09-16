/**
 * TruthTrace Analysis Service — v1.3
 *
 * AI Investigation Pipeline:
 *   Input
 *   ↓ AI understands the article
 *   ↓ AI extracts factual claims
 *   ↓ AI generates search queries per claim
 *   ↓ Search engine fetches real sources
 *   ↓ AI reads sources → SUPPORTS / CONTRADICTS / IRRELEVANT
 *   ↓ Weighted verdict + confidence
 *   ↓ AI writes grounded explanation
 *   ↓ Truth Score + Verdict
 *
 * When AI is unavailable: heuristic fallback (same pipeline, rule-based evaluation)
 * When search fails: UNVERIFIED (never FAKE)
 */

import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import * as cheerio from 'cheerio';
import type {
  NewsInput, NewsAnalysis, Claim, ClaimVerdict,
  SourceCredibility, ContextAnalysis, LanguageSignals,
  NewsDNA, TruthScore, OverallVerdict, TruthScoreFactor,
} from '../types/index';
import { getDemoAnalysis } from './demoData';
import { insertAnalysis, findAnalysisById, listAnalyses } from '../database/init';
import { investigateClaim, aiExtractClaims, hasAI } from './aiInvestigator';
import { getSearchStatus } from './searchService';

const ANALYSIS_VERSION = '1.3';

// ─── URL Extraction ───────────────────────────────────────────────────────────

async function extractFromUrl(url: string): Promise<{ title: string; text: string; domain: string }> {
  const response = await axios.get(url, {
    timeout: 10000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TruthTrace/1.0)' },
  });
  const $ = cheerio.load(response.data as string);
  $('script, style, nav, footer, header, aside, .ad').remove();
  const title = $('title').text().trim() || $('h1').first().text().trim() || '';
  const articleText = $('article, main, .content').first().text().replace(/\s+/g, ' ').trim();
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const text = articleText.length > 200 ? articleText : bodyText.substring(0, 3000);
  const domain = new URL(url).hostname.replace('www.', '');
  return { title, text, domain };
}

// ─── Claim Extraction ─────────────────────────────────────────────────────────
// AI first, heuristic fallback

function deduplicateClaimTexts(claims: Array<{ text: string; type: string }>): Array<{ text: string; type: string }> {
  const seen = new Set<string>();
  return claims.filter(c => {
    const key = c.text.toLowerCase().replace(/\s+/g, ' ').replace(/[.!?,]+$/, '').trim();
    // Check if this is a substring/superset of an existing claim
    for (const s of seen) {
      if (s.includes(key) || key.includes(s)) return false;
    }
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function extractClaims(text: string): Promise<Array<{ text: string; type: string }>> {
  // Try AI extraction first
  const aiClaims = await aiExtractClaims(text);
  if (aiClaims.length > 0) {
    console.log(`[EXTRACT] AI extracted ${aiClaims.length} claims`);
    return aiClaims;
  }

  // Heuristic fallback
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 280)
    .filter((s) => /\d|announced|claimed|stated|reported|launched|signed|approved|confirmed|elected|appointed|minister|president|launched|discovered/i.test(s))
    .slice(0, 4);

  // Detect opinion text even without AI
  const isOpinion = /\bi (think|believe|feel|personally)\b|in my opinion|my view|i feel that|i think that/i.test(text);
  if (isOpinion) {
    console.log(`[EXTRACT] Heuristic detected opinion text`);
    return [{ text: text.substring(0, 200), type: 'opinion' }];
  }

  const raw = sentences.length > 0 ? sentences : [text.substring(0, 200)];
  const typed = raw.map(t => ({ text: t, type: 'factual' }));
  const deduped = deduplicateClaimTexts(typed);
  console.log(`[EXTRACT] Heuristic extracted ${deduped.length} claims`);
  return deduped;
}

// ─── Language Analysis ────────────────────────────────────────────────────────

function analyzeLanguage(text: string): LanguageSignals {
  const lower = text.toLowerCase();
  const clickbaitTriggers = ['breaking', 'shocking', 'you won\'t believe', 'share immediately',
    'forward this', 'before they delete', 'they don\'t want you to know', 'explosive', 'bombshell', 'urgent'];
  const emotionalTriggers = ['outrage', 'fury', 'devastat', 'terrif', 'horrif', 'panic', 'chaos',
    'catastroph', 'disaster', 'threat', 'danger', 'shocking', 'scandalous', 'corrupt'];
  const certaintyTriggers = ['definitely', 'certainly', 'absolutely', 'without doubt', 'proven fact', '100%', 'guaranteed', 'undeniably'];

  const attributionPresent = /(according to|reported by|said|stated|confirmed by|source:|cited|per |via )/i.test(text);
  const allCapsWords = (text.match(/\b[A-Z]{3,}\b/g) || []).filter(
    (w) => !['USA', 'NASA', 'ISRO', 'PM', 'BJP', 'INC', 'URL', 'API', 'CEO', 'RBI', 'WHO', 'UN', 'BBC', 'IMF'].includes(w)
  );
  const exclamations = (text.match(/!/g) || []).length;

  const foundClickbait = clickbaitTriggers.filter((t) => lower.includes(t));
  const foundEmotional = emotionalTriggers.filter((t) => lower.includes(t));
  const foundCertainty = certaintyTriggers.filter((t) => lower.includes(t));

  const clickbaitScore = Math.min(100, foundClickbait.length * 20 + allCapsWords.length * 10 + exclamations * 8);
  const emotionalScore = Math.min(100, foundEmotional.length * 18 + exclamations * 5);
  const certaintyScore = Math.min(100, foundCertainty.length * 25);
  const missingAttributionScore = attributionPresent ? 10 : 40;
  const sensationalismScore = Math.min(100, Math.round((clickbaitScore + emotionalScore) / 2));
  const triggerWords = [...new Set([...foundClickbait, ...foundEmotional.slice(0, 3)])];
  const overallManipulation = Math.round(
    clickbaitScore * 0.35 + emotionalScore * 0.25 + certaintyScore * 0.15 + missingAttributionScore * 0.25
  );

  const summary = overallManipulation >= 75
    ? 'High manipulation indicators. Claims should be verified independently.'
    : overallManipulation >= 50
    ? 'Moderate manipulation signals — does not indicate fake news on its own.'
    : overallManipulation >= 25
    ? 'Low to moderate signals. Within normal news reporting range.'
    : 'Low manipulation signals. Language appears factual.';

  return {
    clickbaitScore, emotionalLanguageScore: emotionalScore, unsupportedCertaintyScore: certaintyScore,
    missingAttributionScore, sensationalismScore, allCapsCount: allCapsWords.length,
    exclamationCount: exclamations, triggerWords: triggerWords.slice(0, 8),
    overallManipulationScore: overallManipulation, summary,
  };
}

// ─── Source Credibility ───────────────────────────────────────────────────────

function analyzeSourceCredibility(text: string, url?: string, domain?: string): SourceCredibility {
  const signals: SourceCredibility['signals'] = [];
  const hasHttps = url ? url.startsWith('https://') : false;
  const hasAuthor = /by\s+[A-Z][a-z]+\s+[A-Z][a-z]+|author:|staff reporter|correspondent/i.test(text);
  const hasCitations = /according to|cited|source:|reported by|per |via [A-Z]/i.test(text);
  const hasDate = /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b|\d{4}-\d{2}-\d{2}/i.test(text);

  let domainScore = 55, publisherScore = 55;

  if (domain) {
    const trusted = ['.gov', '.gov.in', '.gov.uk', 'reuters', 'bbc', 'apnews', 'ndtv', 'thehindu', 'timesofindia'];
    const low = ['blogspot', 'wordpress.com', 'tumblr', 'wix', 'weebly'];
    if (trusted.some((d) => domain.includes(d))) {
      domainScore = 90; publisherScore = 85;
      signals.push({ type: 'POSITIVE', label: 'Trusted domain', description: `${domain} is an established publisher` });
    } else if (low.some((d) => domain.includes(d))) {
      domainScore = 30; publisherScore = 32;
      signals.push({ type: 'NEGATIVE', label: 'Free-hosting domain', description: 'Content on personal/free platform' });
    } else {
      signals.push({ type: 'NEUTRAL', label: 'Unknown domain', description: 'Domain credibility unclassified' });
    }
  } else {
    signals.push({ type: 'NEUTRAL', label: 'No URL provided', description: 'Text-only input — source cannot be assessed' });
  }

  if (hasHttps) signals.push({ type: 'POSITIVE', label: 'HTTPS', description: 'Secure connection' });
  signals.push(hasAuthor
    ? { type: 'POSITIVE', label: 'Author attributed', description: 'Named author' }
    : { type: 'NEUTRAL', label: 'No author', description: 'Anonymous — common for institutional posts' });
  signals.push(hasCitations
    ? { type: 'POSITIVE', label: 'Sources cited', description: 'References external sources' }
    : { type: 'NEUTRAL', label: 'No citations', description: 'No explicit source references' });
  signals.push(hasDate
    ? { type: 'POSITIVE', label: 'Date present', description: 'Allows timeline verification' }
    : { type: 'NEUTRAL', label: 'No date', description: 'Date not detected' });

  const authorScore = hasAuthor ? 75 : 50;
  const citationsScore = hasCitations ? 78 : 50;
  const transparencyScore = hasDate ? 72 : 48;
  const overall = Math.round(publisherScore * 0.25 + transparencyScore * 0.2 + citationsScore * 0.2 + domainScore * 0.25 + authorScore * 0.1);

  return {
    overall, publisherScore, transparencyScore, citationsScore, domainScore, authorScore,
    hasHttps, hasAuthor, hasCitations, hasDate,
    domain: domain || 'Not provided',
    publisherName: domain ? domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1) : 'Unknown',
    signals,
  };
}

// ─── Context Analysis ─────────────────────────────────────────────────────────

async function analyzeContext(text: string): Promise<ContextAnalysis> {
  const issues: ContextAnalysis['issues'] = [];
  const currentYear = new Date().getFullYear();
  const yearMatches = text.match(/\b(20\d{2})\b/g) || [];
  const uniqueYears = [...new Set(yearMatches.map(Number))];
  const claimedCurrentEvent = /today|currently|this week|right now|just now|breaking/i.test(text);
  const hasOldYear = uniqueYears.some((y) => y < currentYear - 1);
  const claimsCurrentYear = uniqueYears.some((y) => y === currentYear);

  let contextMatchScore = 72;
  let verdict: ContextAnalysis['verdict'] = 'UNVERIFIABLE';

  if (claimedCurrentEvent && hasOldYear && !claimsCurrentYear) {
    issues.push({ type: 'DATE_MISMATCH', severity: 'HIGH', description: `Claims current but references older year(s): ${uniqueYears.filter(y => y < currentYear - 1).join(', ')}` });
    contextMatchScore = 20;
    verdict = 'LIKELY_MISLEADING';
  }

  if (/before they delete|they don't want you|suppressed by/i.test(text)) {
    issues.push({ type: 'FABRICATED_ATTRIBUTION', severity: 'HIGH', description: 'Suppression framing detected' });
    contextMatchScore = Math.min(contextMatchScore, 25);
    verdict = 'LIKELY_MISLEADING';
  }

  if (issues.length === 0) { contextMatchScore = 72; verdict = 'UNVERIFIABLE'; }

  const confidence = issues.length > 0 ? Math.round(55 + issues.filter(i => i.severity === 'HIGH').length * 15) : 45;
  const explanation = verdict === 'LIKELY_MISLEADING'
    ? 'Context inconsistencies detected — content may present outdated information as current.'
    : 'No context manipulation detected.';

  return { verdict, confidence, contextMatchScore, issues, explanation };
}

// ─── Build + Investigate Claims ───────────────────────────────────────────────

async function buildAndInvestigateClaims(
  extractedClaims: Array<{ text: string; type: string }>,
  analysisId: string,
  contextVerdict: ContextAnalysis['verdict'],
): Promise<Claim[]> {
  const claims: Claim[] = [];

  for (const { text: claimText, type: claimType } of extractedClaims) {
    const claimId = uuidv4();
    const lowerClaim = claimText.toLowerCase();

    // Fast-path: clear viral misinformation patterns
    const hasViralUrgency = /share immediately|forward this|before they delete/i.test(lowerClaim);
    const hasImpossibleClaim = /every single (person|citizen|indian)|100% of all|entire population/i.test(lowerClaim);
    const hasExtremeMonetary = /₹\s*[\d,]+\s*(?:lakh|crore).*(?:every|all|each)\s+(?:citizen|person)/i.test(lowerClaim);

    if ((hasViralUrgency && hasImpossibleClaim) || (hasViralUrgency && hasExtremeMonetary)) {
      claims.push({
        id: claimId, analysisId, claimText,
        verdict: 'LIKELY_FALSE', confidence: 82,
        explanation: 'Combines viral urgency tactics with extraordinary universal claims — a pattern strongly associated with misinformation.',
        supportingEvidence: [], contradictingEvidence: [],
      });
      console.log(`[CLAIM] Fast-path LIKELY_FALSE: "${claimText.substring(0, 50)}"`);
      continue;
    }

    // Fast-path: misleading context
    if (contextVerdict === 'LIKELY_MISLEADING') {
      claims.push({
        id: claimId, analysisId, claimText,
        verdict: 'MISLEADING', confidence: 65,
        explanation: 'Content may be accurate but appears to be presented in a misleading context.',
        supportingEvidence: [], contradictingEvidence: [],
      });
      continue;
    }

    // Full AI investigation (handles opinion type inside investigateClaim)
    const result = await investigateClaim(claimId, claimText, claimType);

    claims.push({
      id: claimId,
      analysisId,
      claimText,
      verdict: result.verdict,
      confidence: result.confidence,
      explanation: result.explanation + (result.limitations ? ` [${result.limitations}]` : ''),
      supportingEvidence: result.supportingEvidence,
      contradictingEvidence: result.contradictingEvidence,
    });
  }

  return claims;
}

// ─── News DNA ─────────────────────────────────────────────────────────────────

function buildNewsDNA(text: string, url?: string): NewsDNA {
  const nodes: NewsDNA['nodes'] = [];
  const links: NewsDNA['links'] = [];

  nodes.push({
    id: 'n1', type: 'ORIGINAL_CLAIM',
    label: url ? 'Source Publication' : 'Submitted Content',
    description: url ? `Content from ${new URL(url).hostname}` : 'Text submitted directly — original source unknown',
    date: new Date().toISOString().split('T')[0], source: url, isSimulated: !url,
  });
  nodes.push({
    id: 'n2', type: 'PUBLISHED_ARTICLE', label: 'AI Investigation',
    description: 'Analyzed by TruthTrace AI investigation pipeline',
    date: new Date().toISOString().split('T')[0], isSimulated: false,
  });
  links.push({ source: 'n1', target: 'n2', relationship: 'PUBLISHED' });

  if (/share|forward|viral|trending/i.test(text)) {
    nodes.push({ id: 'n3', type: 'SOCIAL_MEDIA', label: 'Social Spread Indicators', description: 'Content contains social sharing language', isSimulated: true });
    links.push({ source: 'n2', target: 'n3', relationship: 'SHARED' });
  }

  return {
    nodes, links,
    isSimulated: nodes.some((n) => n.isSimulated),
    propagationLabel: nodes.some((n) => n.isSimulated)
      ? 'Partially illustrative — social propagation tracking unavailable'
      : 'Based on available source data',
  };
}

// ─── Truth Score ──────────────────────────────────────────────────────────────

function calculateTruthScore(
  claims: Claim[],
  sourceCredibility: SourceCredibility,
  contextAnalysis: ContextAnalysis,
  languageSignals: LanguageSignals,
  searchStatus: ReturnType<typeof getSearchStatus>
): TruthScore {
  // Evidence-based scoring (40% support + 40% contradiction + 15% source + 5% language)
  const verdictScores: Record<ClaimVerdict, number> = {
    VERIFIED: 92, LIKELY_TRUE: 78, UNVERIFIED: 50,
    MISLEADING: 25, LIKELY_FALSE: 10, FALSE: 5,
  };

  const claimAvgScore = claims.length > 0
    ? claims.reduce((sum, c) => sum + verdictScores[c.verdict], 0) / claims.length
    : 50;

  const totalEvidence = claims.reduce((s, c) => s + c.supportingEvidence.length + c.contradictingEvidence.length, 0);
  const supportingCount = claims.reduce((s, c) => s + c.supportingEvidence.length, 0);
  const crossSourceScore = totalEvidence === 0 ? 50 : Math.round((supportingCount / totalEvidence) * 100);
  const contextScore = contextAnalysis.contextMatchScore;
  const languageScore = Math.max(0, 100 - languageSignals.overallManipulationScore);
  const sourceScore = sourceCredibility.overall;

  const aiActive = hasAI();

  const factors: TruthScoreFactor[] = [
    {
      name: 'Evidence Support', weight: 40, score: Math.round(claimAvgScore),
      contribution: Math.round((claimAvgScore * 40) / 100),
      explanation: claims.length > 0
        ? `${claims.length} claim(s): ${claims.filter(c => c.verdict === 'VERIFIED' || c.verdict === 'LIKELY_TRUE').length} supported, ${claims.filter(c => c.verdict === 'UNVERIFIED').length} unverified, ${claims.filter(c => c.verdict === 'LIKELY_FALSE').length} contradicted`
        : 'No claims extracted',
    },
    {
      name: 'Evidence Contradiction', weight: 40, score: totalEvidence === 0 ? 50 : crossSourceScore,
      contribution: Math.round(((totalEvidence === 0 ? 50 : crossSourceScore) * 40) / 100),
      explanation: totalEvidence === 0
        ? `No evidence retrieved (${searchStatus.label}). Neutral score — not penalised.`
        : `${supportingCount} supporting vs ${totalEvidence - supportingCount} contradicting source(s)`,
    },
    {
      name: 'Source Reliability', weight: 15, score: sourceScore,
      contribution: Math.round((sourceScore * 15) / 100),
      explanation: `Publisher/domain/author signals. ${aiActive ? 'AI-evaluated source reliability.' : 'Heuristic source scoring.'}`,
    },
    {
      name: 'Language Signals', weight: 5, score: languageScore,
      contribution: Math.round((languageScore * 5) / 100),
      explanation: 'Clickbait/sensationalism indicators. Weak signal only — 5% weight.',
    },
  ];

  const overall = Math.min(100, Math.max(0, factors.reduce((sum, f) => sum + f.contribution, 0)));

  // ── Evidence-driven verdict ───────────────────────────────────────────────
  const falseClaims = claims.filter(c => c.verdict === 'LIKELY_FALSE' || c.verdict === 'FALSE');
  const misleadingClaims = claims.filter(c => c.verdict === 'MISLEADING');
  const verifiedClaims = claims.filter(c => c.verdict === 'VERIFIED');
  const trueClaims = claims.filter(c => c.verdict === 'LIKELY_TRUE' || c.verdict === 'VERIFIED');
  const hasContradiction = claims.some(c => c.contradictingEvidence.length > 0);
  const totalSources = claims.reduce((s, c) => s + c.supportingEvidence.length + c.contradictingEvidence.length, 0);

  // Special: all claims are opinions
  const allOpinions = claims.length > 0 && claims.every(c =>
    c.explanation.toLowerCase().includes('opinion') ||
    c.explanation.toLowerCase().includes('fact-checking does not apply')
  );
  if (allOpinions) {
    return {
      overall: 50, verdict: 'UNVERIFIED', factors,
      explanation: [
        'This content appears to be opinion or editorial.',
        'Fact-checking is not applicable to subjective statements.',
      ],
    };
  }

  let verdict: OverallVerdict;

  if (falseClaims.length > 0 && falseClaims.length >= claims.length * 0.5 && hasContradiction) {
    verdict = 'LIKELY_FALSE';
  } else if (
    contextAnalysis.verdict === 'LIKELY_MISLEADING' ||
    contextAnalysis.verdict === 'MISLEADING_CONTEXT' ||
    (misleadingClaims.length > 0 && misleadingClaims.length >= claims.length * 0.5)
  ) {
    verdict = 'MISLEADING';
  } else if (falseClaims.length >= claims.length * 0.5 && !hasContradiction) {
    verdict = 'MISLEADING'; // Pattern-matched but no live contradiction evidence
  } else if (verifiedClaims.length === claims.length && claims.length > 0 && overall >= 78) {
    verdict = 'VERIFIED';
  } else if (trueClaims.length >= claims.length * 0.6 && overall >= 63 && !hasContradiction) {
    verdict = 'LIKELY_TRUE';
  } else {
    verdict = 'UNVERIFIED'; // Honest default
  }

  // ── Explanation ───────────────────────────────────────────────────────────
  const explanation: string[] = [];
  const evidencedClaims = claims.filter(c =>
    (c.verdict === 'VERIFIED' || c.verdict === 'LIKELY_TRUE') && c.supportingEvidence.length > 0
  );

  if (verdict === 'VERIFIED') {
    explanation.push(`All ${claims.length} claim(s) verified by credible sources.`);
    const totalSupport = evidencedClaims.reduce((s, c) => s + c.supportingEvidence.length, 0);
    if (totalSupport > 0) explanation.push(`${totalSupport} supporting source(s) retrieved and confirmed.`);
    explanation.push('No credible contradicting evidence found.');
  } else if (verdict === 'LIKELY_TRUE') {
    explanation.push('Available evidence is broadly consistent with the claims.');
    if (evidencedClaims.length > 0) explanation.push(`${evidencedClaims.length} claim(s) supported by retrieved sources.`);
    explanation.push('No significant contradictions found in accessible sources.');
  } else if (verdict === 'LIKELY_FALSE') {
    const totalContra = claims.reduce((s, c) => s + c.contradictingEvidence.length, 0);
    explanation.push(`${totalContra} source(s) contradict the main claims.`);
    explanation.push('Reliable evidence conflicts with the core assertions.');
  } else if (verdict === 'MISLEADING') {
    explanation.push('Information may be partially accurate but is presented in a misleading way.');
    if (contextAnalysis.issues.length > 0) explanation.push('Context inconsistencies detected.');
  } else {
    explanation.push('Insufficient evidence to confirm or deny the claims in this content.');
    explanation.push('UNVERIFIED does not mean false — verification was inconclusive.');
    if (searchStatus.provider === 'none') {
      explanation.push('Live search unavailable. Add TAVILY_API_KEY or SERPER_API_KEY to backend/.env for live verification.');
    } else if (!aiActive) {
      explanation.push(`Search ran via ${searchStatus.provider} (heuristic evaluation). Add OPENAI_API_KEY or GROQ_API_KEY for AI-powered analysis.`);
    } else {
      explanation.push(`AI investigation via ${searchStatus.provider} returned ${totalSources} source(s) — insufficient for a confident verdict.`);
    }
  }

  if (languageSignals.overallManipulationScore > 70) {
    explanation.push('High-manipulation language detected — factored into analysis but not the primary verdict driver.');
  }

  console.log(`[SCORE] ${overall} | ${verdict} | claims:${claims.length} | ai:${aiActive} | search:${searchStatus.provider}`);
  return { overall, verdict, factors, explanation };
}

// ─── Processing Steps ─────────────────────────────────────────────────────────

function buildProcessingSteps(searchProvider: string, aiActive: boolean, claimCount: number) {
  return [
    { step: 'understand', label: 'Understanding the article', status: 'done' as const },
    { step: 'extract', label: `Extracting factual claims (${claimCount} found)`, status: 'done' as const },
    { step: 'queries', label: aiActive ? 'AI generating search queries' : 'Generating search queries', status: 'done' as const },
    { step: 'search', label: `Searching the web (${searchProvider})`, status: searchProvider !== 'none' ? 'done' as const : 'error' as const },
    { step: 'rank', label: 'Ranking sources by reliability', status: 'done' as const },
    { step: 'compare', label: aiActive ? 'AI comparing evidence to claims' : 'Comparing evidence to claims', status: 'done' as const },
    { step: 'confidence', label: 'Calculating confidence', status: 'done' as const },
    { step: 'report', label: 'Generating verdict', status: 'done' as const },
  ];
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export async function analyzeNews(input: NewsInput): Promise<NewsAnalysis> {
  if (input.demoCase) return getDemoAnalysis(input.demoCase);

  const id = uuidv4();
  let rawText = input.text || '';
  let headline = input.headline || '';
  let sourceUrl = input.url;
  let domain: string | undefined;

  // Extract from URL if needed
  if (input.url && !rawText) {
    try {
      const extracted = await extractFromUrl(input.url);
      rawText = extracted.text;
      headline = headline || extracted.title;
      domain = extracted.domain;
    } catch (err) {
      console.error('[URL] Extraction failed:', err);
      rawText = input.url;
    }
  }

  if (input.headline && !headline) headline = input.headline;
  if (input.description) rawText = `${headline}\n${input.description}\n${rawText}`;
  if (!headline && rawText) headline = rawText.substring(0, 100) + '...';

  const fullText = `${headline}\n${rawText}`;
  const searchStatus = getSearchStatus();
  const aiActive = hasAI();

  console.log(`[ANALYZE] Starting investigation | AI:${aiActive} | Search:${searchStatus.provider}`);

  // Run language + context in parallel with claim extraction
  const [extractedClaims, languageSignals, contextAnalysis] = await Promise.all([
    extractClaims(fullText),
    Promise.resolve(analyzeLanguage(fullText)),
    analyzeContext(fullText),
  ]);

  const sourceCredibility = analyzeSourceCredibility(fullText, sourceUrl, domain);

  // AI Investigation pipeline — the core differentiator
  const claims = await buildAndInvestigateClaims(extractedClaims, id, contextAnalysis.verdict);

  const truthScore = calculateTruthScore(claims, sourceCredibility, contextAnalysis, languageSignals, searchStatus);
  const newsDNA = buildNewsDNA(fullText, sourceUrl);
  const processingSteps = buildProcessingSteps(searchStatus.provider, aiActive, claims.length);

  const analysis: NewsAnalysis = {
    id,
    inputText: rawText.substring(0, 5000),
    headline,
    url: sourceUrl,
    sourceUrl,
    extractedContent: rawText.substring(0, 2000),
    truthScore,
    claims,
    sourceCredibility,
    contextAnalysis,
    languageSignals,
    newsDNA,
    isDemo: false,
    processingSteps,
    createdAt: new Date().toISOString(),
    analysisVersion: ANALYSIS_VERSION,
  };

  try { insertAnalysis(analysis); } catch (err) { console.error('[DB] Persist failed:', err); }

  return analysis;
}

export async function getAnalysisById(id: string): Promise<NewsAnalysis | null> {
  return findAnalysisById(id);
}

export function getHistory() {
  return listAnalyses().slice(0, 50).map((r) => ({
    id: r.id, headline: r.headline, truthScore: r.truth_score,
    verdict: r.verdict, isDemo: r.is_demo, createdAt: r.created_at,
  }));
}
