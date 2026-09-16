import type { ClaimVerdict, OverallVerdict } from '../types';

export function getVerdictColor(verdict: ClaimVerdict | OverallVerdict): string {
  switch (verdict) {
    case 'VERIFIED': return 'text-emerald-400';
    case 'LIKELY_TRUE': return 'text-green-400';
    case 'UNVERIFIED': return 'text-yellow-400';
    case 'INSUFFICIENT_EVIDENCE': return 'text-amber-400';
    case 'MISLEADING': return 'text-orange-400';
    case 'LIKELY_FALSE': return 'text-red-400';
    case 'FALSE': return 'text-red-500';
    default: return 'text-slate-400';
  }
}

export function getVerdictBg(verdict: ClaimVerdict | OverallVerdict): string {
  switch (verdict) {
    case 'VERIFIED': return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
    case 'LIKELY_TRUE': return 'bg-green-500/15 text-green-300 border border-green-500/30';
    case 'UNVERIFIED': return 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30';
    case 'INSUFFICIENT_EVIDENCE': return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
    case 'MISLEADING': return 'bg-orange-500/15 text-orange-300 border border-orange-500/30';
    case 'LIKELY_FALSE': return 'bg-red-500/15 text-red-300 border border-red-500/30';
    case 'FALSE': return 'bg-red-600/20 text-red-300 border border-red-600/40';
    default: return 'bg-slate-500/15 text-slate-300 border border-slate-500/30';
  }
}

export function getVerdictLabel(verdict: ClaimVerdict | OverallVerdict): string {
  switch (verdict) {
    case 'VERIFIED': return 'Verified';
    case 'LIKELY_TRUE': return 'Likely True';
    case 'UNVERIFIED': return 'Unverified';
    case 'INSUFFICIENT_EVIDENCE': return 'Insufficient Evidence';
    case 'MISLEADING': return 'Misleading';
    case 'LIKELY_FALSE': return 'Likely False';
    case 'FALSE': return 'False';
    default: return verdict;
  }
}

export function getScoreColor(score: number): string {
  if (score >= 75) return '#10b981'; // emerald
  if (score >= 55) return '#84cc16'; // lime
  if (score >= 40) return '#f59e0b'; // amber
  if (score >= 25) return '#f97316'; // orange
  return '#ef4444'; // red
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Likely True';
  if (score >= 65) return 'Probably Accurate';
  if (score >= 45) return 'Unverified';
  if (score >= 30) return 'Likely Misleading';
  return 'Likely False';
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
