interface Props {
  provider: string;
  label: string;
}

const providerColors: Record<string, string> = {
  tavily: 'text-emerald-400',
  serper: 'text-emerald-400',
  duckduckgo: 'text-yellow-400',
  none: 'text-red-400',
};

export default function SearchStatusBadge({ provider, label }: Props) {
  const color = providerColors[provider] || 'text-slate-400';
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {label}
    </span>
  );
}
