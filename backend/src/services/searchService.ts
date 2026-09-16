/**
 * TruthTrace Search Service — v1.4
 *
 * Provider priority:
 *   1. Tavily  (TAVILY_API_KEY)  — best for AI fact-checking
 *   2. Serper  (SERPER_API_KEY)  — Google results via API
 *   3. Wikipedia Search API     — free, no key, great for factual claims
 *   4. Wikipedia Summary API    — direct page summaries
 *
 * DuckDuckGo Instant Answer removed — it reliably returns 0 results.
 *
 * NEVER invent search results.
 * No results → UNVERIFIED (not FAKE).
 */

import axios from 'axios';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
  source?: string;
  score?: number;
}

export type SearchProvider = 'tavily' | 'serper' | 'wikipedia' | 'none';

export interface SearchStatus {
  provider: SearchProvider;
  available: boolean;
  label: string;
}

// ─── Source reliability ───────────────────────────────────────────────────────

const HIGH_RELIABILITY = [
  '.gov', '.gov.in', '.gov.uk', '.gov.au', '.nic.in',
  'pib.gov.in', 'pmo.gov.in', 'mygov.in', 'india.gov.in',
  'pmindia.gov.in', 'mha.gov.in', 'moe.gov.in',
  'un.org', 'who.int', 'worldbank.org', 'imf.org',
  'reuters.com', 'apnews.com', 'afp.com', 'bloomberg.com',
  'thehindu.com', 'ndtv.com', 'timesofindia.com', 'indianexpress.com',
  'hindustantimes.com', 'theprint.in', 'scroll.in',
  'bbc.com', 'bbc.co.uk', 'theguardian.com', 'nytimes.com',
  'washingtonpost.com', 'britannica.com', 'wikipedia.org',
  'altnews.in', 'boomlive.in', 'snopes.com', 'factcheck.org',
  'nature.com', 'sciencedirect.com',
];

const MEDIUM_RELIABILITY = [
  'medium.com', 'firstpost.com', 'news18.com', 'indiatoday.in',
  'livemint.com', 'business-standard.com', 'moneycontrol.com',
  'deccanherald.com', 'zeenews.india.com',
];

export function rateSourceReliability(url: string): 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN' {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    if (HIGH_RELIABILITY.some(d => hostname.includes(d) || hostname.endsWith(d))) return 'HIGH';
    if (MEDIUM_RELIABILITY.some(d => hostname.includes(d))) return 'MEDIUM';
    if (hostname.endsWith('.edu') || hostname.endsWith('.ac.in') || hostname.endsWith('.ac.uk')) return 'HIGH';
    if (hostname.endsWith('.org')) return 'MEDIUM';
    return 'LOW';
  } catch { return 'UNKNOWN'; }
}

// ─── Provider: Tavily ─────────────────────────────────────────────────────────

async function searchTavily(query: string): Promise<SearchResult[]> {
  if (!process.env.TAVILY_API_KEY) return [];
  const res = await axios.post(
    'https://api.tavily.com/search',
    { api_key: process.env.TAVILY_API_KEY, query, search_depth: 'basic', max_results: 6 },
    { timeout: 12000 }
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (res.data.results || []).map((r: any) => ({
    title: String(r.title || ''),
    url: String(r.url || ''),
    snippet: String(r.content || r.snippet || ''),
    publishedDate: r.published_date,
    source: r.source,
    score: r.score,
  })).filter((r: SearchResult) => r.url && r.snippet);
}

// ─── Provider: Serper ────────────────────────────────────────────────────────

async function searchSerper(query: string): Promise<SearchResult[]> {
  if (!process.env.SERPER_API_KEY) return [];
  const res = await axios.post(
    'https://google.serper.dev/search',
    { q: query, num: 6 },
    { headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' }, timeout: 12000 }
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((res.data.organic || []) as any[])
    .map(r => ({
      title: String(r.title || ''),
      url: String(r.link || ''),
      snippet: String(r.snippet || ''),
      publishedDate: r.date,
      source: r.displayLink,
    }))
    .filter(r => r.url && r.snippet);
}

// ─── Provider: Wikipedia Search + Summary (free, no key) ─────────────────────

async function searchWikipedia(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  try {
    // 1. Wikipedia search API — find relevant articles
    const encoded = encodeURIComponent(query);
    const searchRes = await axios.get(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&format=json&srlimit=4&srprop=snippet|titlesnippet`,
      { timeout: 8000, headers: { 'User-Agent': 'TruthTrace/1.0 (fact-checking tool)' } }
    );

    const hits = searchRes.data?.query?.search || [];
    console.log(`[WIKI] Query: "${query.substring(0, 60)}" → ${hits.length} results`);

    for (const hit of hits.slice(0, 4)) {
      // Clean HTML tags from snippet
      const cleanSnippet = String(hit.snippet || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
      const title = String(hit.title || '');
      const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

      if (cleanSnippet.length > 20) {
        results.push({ title, url, snippet: cleanSnippet, source: 'Wikipedia' });
      }
    }

    // 2. Also try to get a direct summary for the top result
    if (hits.length > 0) {
      try {
        const topTitle = encodeURIComponent(hits[0].title.replace(/ /g, '_'));
        const summaryRes = await axios.get(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${topTitle}`,
          { timeout: 6000, headers: { 'User-Agent': 'TruthTrace/1.0' } }
        );
        if (summaryRes.data?.extract && summaryRes.data?.content_urls?.desktop?.page) {
          // Add or enrich the top result with full summary
          const summaryResult: SearchResult = {
            title: String(summaryRes.data.title || hits[0].title),
            url: String(summaryRes.data.content_urls.desktop.page),
            snippet: String(summaryRes.data.extract).substring(0, 500),
            source: 'Wikipedia',
          };
          // Replace or add
          if (results.length > 0 && results[0].title === summaryResult.title) {
            results[0] = summaryResult; // enrich with full extract
          } else {
            results.unshift(summaryResult);
          }
        }
      } catch { /* summary fetch failed, keep search results */ }
    }

  } catch (e) {
    console.warn('[WIKI] Search failed:', (e as Error).message);
  }

  return results;
}

// ─── Main search with provider fallback ──────────────────────────────────────

export async function search(query: string): Promise<{ results: SearchResult[]; provider: SearchProvider }> {
  // 1. Tavily
  if (process.env.TAVILY_API_KEY) {
    try {
      const results = await searchTavily(query);
      if (results.length > 0) {
        console.log(`[SEARCH] Tavily "${query.substring(0, 50)}" → ${results.length} results`);
        return { results, provider: 'tavily' };
      }
    } catch (e) { console.warn('[SEARCH] Tavily failed:', (e as Error).message); }
  }

  // 2. Serper
  if (process.env.SERPER_API_KEY) {
    try {
      const results = await searchSerper(query);
      if (results.length > 0) {
        console.log(`[SEARCH] Serper "${query.substring(0, 50)}" → ${results.length} results`);
        return { results, provider: 'serper' };
      }
    } catch (e) { console.warn('[SEARCH] Serper failed:', (e as Error).message); }
  }

  // 3. Wikipedia (always try — free, reliable, great for factual claims)
  try {
    const results = await searchWikipedia(query);
    if (results.length > 0) {
      console.log(`[SEARCH] Wikipedia "${query.substring(0, 50)}" → ${results.length} results`);
      return { results, provider: 'wikipedia' };
    }
  } catch (e) { console.warn('[SEARCH] Wikipedia failed:', (e as Error).message); }

  console.log(`[SEARCH] All providers returned 0 results for: "${query.substring(0, 60)}"`);
  return { results: [], provider: 'none' };
}

// ─── Status ───────────────────────────────────────────────────────────────────

export function getSearchStatus(): SearchStatus {
  if (process.env.TAVILY_API_KEY) return { provider: 'tavily', available: true, label: '● Live verification (Tavily)' };
  if (process.env.SERPER_API_KEY) return { provider: 'serper', available: true, label: '● Live verification (Serper/Google)' };
  return { provider: 'wikipedia', available: true, label: '● Wikipedia verification (free)' };
}
