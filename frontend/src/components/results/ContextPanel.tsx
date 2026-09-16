import { MapPin, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import type { ContextAnalysis } from '../../types';
import { getScoreColor } from '../../utils/verdictUtils';
import clsx from 'clsx';

interface Props {
  context: ContextAnalysis;
}

const verdictConfig = {
  AUTHENTIC_CONTEXT: { label: 'Authentic Context', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle },
  MISLEADING_CONTEXT: { label: 'Misleading Context', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: AlertTriangle },
  LIKELY_MISLEADING: { label: 'Likely Misleading', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', icon: AlertTriangle },
  UNVERIFIABLE: { label: 'Unverifiable', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: HelpCircle },
};

const severityColor = {
  HIGH: 'text-red-400',
  MEDIUM: 'text-orange-400',
  LOW: 'text-yellow-400',
};

export default function ContextPanel({ context }: Props) {
  const config = verdictConfig[context.verdict] || verdictConfig.UNVERIFIABLE;
  const VerdictIcon = config.icon;

  return (
    <div className="card p-5 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={15} className="text-purple-400" />
        <p className="section-title">Context Check</p>
      </div>

      {/* Verdict badge */}
      <div className={clsx('flex items-center gap-2 p-3 rounded-lg border mb-4', config.bg)}>
        <VerdictIcon size={15} className={config.color} />
        <span className={clsx('font-semibold text-sm', config.color)}>{config.label}</span>
        <span className="ml-auto text-xs text-slate-500">{context.confidence}% confidence</span>
      </div>

      {/* Context match score */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-400">Context match score</span>
          <span className="font-semibold" style={{ color: getScoreColor(context.contextMatchScore) }}>
            {context.contextMatchScore}/100
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all duration-700"
            style={{ width: `${context.contextMatchScore}%`, backgroundColor: getScoreColor(context.contextMatchScore) }}
          />
        </div>
      </div>

      {/* Date info */}
      {(context.originalDate || context.claimedDate) && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {context.originalDate && (
            <div className="bg-slate-800 rounded-lg p-2.5">
              <div className="text-xs text-slate-500 mb-0.5">Original date</div>
              <div className="text-sm font-medium text-slate-200">{context.originalDate}</div>
            </div>
          )}
          {context.claimedDate && (
            <div className="bg-slate-800 rounded-lg p-2.5">
              <div className="text-xs text-slate-500 mb-0.5">Claimed date</div>
              <div className="text-sm font-medium text-slate-200">{context.claimedDate}</div>
            </div>
          )}
        </div>
      )}

      {/* Issues */}
      {context.issues.length > 0 && (
        <div className="space-y-2 mb-3">
          {context.issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <AlertTriangle size={12} className={clsx('mt-0.5 shrink-0', severityColor[issue.severity])} />
              <div>
                <span className={clsx('font-semibold', severityColor[issue.severity])}>
                  {issue.type.replace('_', ' ')} ({issue.severity})
                </span>
                <p className="text-slate-400 mt-0.5">{issue.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Explanation */}
      <p className="text-xs text-slate-400 border-t border-slate-700 pt-3 mt-2">{context.explanation}</p>
    </div>
  );
}
