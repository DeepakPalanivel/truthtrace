import { Shield, Layers, GitBranch, BarChart2, Info, AlertTriangle, Code, Mail, Github, Linkedin, User } from 'lucide-react';

const methodology = [
  {
    icon: Layers,
    title: 'Claim Extraction',
    desc: 'NewzaX isolates individual factual statements from article text, rather than treating an entire article as a single unit. This enables targeted verification.',
  },
  {
    icon: Shield,
    title: 'Source Credibility Scoring',
    desc: 'Five signals are evaluated: domain authority, publisher transparency, author attribution, citation presence, and HTTPS status. Each is weighted to produce a 0–100 score.',
  },
  {
    icon: Info,
    title: 'Context Analysis',
    desc: 'The system checks for date mismatches, unattributed authority claims, suppression language, and other context manipulation patterns common in misinformation.',
  },
  {
    icon: BarChart2,
    title: 'Language Signal Analysis',
    desc: 'Clickbait patterns, emotional trigger words, unsupported certainty phrases, and attribution gaps are measured. High scores indicate elevated concern — not guaranteed falsehood.',
  },
  {
    icon: GitBranch,
    title: 'News DNA',
    desc: 'NewzaX attempts to model the information propagation path from original claim to viral spread. When data is unavailable, paths are clearly labeled as illustrative.',
  },
];

const scoringFactors = [
  { name: 'Claim Evidence', weight: 35, desc: 'How well do the extracted claims hold up against available evidence?' },
  { name: 'Source Credibility', weight: 20, desc: 'How credible are the domain, publisher, author, and citation signals?' },
  { name: 'Cross-Source Agreement', weight: 20, desc: 'Do multiple independent sources corroborate or contradict the claims?' },
  { name: 'Context Consistency', weight: 15, desc: 'Is the information presented in its correct temporal and factual context?' },
  { name: 'Language Signals', weight: 10, desc: 'How much manipulation language is present?' },
];

const limitations = [
  'NewzaX cannot access all internet sources. Evidence retrieval is limited by available APIs.',
  'AI claim extraction is not perfect. Complex or subtle claims may be missed or misrepresented.',
  'Source credibility scoring is heuristic. A high score does not guarantee accuracy.',
  'Context analysis cannot detect sophisticated misinformation that uses real sources with subtle modifications.',
  'Language analysis is not a reliable indicator of truth or falsehood by itself.',
  'Demo mode uses synthetic data and does not reflect real-world analysis.',
  'NewzaX should be used as one tool among many — always verify through multiple trusted sources.',
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-slide-up">
      <div className="text-center mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">About NewzaX</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          NewzaX is an explainable fake news intelligence system. It doesn't just tell you what to believe — it shows you the evidence, the reasoning, and the limitations behind every verdict.
        </p>
      </div>

      {/* Core Differentiator */}
      <div className="card p-6 rounded-xl mb-6 bg-blue-600/5 border border-blue-500/20">
        <h2 className="text-lg font-bold text-white mb-2">The Core Differentiator</h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          Most fake-news classifiers produce a single binary label (Real/Fake) with a confidence percentage and no explanation. NewzaX takes a fundamentally different approach:
        </p>
        <ul className="mt-3 space-y-1.5">
          {[
            'Every claim is analyzed individually, not the article as a whole',
            'Every verdict includes the reasoning behind it',
            'Evidence is shown with sources and explanations',
            'Context manipulation is checked separately from factual accuracy',
            'All scoring factors are documented and deterministic',
            'Demo data is always clearly labeled — never presented as real evidence',
          ].map((point) => (
            <li key={point} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-blue-400 mt-0.5">→</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Methodology */}
      <h2 className="text-xl font-bold text-white mb-4">Methodology</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {methodology.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={15} className="text-blue-400" />
              <h3 className="font-semibold text-white text-sm">{title}</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Scoring */}
      <h2 className="text-xl font-bold text-white mb-4">How the Truth Score is Calculated</h2>
      <div className="card p-5 rounded-xl mb-8">
        <p className="text-slate-400 text-sm mb-4">
          The Truth Score (0–100) is a deterministic weighted average of five independent factors:
        </p>
        <div className="space-y-3">
          {scoringFactors.map(({ name, weight, desc }) => (
            <div key={name} className="flex items-start gap-3">
              <div className="w-10 text-right shrink-0">
                <span className="text-sm font-bold text-blue-400">{weight}%</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{name}</div>
                <div className="text-xs text-slate-400">{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-500">
            Verdict thresholds: ≥80 Likely True · ≥65 Probably Accurate · ≥45 Unverified · ≥30 Likely Misleading · &lt;30 Likely False
          </p>
        </div>
      </div>

      {/* Tech Stack */}
      <h2 className="text-xl font-bold text-white mb-4">Tech Stack</h2>
      <div className="card p-5 rounded-xl mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Code size={14} className="text-blue-400" />
          <span className="text-sm font-medium text-slate-300">Architecture</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {[
            ['Frontend', 'React + TypeScript'],
            ['Styling', 'Tailwind CSS'],
            ['Charts', 'Recharts'],
            ['Backend', 'Node.js + Express'],
            ['Database', 'SQLite (better-sqlite3)'],
            ['AI Layer', 'OpenAI / Groq (optional)'],
          ].map(([cat, tech]) => (
            <div key={cat} className="bg-slate-800 rounded-lg p-2.5">
              <div className="text-xs text-slate-500">{cat}</div>
              <div className="font-medium text-slate-200 text-xs mt-0.5">{tech}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations */}
      <h2 className="text-xl font-bold text-white mb-4">Limitations</h2>
      <div className="card p-5 rounded-xl mb-8 bg-amber-500/5 border border-amber-500/20">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={14} className="text-amber-400" />
          <span className="text-sm font-semibold text-amber-300">Important limitations</span>
        </div>
        <ul className="space-y-2">
          {limitations.map((lim) => (
            <li key={lim} className="flex items-start gap-2 text-sm text-slate-400">
              <span className="text-amber-500 mt-0.5 shrink-0">•</span>
              {lim}
            </li>
          ))}
        </ul>
      </div>

      {/* Future */}
      <h2 className="text-xl font-bold text-white mb-4">Future Improvements</h2>
      <div className="card p-5 rounded-xl mb-8">
        <ul className="space-y-1.5">
          {[
            'Live evidence retrieval via search APIs (Serper, Google Search)',
            'Real-time social media propagation tracking',
            'Image reverse search and metadata analysis',
            'Multi-language support',
            'Browser extension for in-context analysis',
            'Collaborative fact-checking with community evidence submission',
            'Historical claim database for faster verification',
            'API access for third-party integrations',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
              <span className="text-blue-400 mt-0.5">→</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Developer */}
      <h2 className="text-xl font-bold text-white mb-4">Developer</h2>
      <div className="card p-6 rounded-xl bg-gradient-to-br from-blue-600/10 to-slate-800/50 border border-blue-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-blue-600/20 border-2 border-blue-500/40 flex items-center justify-center shrink-0">
            <User size={28} className="text-blue-400" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white">Deepak Palanivel</h3>
            <p className="text-slate-400 text-sm mt-1">
              Built NewzaX as a hackathon project — an AI-powered fake news intelligence system with explainable verdicts, claim-level analysis, and real evidence retrieval.
            </p>

            {/* Links */}
            <div className="flex flex-wrap gap-3 mt-4">
              <a
                href="mailto:p.deepak.2826@gmail.com"
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Mail size={13} className="text-blue-400" />
                p.deepak.2826@gmail.com
              </a>

              <a
                href="https://github.com/DeepakPalanivel"
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github size={13} className="text-blue-400" />
                DeepakPalanivel
              </a>

              <a
                href="https://www.linkedin.com/in/deepak-p-8b3333351/"
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin size={13} className="text-blue-400" />
                deepak-p-8b3333351
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}