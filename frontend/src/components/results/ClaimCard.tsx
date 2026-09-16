import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, CheckCircle, XCircle, Info } from 'lucide-react';
import type { Claim, Evidence } from '../../types';
import { getVerdictBg, getVerdictLabel } from '../../utils/verdictUtils';
import clsx from 'clsx';

interface Props {
  claim: Claim;
  isDemo: boolean;
}

export default function ClaimCard({ claim, isDemo }: Props) {
  const [expanded, setExpanded] = useState(false);
  const totalEvidence = claim.supportingEvidence.length + claim.contradictingEvidence.length;

  return (
    <div className="card rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 hover:bg-slate-800/50 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 leading-snug">{claim.claimText}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`badge text-xs ${getVerdictBg(claim.verdict)}`}>
              {getVerdictLabel(claim.verdict)}
            </span>
            <div className="text-center min-w-[3rem]">
              <div className="text-sm font-bold text-slate-300">{claim.confidence}%</div>
              <div className="text-xs text-slate-500">conf.</div>
            </div>
            {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex-1 bg-slate-700 rounded-full h-1">
            <div
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: `${claim.confidence}%`,
                backgroundColor: claim.confidence > 70 ? '#ef4444' : claim.confidence > 50 ? '#f97316' : '#f59e0b',
              }}
            />
          </div>
          <span className="text-xs text-slate-500">{totalEvidence} source(s)</span>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-700 p-4 space-y-4 animate-fade-in">
          {/* Explanation */}
          <div className="flex items-start gap-2">
            <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-300">{claim.explanation}</p>
          </div>

          {/* Evidence */}
          {claim.supportingEvidence.length > 0 && (
            <EvidenceSection
              title="Supporting Evidence"
              evidence={claim.supportingEvidence}
              type="supporting"
              isDemo={isDemo}
            />
          )}
          {claim.contradictingEvidence.length > 0 && (
            <EvidenceSection
              title="Contradicting Evidence"
              evidence={claim.contradictingEvidence}
              type="contradicting"
              isDemo={isDemo}
            />
          )}
          {totalEvidence === 0 && (
            <div className="text-xs text-slate-500 bg-slate-800 rounded-lg p-3">
              No evidence retrieved — connect a search API to enable live evidence lookup.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EvidenceSection({
  title, evidence, type, isDemo
}: {
  title: string;
  evidence: Evidence[];
  type: 'supporting' | 'contradicting';
  isDemo: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {type === 'supporting'
          ? <CheckCircle size={13} className="text-emerald-400" />
          : <XCircle size={13} className="text-red-400" />}
        <span className={clsx('text-xs font-semibold', type === 'supporting' ? 'text-emerald-400' : 'text-red-400')}>
          {title}
        </span>
      </div>
      <div className="space-y-2">
        {evidence.map((ev) => (
          <div
            key={ev.id}
            className={clsx(
              'rounded-lg p-3 border text-sm',
              type === 'supporting'
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-red-500/5 border-red-500/20'
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="font-medium text-slate-200 text-xs leading-snug">{ev.sourceTitle}</span>
              {isDemo && (
                <span className="badge bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20 shrink-0">demo</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <span>{ev.publisher}</span>
              <span>·</span>
              <span>{ev.publicationDate}</span>
              <a
                href={ev.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-0.5 ml-auto"
                onClick={(e) => e.stopPropagation()}
              >
                Source <ExternalLink size={10} />
              </a>
            </div>
            <p className="text-slate-400 text-xs italic mb-1.5">"{ev.excerpt}"</p>
            <p className="text-slate-300 text-xs">{ev.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
