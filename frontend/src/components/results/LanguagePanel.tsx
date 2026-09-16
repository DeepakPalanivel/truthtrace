import { MessageSquareWarning } from 'lucide-react';
import type { LanguageSignals } from '../../types';
import { getScoreColor } from '../../utils/verdictUtils';

interface Props {
  signals: LanguageSignals;
}

const signalMetrics = [
  { key: 'clickbaitScore', label: 'Clickbait', desc: 'Sensational headlines & urgency language' },
  { key: 'emotionalLanguageScore', label: 'Emotional Language', desc: 'Fear, outrage, panic-inducing words' },
  { key: 'unsupportedCertaintyScore', label: 'Unsupported Certainty', desc: 'Unqualified absolute claims' },
  { key: 'missingAttributionScore', label: 'Missing Attribution', desc: 'Claims without cited sources' },
  { key: 'sensationalismScore', label: 'Sensationalism', desc: 'Exaggerated or dramatic framing' },
] as const;

function scoreToRisk(score: number): { label: string; color: string } {
  if (score >= 70) return { label: 'High', color: 'text-red-400' };
  if (score >= 40) return { label: 'Medium', color: 'text-orange-400' };
  if (score >= 20) return { label: 'Low', color: 'text-yellow-400' };
  return { label: 'Minimal', color: 'text-emerald-400' };
}

export default function LanguagePanel({ signals }: Props) {
  const overall = signals.overallManipulationScore;

  return (
    <div className="card p-5 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquareWarning size={15} className="text-yellow-400" />
        <p className="section-title">Language Signals</p>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Manipulation:</span>
          <span className="text-sm font-bold" style={{ color: getScoreColor(100 - overall) }}>
            {scoreToRisk(overall).label}
          </span>
        </div>
      </div>

      {/* Overall bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Overall manipulation score</span>
          <span className="font-medium text-slate-300">{overall}/100</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{
              width: `${overall}%`,
              backgroundColor: overall >= 70 ? '#ef4444' : overall >= 40 ? '#f97316' : '#f59e0b',
            }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-2.5 mb-4">
        {signalMetrics.map(({ key, label }) => {
          const score = signals[key];
          const risk = scoreToRisk(score);
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-36 shrink-0">{label}</span>
              <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${score}%`,
                    backgroundColor: score >= 70 ? '#ef4444' : score >= 40 ? '#f97316' : '#f59e0b',
                  }}
                />
              </div>
              <span className={`text-xs font-medium w-14 text-right ${risk.color}`}>{risk.label}</span>
            </div>
          );
        })}
      </div>

      {/* Trigger words */}
      {signals.triggerWords.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-slate-500 mb-1.5">Detected trigger words</p>
          <div className="flex flex-wrap gap-1.5">
            {signals.triggerWords.map((word) => (
              <span key={word} className="badge bg-red-500/10 text-red-300 border border-red-500/20 text-xs">
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 text-xs text-slate-500 mb-3">
        <span>ALL CAPS words: <strong className="text-slate-300">{signals.allCapsCount}</strong></span>
        <span>Exclamations: <strong className="text-slate-300">{signals.exclamationCount}</strong></span>
      </div>

      {/* Summary */}
      <p className="text-xs text-slate-400 border-t border-slate-700 pt-3">{signals.summary}</p>

      <p className="text-xs text-slate-600 mt-2">
        Note: High emotional language alone does not indicate fake news. Consider in context with other signals.
      </p>
    </div>
  );
}
