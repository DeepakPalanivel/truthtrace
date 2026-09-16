import { useEffect, useState } from 'react';
import type { NewsAnalysis } from '../../types';
import { getScoreColor, getVerdictBg, getVerdictLabel } from '../../utils/verdictUtils';

interface Props {
  analysis: NewsAnalysis;
}

export default function TruthScoreGauge({ analysis }: Props) {
  const { overall, verdict } = analysis.truthScore;
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(overall), 100);
    return () => clearTimeout(timer);
  }, [overall]);

  // SVG gauge params
  const r = 54;
  const cx = 70;
  const cy = 70;
  const circumference = Math.PI * r; // half circle
  const dashArray = (animatedScore / 100) * circumference;
  const color = getScoreColor(overall);

  return (
    <div className="card p-5 rounded-xl h-full flex flex-col">
      <p className="section-title mb-4">Truth Score</p>

      {/* Gauge */}
      <div className="flex flex-col items-center py-2">
        <svg width="140" height="90" viewBox="0 0 140 90" className="overflow-visible">
          {/* Background arc */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="#1e293b"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Score arc */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${dashArray} ${circumference}`}
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s' }}
          />
          {/* Score text */}
          <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="26" fontWeight="800" fontFamily="Inter, sans-serif">
            {animatedScore}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="Inter, sans-serif">
            out of 100
          </text>
        </svg>

        {/* Verdict badge */}
        <div className={`badge text-sm px-3 py-1 mt-2 ${getVerdictBg(verdict)}`}>
          {getVerdictLabel(verdict)}
        </div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-slate-600 mt-3 px-2">
        <span className="text-red-500">False</span>
        <span className="text-yellow-500">Unverified</span>
        <span className="text-green-500">True</span>
      </div>

      {/* Info */}
      <p className="text-xs text-slate-500 text-center mt-3">
        Weighted across 5 evidence factors
      </p>
    </div>
  );
}
