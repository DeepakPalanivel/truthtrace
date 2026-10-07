import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  History, Search, FlaskConical, ExternalLink, Clock,
  RefreshCw, AlertCircle, Trash2, CheckCircle
} from 'lucide-react';
import { getHistory, clearHistory } from '../services/api';
import type { AnalysisHistoryItem } from '../types';
import { getVerdictBg, getVerdictLabel, getScoreColor, formatDate } from '../utils/verdictUtils';

export default function HistoryPage() {
  const [items, setItems] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getHistory()
      .then(setItems)
      .catch(() => setError('Could not load history. Make sure the backend is running on port 5000.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    setClearing(true);
    try {
      await clearHistory();
      setItems([]);
      setConfirmClear(false);
    } catch {
      setError('Failed to clear history.');
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-slide-up">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History size={20} className="text-blue-400" />
            Analysis History
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {items.length > 0
              ? `${items.length} saved analysis${items.length !== 1 ? 'es' : ''}`
              : 'Analyses you run are saved here'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {items.length > 0 && (
            <button
              onClick={handleClear}
              disabled={clearing}
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors font-medium ${
                confirmClear
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10'
              }`}
            >
              {clearing
                ? <RefreshCw size={13} className="animate-spin" />
                : confirmClear
                ? <CheckCircle size={13} />
                : <Trash2 size={13} />}
              {clearing ? 'Clearing…' : confirmClear ? 'Confirm clear' : 'Clear all'}
            </button>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="btn-secondary flex items-center gap-1.5 text-sm py-2 px-3"
            title="Refresh"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link to="/analyze" className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
            <Search size={13} />
            New Analysis
          </Link>
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────────── */}
      {error && (
        <div className="card p-5 rounded-xl mb-6 border-red-500/30 bg-red-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 text-sm font-medium">Backend not reachable</p>
              <p className="text-slate-400 text-xs mt-1">{error}</p>
              <p className="text-slate-500 text-xs mt-2">
                Run: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300">cd backend &amp;&amp; npm run dev</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────────────────── */}
      {loading && (
        <div className="text-center py-16">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading history…</p>
        </div>
      )}

      {/* ── Empty ───────────────────────────────────────────────────── */}
      {!loading && !error && items.length === 0 && (
        <div className="card p-12 rounded-xl text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <History size={28} className="text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No analyses yet</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Every article you analyze will appear here with its verdict and score.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/analyze" className="btn-primary inline-flex items-center gap-2">
              <Search size={14} />
              Analyze an Article
            </Link>
            <Link to="/analyze?demo=1" className="btn-secondary inline-flex items-center gap-2">
              <FlaskConical size={13} />
              Try Demo Case
            </Link>
          </div>
        </div>
      )}

      {/* ── List ────────────────────────────────────────────────────── */}
      {!loading && items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <HistoryCard key={item.id} item={item} />
          ))}
          {items.length >= 50 && (
            <p className="text-center text-xs text-slate-600 pt-2 pb-1">
              Showing most recent 50 analyses
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function HistoryCard({ item }: { item: AnalysisHistoryItem }) {
  return (
    <Link
      to={`/results/${item.id}`}
      className="card flex items-start gap-4 p-4 rounded-xl hover:bg-slate-800/60 transition-colors group"
    >
      {/* Score */}
      <div className="text-center shrink-0 w-12 pt-0.5">
        <div className="text-2xl font-bold leading-none" style={{ color: getScoreColor(item.truthScore) }}>
          {item.truthScore}
        </div>
        <div className="text-xs text-slate-600 mt-0.5">/100</div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          <span className={`badge text-xs ${getVerdictBg(item.verdict)}`}>
            {getVerdictLabel(item.verdict)}
          </span>
          {item.isDemo && (
            <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">
              <FlaskConical size={9} /> Demo
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-slate-200 line-clamp-2 group-hover:text-white transition-colors">
          {item.headline}
        </p>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
          <Clock size={10} className="shrink-0" />
          <span>{formatDate(item.createdAt)}</span>
          {item.url && (
            <>
              <span className="text-slate-700">·</span>
              <span className="text-blue-400 inline-flex items-center gap-0.5">
                <ExternalLink size={9} /> Source
              </span>
            </>
          )}
        </div>
      </div>

      <ExternalLink size={13} className="text-slate-700 group-hover:text-slate-400 shrink-0 mt-1 transition-colors" />
    </Link>
  );
}

