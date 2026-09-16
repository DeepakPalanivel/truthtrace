import { Lightbulb } from 'lucide-react';
import type { NewsAnalysis } from '../../types';

interface Props {
  analysis: NewsAnalysis;
}

export default function ExplanationPanel({ analysis }: Props) {
  const { explanation, verdict } = analysis.truthScore;

  return (
    <div className="card p-5 rounded-xl h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={15} className="text-yellow-400" />
        <p className="section-title">Why did TruthTrace reach this verdict?</p>
      </div>

      <div className="space-y-2 flex-1">
        {explanation.map((reason, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
              {i + 1}
            </span>
            <p className="text-sm text-slate-300 leading-relaxed">{reason}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          Verdict: <span className="font-semibold text-slate-400">{verdict.replace('_', ' ')}</span>
          {' · '}This is an AI-assisted assessment. Always verify through trusted sources.
        </p>
      </div>
    </div>
  );
}
