/**
 * TruthTrace AI Investigator — v1.4
 *
 * AI acts as investigator, not classifier:
 *   1. AI extracts factual claims (deduplicated)
 *   2. AI generates focused search queries per claim
 *   3. Search retrieves real sources (Wikipedia + Tavily/Serper)
 *   4. AI reads sources → SUPPORTS / CONTRADICTS / IRRELEVANT
 *   5. Evidence weights → verdict + confidence
 *   6. AI writes grounded explanation
 *
 * Without AI: heuristic fallback (same structure, rule-based evaluation)
 * No evidence → UNVERIFIED. Never FAKE for missing evidence.
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { search, rateSourceReliability, type SearchResult } from './searchService';
import { evaluateResultsHeuristic, deriveClaimVerdict } from './claimVerifier';
import type { Evidence, ClaimVerdict } from '../types/index';

// ─── AI caller ────────────────────────────────────────────────────────────────

async function callAI(prompt: string, system?: string): Promise<string | null> {
  const messages = system
    ? [{ role: 'system', content: system }, { role: 'user', content: prompt }]
    : [{ role: 'user', content: prompt }];

  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        { model: 'gpt-4o-mini', messages, max_tokens: 2000, temperature: 0.1 },
        { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 30000 }
      );
      return res.data.choices?.[0]?.message?.content || null;
    } catch (e) { console.warn('[AI] OpenAI failed:', (e as Error).message); }
  }

  if (process.env.GROQ_API_KEY) {
    try {
      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        { model: 'llama3-8b-8192', messages, max_tokens: 2000, temperature: 0.1 },
        { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 30000 }
      );
      return res.data.choices?.[0]?.message?.content || null;
    } catch (e) { console.warn('[AI] Groq failed:', (e as Error).message); }
  }

  return null;
}

export function hasAI(): boolean {
  return !!(process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY);
}

// ─── Claim deduplication ──────────────────────────────────────────────────────

function deduplicateClaims<T extends { text: string }>(claims: T[]): T[] {
  const seen = new Set<string>();
  return claims.filter(c => {
    // Normalize: lowercase, collapse whitespace, trim punctuation
    const key = c.text.toLowerCase().replace(/\s+/g, ' ').replace(/[.!?,]+$/, '').trim();
    // Also check if one claim is a substring of another (duplicate with extra words)
    for (const s of seen) {
      if (s.includes(key) || key.includes(s)) return false;
    }
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Step 1: AI claim extraction ─────────────────────────────────────────────

export interface ExtractedClaim {
  text: string;
  type: 'factual' | 'opinion' | 'satire' | 'prediction';
}

export async function aiExtractClaims(articleText: string): Promise<ExtractedClaim[]> {
  if (!hasAI()) return [];

  const prompt = `Extract the most important FACTUAL claims from this news text.

Return ONLY valid JSON:
{
  "claims": [
    { "text": "exact factual claim", "type": "factual" },
    { "text": "opinion statement", "type": "opinion" }
  ]
}

Rules:
- Extract 2-4 distinct factual claims
- Mark opinions/beliefs as type "opinion" (e.g. "I think...", "In my view...")
- Do NOT duplicate claims or create variations of the same claim
- Do NOT append article context to the claim — keep claims self-contained
- Each claim must be independently verifiable

Article:
"${articleText.substring(0, 2000)}"`;

  const response = await callAI(
    prompt,
    'You are a precise fact-checking assistant. Return ONLY valid JSON. No markdown, no explanation.'
  );

  if (!response) return [];

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];
    const parsed = JSON.parse(jsonMatch[0]) as { claims: ExtractedClaim[] };
    if (!Array.isArray(parsed.claims)) return [];

    const valid = parsed.claims
      .filter(c => c.text && typeof c.text === 'string' && c.text.length > 10)
      .map(c => ({ text: c.text.trim(), type: c.type || 'factual' }));

    const deduped = deduplicateClaims(valid);
    console.log(`[AI EXTRACT] ${valid.length} claims → ${deduped.length} after dedup`);
    return deduped.slice(0, 5);
  } catch (e) {
    console.warn('[AI] Claim extraction parse failed:', e);
    return [];
  }
}

// ─── Step 2: AI search query generation ──────────────────────────────────────

export async function aiGenerateSearchQueries(claim: string): Promise<string[]> {
  if (!hasAI()) {
    // Heuristic fallback
    const clean = claim.replace(/["""'']/g, '').trim();
    const queries: string[] = [clean.substring(0, 110)];
    const words = clean.split(' ');
    if (words.length > 6) queries.push(words.slice(0, 6).join(' '));
    if (/current|today|latest|now|recently/i.test(clean)) {
      queries.push(`latest ${words.slice(0, 5).join(' ')}`);
    }
    return [...new Set(queries)];
  }

  const prompt = `Generate 2-4 web search queries to find evidence for this factual claim.

Claim: "${claim}"

Rules:
- Each query must help find authoritative sources
- Include one query targeting official/government sources if relevant
- For claims about people/roles, search "current [role] [name]" and "[name] official"
- For scientific facts, search authoritative science sources
- Keep queries concise (under 10 words each)
- Do NOT assume claim is true or false in the queries

Return ONLY a JSON array:
["query 1", "query 2", "query 3"]`;

  const response = await callAI(prompt);
  if (!response) return [claim.substring(0, 110)];

  try {
    const match = response.match(/\[[\s\S]*\]/);
    if (match) {
      const queries = JSON.parse(match[0]) as string[];
      if (Array.isArray(queries) && queries.length > 0) {
        const valid = queries.filter(q => typeof q === 'string' && q.trim().length > 3).slice(0, 4);
        if (valid.length > 0) {
          console.log(`[AI QUERIES] ${valid.length} queries for: "${claim.substring(0, 50)}"`);
          return valid;
        }
      }
    }
  } catch (e) { console.warn('[AI] Query generation failed:', e); }

  return [claim.substring(0, 110)];
}

// ─── Step 3: AI evidence analysis ────────────────────────────────────────────

interface AISourceResult {
  url: string;
  classification: 'SUPPORTS' | 'CONTRADICTS' | 'IRRELEVANT';
  reason: string;
  reliability: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface AIEvidenceAnalysis {
  claim: string;
  classification: 'verified' | 'likely_true' | 'unverified' | 'misleading' | 'likely_false' | 'opinion';
  confidence: number;
  supportingEvidence: AISourceResult[];
  contradictingEvidence: AISourceResult[];
  explanation: string;
  limitations: string;
}

export async function aiAnalyzeEvidence(
  claim: string,
  sources: SearchResult[]
): Promise<AIEvidenceAnalysis | null> {
  if (!hasAI() || sources.length === 0) return null;

  const sourcesText = sources.slice(0, 6).map((s, i) =>
    `SOURCE ${i + 1}:\nTitle: ${s.title}\nURL: ${s.url}\nContent: ${s.snippet.substring(0, 400)}`
  ).join('\n\n');

  const prompt = `You are a fact-checking investigator. Analyze whether these sources support or contradict the claim.

CLAIM: "${claim}"

SOURCES:
${sourcesText}

Instructions:
- Classify EACH source as SUPPORTS, CONTRADICTS, or IRRELEVANT
- Use ONLY the source content above — do NOT use outside knowledge
- A source SUPPORTS if it confirms the factual substance of the claim
- A source CONTRADICTS if it clearly denies or disproves the claim
- A source is IRRELEVANT if it does not address the claim
- Base your overall classification on the weight of evidence

Return ONLY valid JSON:
{
  "claim": "the claim",
  "classification": "verified|likely_true|unverified|misleading|likely_false|opinion",
  "confidence": 85,
  "supportingEvidence": [
    { "url": "url here", "classification": "SUPPORTS", "reason": "reason", "reliability": "HIGH" }
  ],
  "contradictingEvidence": [
    { "url": "url here", "classification": "CONTRADICTS", "reason": "reason", "reliability": "MEDIUM" }
  ],
  "explanation": "explanation based only on retrieved sources",
  "limitations": "what evidence was missing"
}

Classification rules:
- "verified": 2+ reliable sources confirm, no contradiction
- "likely_true": evidence generally supports, not conclusive
- "unverified": evidence insufficient or inconclusive
- "misleading": fact is real but context/date is wrong
- "likely_false": reliable sources directly contradict
- "opinion": subjective statement, not verifiable`;

  const response = await callAI(
    prompt,
    'You are a rigorous fact-checker. Use ONLY the provided sources. Return valid JSON only. No markdown.'
  );

  if (!response) return null;

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]) as AIEvidenceAnalysis;
    if (!parsed.classification || typeof parsed.confidence !== 'number') return null;
    // Clamp confidence
    parsed.confidence = Math.min(100, Math.max(0, Math.round(parsed.confidence)));
    return parsed;
  } catch (e) {
    console.warn('[AI] Evidence analysis parse failed:', e);
    return null;
  }
}

// ─── Convert AI result to Evidence ───────────────────────────────────────────

function toEvidence(item: AISourceResult, claimId: string, allSources: SearchResult[]): Evidence {
  const src = allSources.find(s => s.url === item.url);
  let publisherName = 'Unknown';
  try { publisherName = new URL(item.url).hostname.replace('www.', ''); } catch { /* ignore */ }
  const reliability = rateSourceReliability(item.url);

  return {
    id: uuidv4(),
    claimId,
    sourceTitle: src?.title || publisherName,
    publisher: `${publisherName} (${reliability} reliability)`,
    publisherUrl: `https://${publisherName}`,
    publicationDate: src?.publishedDate || new Date().toISOString().split('T')[0],
    url: item.url,
    excerpt: (src?.snippet || item.reason).substring(0, 300),
    relevance: item.classification === 'SUPPORTS' ? 'SUPPORTING' : 'CONTRADICTING',
    explanation: item.reason,
    isDemo: false,
  };
}

function mapVerdict(cls: string): ClaimVerdict {
  switch (cls) {
    case 'verified': return 'VERIFIED';
    case 'likely_true': return 'LIKELY_TRUE';
    case 'misleading': return 'MISLEADING';
    case 'likely_false': return 'LIKELY_FALSE';
    default: return 'UNVERIFIED';
  }
}

// ─── Main: investigate a single claim ────────────────────────────────────────

export interface AIInvestigationResult {
  claimId: string;
  verdict: ClaimVerdict;
  confidence: number;
  explanation: string;
  supportingEvidence: Evidence[];
  contradictingEvidence: Evidence[];
  searchProvider: string;
  queriesUsed: string[];
  aiPowered: boolean;
  limitations?: string;
}

export async function investigateClaim(
  claimId: string,
  claimText: string,
  claimType: string
): Promise<AIInvestigationResult> {
  const aiAvailable = hasAI();

  // Handle opinion fast-path
  if (claimType === 'opinion' || claimType === 'OPINION') {
    return {
      claimId, verdict: 'UNVERIFIED', confidence: 40,
      explanation: 'This is an opinion or subjective statement — fact-checking does not apply.',
      supportingEvidence: [], contradictingEvidence: [],
      searchProvider: 'none', queriesUsed: [],
      aiPowered: aiAvailable, limitations: 'Opinion claims are not fact-checked.',
    };
  }

  // Step 1: Generate search queries
  const queries = await aiGenerateSearchQueries(claimText);
  console.log(`[INVESTIGATE] "${claimText.substring(0, 60)}" | Queries: ${JSON.stringify(queries)}`);

  // Step 2: Search
  const allResults: SearchResult[] = [];
  let usedProvider = 'none';

  for (const query of queries) {
    if (allResults.length >= 8) break;
    try {
      const { results, provider } = await search(query);
      console.log(`[SEARCH] "${query.substring(0, 50)}" → ${results.length} results via ${provider}`);
      allResults.push(...results);
      if (provider !== 'none') usedProvider = provider;
    } catch (e) {
      console.warn('[SEARCH] Query failed:', (e as Error).message);
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const deduped = allResults.filter(r => {
    if (!r.url || seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  console.log(`[INVESTIGATE] Total sources: ${deduped.length} (provider: ${usedProvider})`);

  // Step 3: AI evidence analysis
  if (aiAvailable && deduped.length > 0) {
    const aiResult = await aiAnalyzeEvidence(claimText, deduped);

    if (aiResult) {
      const supporting = (aiResult.supportingEvidence || [])
        .filter(e => e.url && e.url.startsWith('http'))
        .slice(0, 4)
        .map(e => toEvidence(e, claimId, deduped));

      const contradicting = (aiResult.contradictingEvidence || [])
        .filter(e => e.url && e.url.startsWith('http'))
        .slice(0, 3)
        .map(e => toEvidence(e, claimId, deduped));

      const verdict = mapVerdict(aiResult.classification);

      console.log(`[AI VERDICT] "${claimText.substring(0, 50)}" → ${verdict} (${aiResult.confidence}%) | S:${supporting.length} C:${contradicting.length}`);

      return {
        claimId, verdict, confidence: aiResult.confidence,
        explanation: aiResult.explanation,
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        searchProvider: usedProvider,
        queriesUsed: queries,
        aiPowered: true,
        limitations: aiResult.limitations,
      };
    }
    console.warn('[AI] Evidence analysis returned null — falling back to heuristic');
  }

  // Step 4: Heuristic fallback
  if (deduped.length > 0) {
    const { supportingEvidence, contradictingEvidence } = evaluateResultsHeuristic(claimId, claimText, deduped);
    const { verdict, confidence, explanation } = deriveClaimVerdict(supportingEvidence, contradictingEvidence, claimType);

    console.log(`[HEURISTIC VERDICT] "${claimText.substring(0, 50)}" → ${verdict} (${confidence}%)`);

    return {
      claimId, verdict, confidence, explanation,
      supportingEvidence, contradictingEvidence,
      searchProvider: usedProvider, queriesUsed: queries,
      aiPowered: false,
      limitations: aiAvailable ? 'AI analysis failed — heuristic used' : 'AI not configured — heuristic evaluation',
    };
  }

  // Step 5: No evidence at all
  const noEvidenceMsg = usedProvider === 'none'
    ? 'Live search unavailable. Add TAVILY_API_KEY or SERPER_API_KEY to backend/.env for live verification.'
    : `Search via ${usedProvider} returned no relevant results for this claim.`;

  return {
    claimId, verdict: 'UNVERIFIED', confidence: 30,
    explanation: `No evidence found to confirm or contradict this claim. ${noEvidenceMsg}`,
    supportingEvidence: [], contradictingEvidence: [],
    searchProvider: usedProvider, queriesUsed: queries,
    aiPowered: false, limitations: noEvidenceMsg,
  };
}
