import { Shield, CheckCircle, XCircle, Minus } from 'lucide-react';
import type { SourceCredibility } from '../../types';
import { getScoreColor } from '../../utils/verdictUtils';

interface Props {
  credibility: SourceCredibility;
}

const metrics = [
  { key: 'publisherScore', label: 'Publisher' },
  { key: 'transparencyScore', label: 'Transparency' },
  { key: 'citationsScore', label: 'Citations' },
  { key: 'domainScore', label: 'Domain Signals' },
  { key: 'authorScore', label: 'Author' },
] as const;

export default function SourceCredibilityPanel({ credibility }: Props) {
  return (
    <div className="card p-5 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={15} className="text-blue-400" />
        <p className="section-title">Source Credibility</p>
        <div className="ml-auto text-right">
          <span className="text-2xl font-bold" style={{ color: getScoreColor(credibility.overall) }}>
            {credibility.overall}
          </span>
          <span className="text-slate-500 text-sm">/100</span>
        </div>
      </div>

      {/* Overall bar */}
      <div className="mb-4">
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{ width: `${credibility.overall}%`, backgroundColor: getScoreColor(credibility.overall) }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{credibility.domain || 'Unknown source'}</span>
          {credibility.overall >= 70
            ? <span className="text-emerald-400">Strong source signals</span>
            : credibility.overall >= 40
            ? <span className="text-yellow-400">Limited evidence</span>
            : <span className="text-red-400">Low credibility signals</span>}
        </div>
      </div>

      {/* Sub-metrics */}
      <div className="space-y-2 mb-4">
        {metrics.map(({ key, label }) => {
          const score = credibility[key];
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-28 shrink-0">{label}</span>
              <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }}
                />
              </div>
              <span className="text-xs font-medium text-slate-300 w-8 text-right">{score}</span>
            </div>
          );
        })}
      </div>

      {/* Signals */}
      <div className="space-y-1.5">
        {credibility.signals.map((signal, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            {signal.type === 'POSITIVE' && <CheckCircle size={12} className="text-emerald-400 mt-0.5 shrink-0" />}
            {signal.type === 'NEGATIVE' && <XCircle size={12} className="text-red-400 mt-0.5 shrink-0" />}
            {signal.type === 'NEUTRAL' && <Minus size={12} className="text-slate-500 mt-0.5 shrink-0" />}
            <div>
              <span className="font-medium text-slate-300">{signal.label}</span>
              <span className="text-slate-500"> — {signal.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
