import axios from 'axios';
import type { NewsAnalysis, AnalysisHistoryItem, NewsInput } from '../types';

// In production (Vercel), use VITE_API_URL env var pointing to Railway backend.
// In development, use /api which Vite proxies to localhost:5000.
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const HEALTH_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/health`
  : '/health';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

export async function analyzeNews(input: NewsInput): Promise<NewsAnalysis> {
  const res = await api.post<{ success: boolean; data: NewsAnalysis; error?: string }>('/analyze', input);
  if (!res.data.success) throw new Error(res.data.error || 'Analysis failed');
  return res.data.data;
}

export async function getDemoAnalysis(caseNumber: 1 | 2 | 3): Promise<NewsAnalysis> {
  const res = await api.get<{ success: boolean; data: NewsAnalysis; error?: string }>(`/demo/${caseNumber}`);
  if (!res.data.success) throw new Error(res.data.error || 'Demo load failed');
  return res.data.data;
}

export async function getAnalysisById(id: string): Promise<NewsAnalysis> {
  const res = await api.get<{ success: boolean; data: NewsAnalysis; error?: string }>(`/analysis/${id}`);
  if (!res.data.success) throw new Error(res.data.error || 'Not found');
  return res.data.data;
}

export async function getHistory(): Promise<AnalysisHistoryItem[]> {
  const res = await api.get<{ success: boolean; data: AnalysisHistoryItem[] }>('/history');
  return res.data.data || [];
}

export async function clearHistory(): Promise<void> {
  await api.delete('/history');
}

export async function checkHealth(): Promise<{
  ok: boolean;
  search?: { provider: string; label: string; available: boolean };
  ai?: { configured: boolean };
}> {
  try {
    const res = await axios.get(HEALTH_URL, { timeout: 5000 });
    return { ok: res.data.status === 'ok', search: res.data.search, ai: res.data.ai };
  } catch {
    return { ok: false };
  }
}
