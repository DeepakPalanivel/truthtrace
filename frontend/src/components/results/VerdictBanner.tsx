import type { OverallVerdict } from '../../types';

interface Props {
  verdict: OverallVerdict;
  score: number;
}

interface Cfg {
  emoji: string;
  label: string;
  bg: string;
  border: string;
  text: string;
  pill: string;
}

function getConfig(verdict: OverallVerdict): Cfg {
  switch (verdict) {
    case 'VERIFIED':
    case 'LIKELY_TRUE':
      return {
        emoji: '✅',
        label: 'TRUE',
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/40',
        text: 'text-emerald-300',
        pill: 'bg-emerald-500/20 text-emerald-200',
      };
    case 'LIKELY_FALSE':
      return {
        emoji: '❌',
        label: 'FAKE',
        bg: 'bg-red-500/15',
        border: 'border-red-500/40',
        text: 'text-red-300',
        pill: 'bg-red-500/20 text-red-200',
      };
    case 'MISLEADING':
      return {
        emoji: '⚠️',
        label: 'MISLEADING',
        bg: 'bg-orange-500/15',
        border: 'border-orange-500/40',
        text: 'text-orange-300',
        pill: 'bg-orange-500/20 text-orange-200',
      };
    case 'UNVERIFIED':
    case 'INSUFFICIENT_EVIDENCE':
    default:
      return {
        emoji: '🔍',
        label: 'UNVERIFIED',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/35',
        text: 'text-yellow-300',
        pill: 'bg-yellow-500/20 text-yellow-200',
      };
  }
}

export default function VerdictBanner({ verdict, score }: Props) {
  const cfg = getConfig(verdict);

  return (
    <div className={`rounded-2xl border ${cfg.bg} ${cfg.border} px-6 py-5 flex items-center justify-between gap-4 mb-4`}>
      <div className="flex items-center gap-5">
        <span className="text-6xl select-none leading-none">{cfg.emoji}</span>
        <div>
          <div className={`text-5xl font-black tracking-tight leading-none ${cfg.text}`}>
            {cfg.label}
          </div>
          {(verdict === 'UNVERIFIED' || verdict === 'INSUFFICIENT_EVIDENCE') && (
            <p className="text-slate-400 text-xs mt-1.5 max-w-xs">
              Not enough evidence to confirm or deny — this does <strong>not</strong> mean fake
            </p>
          )}
          {verdict === 'MISLEADING' && (
            <p className="text-slate-400 text-xs mt-1.5 max-w-xs">
              Content may be real but context or framing appears deceptive
            </p>
          )}
        </div>
      </div>

      <div className={`text-center rounded-xl px-5 py-3 shrink-0 ${cfg.pill}`}>
        <div className="text-3xl font-bold leading-none">{score}</div>
        <div className="text-xs opacity-60 mt-1">out of 100</div>
      </div>
    </div>
  );
}
