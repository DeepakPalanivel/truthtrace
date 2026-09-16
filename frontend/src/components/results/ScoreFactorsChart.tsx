import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { TruthScoreFactor } from '../../types';
import { getScoreColor } from '../../utils/verdictUtils';

interface Props {
  factors: TruthScoreFactor[];
}

export default function ScoreFactorsChart({ factors }: Props) {
  return (
    <div className="card p-5 rounded-xl">
      <p className="section-title mb-4">Score Breakdown</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={factors} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }}
                formatter={(value: number, name: string, props) => [
                  `${value}/100 (${props.payload.weight}% weight)`,
                  'Score'
                ]}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {factors.map((f, i) => (
                  <Cell key={i} fill={getScoreColor(f.score)} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Factor details */}
        <div className="space-y-2">
          {factors.map((f) => (
            <div key={f.name} className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium text-slate-300">{f.name}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">{f.weight}% weight</span>
                    <span className="font-semibold" style={{ color: getScoreColor(f.score) }}>{f.score}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${f.score}%`, backgroundColor: getScoreColor(f.score) }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{f.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
