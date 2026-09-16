import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft, FlaskConical, ExternalLink, Info,
  Copy, Check, ChevronDown, ChevronUp,
  Search, Database, AlertCircle
} from 'lucide-react';
import { getAnalysisById, checkHealth } from '../services/api';
import type { NewsAnalysis } from '../types';
import VerdictBanner from '../components/results/VerdictBanner';
import TruthScoreGauge from '../components/results/TruthScoreGauge';
import ClaimCard from '../components/results/ClaimCard';
import SourceCredibilityPanel from '../components/results/SourceCredibilityPanel';
import ContextPanel from '../components/results/ContextPanel';
import LanguagePanel from '../components/results/LanguagePanel';
import NewsDNAPanel from '../components/results/NewsDNAPanel';
import ExplanationPanel from '../components/results/ExplanationPanel';
import ScoreFactorsChart from '../components/results/ScoreFactorsChart';

// ─── Search status badge ──────────────────────────────────────────────────────

function SearchStatusBadge({ analysisVersion }: { analysisVersion: string }) {
  const [status, setStatus] = useState<{ provider: string; label: string } | null>(null);

  useEffect(() => {
    checkHealth().then((h) => {
      if (h.search) setStatus(h.search);
    });
  }, []);

  if (!status) return null;

  const colors: Record<string, string> = {
    tavily: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    serper: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    duckduckgo: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    none: 'text-red-400 border-red-500/30 bg-red-500/10',
  };
  const cls = colors[status.provider] || 'text-slate-400 border-slate-600 bg-slate-800';

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border font-medium ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status.label}
    </span>
  );
}

// ─── Evidence coverage summary ────────────────────────────────────────────────

function EvidenceCoverage({ analysis }: { analysis: NewsAnalysis }) {
  const total = analysis.claims.length;
  if (total === 0) return null;

  const supported = analysis.claims.filter(c => c.verdict === 'VERIFIED' || c.verdict === 'LIKELY_TRUE').length;
  const unverified = analysis.claims.filter(c => c.verdict === 'UNVERIFIED').length;
  const contradicted = analysis.claims.filter(c => c.verdict === 'LIKELY_FALSE').length;
  const misleading = analysis.claims.filter(c => c.verdict === 'MISLEADING').length;
  const totalSources = analysis.claims.reduce(
    (s, c) => s + c.supportingEvidence.length + c.contradictingEvidence.length, 0
  );
  const coveragePct = total > 0 ? Math.round(((supported + contradicted) / total) * 100) : 0;

  return (
    <div className="card p-4 rounded-xl mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Database size={14} className="text-blue-400" />
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Evidence Coverage</span>
        <span className="ml-auto text-xs font-bold text-blue-300">{coveragePct}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-1.5 mb-3">
        <div
          className="h-1.5 rounded-full bg-blue-500 transition-all duration-700"
          style={{ width: `${coveragePct}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-400">{supported} supported</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="text-slate-400">{unverified} unverified</span>
        </span>
        {misleading > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            <span className="text-slate-400">{misleading} misleading</span>
          </span>
        )}
        {contradicted > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-slate-400">{contradicted} contradicted</span>
          </span>
        )}
        <span className="flex items-center gap-1.5 ml-auto">
          <Search size={11} className="text-slate-500" />
          <span className="text-slate-500">{totalSources} source{totalSources !== 1 ? 's' : ''} retrieved</span>
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [analysis, setAnalysis] = useState<NewsAnalysis | null>(
    (location.state as { analysis?: NewsAnalysis })?.analysis || null
  );
  const [loading, setLoading] = useState(!analysis);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    if (!analysis && id) {
      getAnalysisById(id)
        .then(setAnalysis)
        .catch(() => setError('Analysis not found. It may have expired or the backend is not running.'))
        .finally(() => setLoading(false));
    }
  }, [id, analysis]);

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Loading analysis…</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <p className="text-red-400 text-lg mb-2">Analysis not found</p>
        <p className="text-slate-500 text-sm mb-6">{error}</p>
        <Link to="/analyze" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={15} /> Run New Analysis
        </Link>
      </div>
    );
  }

  const totalSources = analysis.claims.reduce(
    (s, c) => s + c.supportingEvidence.length + c.contradictingEvidence.length, 0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <Link
            to="/analyze"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0 mt-0.5"
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {analysis.isDemo && (
                <span className="badge bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <FlaskConical size={10} /> Demo
                </span>
              )}
              <span className="text-xs text-slate-500">
                {new Date(analysis.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
              <span className="text-xs text-slate-600">·</span>
              <SearchStatusBadge analysisVersion={analysis.analysisVersion} />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">
              {analysis.headline}
            </h1>
            {analysis.sourceUrl && (
              <a
                href={analysis.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1 mt-1"
              >
                {(() => { try { return new URL(analysis.sourceUrl).hostname; } catch { return analysis.sourceUrl; } })()}
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
        <button
          onClick={handleCopyLink}
          className="shrink-0 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>

      {/* ── Demo notice ──────────────────────────────────────────────── */}
      {analysis.isDemo && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/8 border border-amber-500/25 rounded-xl mb-4 text-amber-300">
          <Info size={15} className="shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed">
            <strong>Demo Analysis:</strong> Uses synthetic illustrative data. Evidence, sources and verdicts are labeled demo content — not real-world results.
          </p>
        </div>
      )}

      {/* ── Unverified notice (live, no sources returned) ────────────── */}
      {!analysis.isDemo && analysis.truthScore.verdict === 'UNVERIFIED' && totalSources === 0 && (
        <div className="flex items-start gap-3 p-4 bg-blue-500/8 border border-blue-500/20 rounded-xl mb-4 text-blue-300">
          <Info size={15} className="shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <strong>Verification Limitation:</strong> Live search returned no usable evidence for these claims.
            <span className="text-slate-400"> UNVERIFIED does not mean false — it means we could not find evidence either way.</span>
            <br />
            <span className="text-slate-500 text-xs mt-1 block">
              For stronger verification, add a <code className="bg-slate-800 px-1 rounded text-blue-300">TAVILY_API_KEY</code> or <code className="bg-slate-800 px-1 rounded text-blue-300">SERPER_API_KEY</code> to <code className="bg-slate-800 px-1 rounded text-blue-300">backend/.env</code>
            </span>
          </div>
        </div>
      )}

      {/* ── Input preview (collapsible) ───────────────────────────────── */}
      {analysis.inputText && (
        <div className="card rounded-xl mb-4 overflow-hidden">
          <button
            onClick={() => setShowInput(!showInput)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition-colors"
          >
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Analyzed Input</span>
            {showInput ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
          </button>
          {showInput && (
            <div className="px-4 pb-4 border-t border-slate-700">
              <p className="text-sm text-slate-300 leading-relaxed mt-3 whitespace-pre-wrap">
                {analysis.inputText.length > 800 ? analysis.inputText.substring(0, 800) + '…' : analysis.inputText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── BIG Verdict Banner ───────────────────────────────────────── */}
      <VerdictBanner verdict={analysis.truthScore.verdict} score={analysis.truthScore.overall} />

      {/* ── Evidence Coverage ────────────────────────────────────────── */}
      <EvidenceCoverage analysis={analysis} />

      {/* ── Score + Explanation ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
        <div className="lg:col-span-2">
          <TruthScoreGauge analysis={analysis} />
        </div>
        <div className="lg:col-span-3">
          <ExplanationPanel analysis={analysis} />
        </div>
      </div>

      {/* ── Score Breakdown ──────────────────────────────────────────── */}
      <div className="mb-4">
        <ScoreFactorsChart factors={analysis.truthScore.factors} />
      </div>

      {/* ── Claims ───────────────────────────────────────────────────── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-white">Claim Analysis</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {analysis.claims.length} claim{analysis.claims.length !== 1 ? 's' : ''} extracted and verified
              {totalSources > 0 && ` · ${totalSources} source${totalSources !== 1 ? 's' : ''} retrieved`}
            </p>
          </div>
        </div>
        {analysis.claims.length === 0 ? (
          <div className="card p-6 rounded-xl text-center text-slate-500 text-sm">
            No individual claims could be extracted.
          </div>
        ) : (
          <div className="space-y-3">
            {analysis.claims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} isDemo={analysis.isDemo} />
            ))}
          </div>
        )}
      </div>

      {/* ── Source + Context ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <SourceCredibilityPanel credibility={analysis.sourceCredibility} />
        <ContextPanel context={analysis.contextAnalysis} />
      </div>

      {/* ── Language + News DNA ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <LanguagePanel signals={analysis.languageSignals} />
        <NewsDNAPanel dna={analysis.newsDNA} />
      </div>

      {/* ── Disclaimer ───────────────────────────────────────────────── */}
      <div className="card p-4 rounded-xl mb-6 bg-slate-900/60 border-slate-800">
        <p className="text-xs text-slate-500 text-center leading-relaxed">
          TruthTrace provides AI-assisted analysis to support — not replace — human judgment.
          Verdicts are probabilistic estimates based on available signals.
          Always verify important claims through multiple trusted sources.
        </p>
      </div>

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/analyze" className="btn-primary flex items-center justify-center gap-2">
          Analyze Another
        </Link>
        <Link to="/history" className="btn-secondary flex items-center justify-center gap-2">
          View History
        </Link>
        <button onClick={handleCopyLink} className="btn-secondary flex items-center justify-center gap-2">
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          {copied ? 'Link copied!' : 'Copy Result Link'}
        </button>
      </div>
    </div>
  );
}
