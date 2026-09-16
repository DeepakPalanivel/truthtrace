import { Link } from 'react-router-dom';
import {
  Search, Shield, GitBranch, Layers, BarChart2, FileText,
  ArrowRight, CheckCircle, AlertTriangle, XCircle, Zap
} from 'lucide-react';

const steps = [
  { icon: FileText, label: 'Content Extraction', desc: 'Article text is extracted and cleaned' },
  { icon: Layers, label: 'Claim Identification', desc: 'Individual factual claims are isolated' },
  { icon: Search, label: 'Evidence Retrieval', desc: 'Sources are checked for supporting/contradicting evidence' },
  { icon: Shield, label: 'Source Credibility', desc: 'Publisher, author, and domain signals evaluated' },
  { icon: GitBranch, label: 'Context Analysis', desc: 'Date mismatches and context manipulation detected' },
  { icon: BarChart2, label: 'Truth Score', desc: 'Weighted score with full factor breakdown' },
];

const differentiators = [
  { label: 'Claim-level analysis', desc: 'Not just one verdict — each claim is evaluated independently' },
  { label: 'News DNA', desc: 'Visualize how information propagated from origin to viral claim' },
  { label: 'Context Detection', desc: 'Identify old media repurposed for new false claims' },
  { label: 'Explainable verdicts', desc: 'Every result shows exactly why TruthTrace reached that conclusion' },
  { label: 'Evidence trail', desc: 'Supporting and contradicting sources for every claim' },
  { label: 'No black box', desc: 'All scoring factors are documented and transparent' },
];

const demoCards = [
  {
    case: 1,
    score: 12,
    verdict: 'LIKELY FALSE',
    headline: 'Government announces ₹50,000 for every citizen',
    color: 'border-red-500/30 bg-red-500/5',
    scoreColor: 'text-red-400',
    icon: XCircle,
    iconColor: 'text-red-400',
  },
  {
    case: 2,
    score: 31,
    verdict: 'MISLEADING CONTEXT',
    headline: 'Massive floods devastate Chennai — thousands displaced',
    color: 'border-orange-500/30 bg-orange-500/5',
    scoreColor: 'text-orange-400',
    icon: AlertTriangle,
    iconColor: 'text-orange-400',
  },
  {
    case: 3,
    score: 84,
    verdict: 'LIKELY TRUE',
    headline: 'ISRO and NASA successfully launch NISAR satellite',
    color: 'border-green-500/30 bg-green-500/5',
    scoreColor: 'text-green-400',
    icon: CheckCircle,
    iconColor: 'text-green-400',
  },
];

export default function LandingPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/15 border border-blue-500/30 rounded-full px-4 py-1.5 text-blue-300 text-sm font-medium mb-6">
            <Zap size={13} />
            AI-powered news intelligence
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
            Don't just detect fake news.
            <br />
            <span className="text-blue-400">Trace the truth.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            TruthTrace doesn't just label news real or fake. It extracts individual claims, traces evidence, evaluates source credibility, detects context manipulation, and delivers an explainable verdict — so you understand <em>why</em>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/analyze"
              className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-3.5"
            >
              <Search size={17} />
              Analyze News
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/analyze?demo=1"
              className="btn-secondary flex items-center justify-center gap-2 text-base px-8 py-3.5"
            >
              View Demo Analysis
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-title mb-2">The Pipeline</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How TruthTrace works</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {steps.map(({ icon: Icon, label, desc }, i) => (
              <div key={label} className="flex flex-col items-center text-center p-4 card rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center mb-3">
                  <Icon size={18} className="text-blue-400" />
                </div>
                <div className="text-xs font-semibold text-white mb-1">{i + 1}. {label}</div>
                <div className="text-xs text-slate-500">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-16 border-t border-slate-800 bg-gradient-to-b from-transparent to-slate-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-title mb-2">Why TruthTrace</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Not another binary classifier</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">
              Every other fake-news tool tells you what to think. TruthTrace shows you the evidence and lets you verify it yourself.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {differentiators.map(({ label, desc }) => (
              <div key={label} className="card p-5 rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle size={17} className="text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-white text-sm mb-1">{label}</div>
                    <div className="text-slate-400 text-sm leading-relaxed">{desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example analyses */}
      <section className="py-16 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="section-title mb-2">Demo Cases</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">See TruthTrace in action</h2>
            <p className="text-slate-500 text-sm mt-2">These are labeled demo analyses — not real-world verdicts</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {demoCards.map(({ case: c, score, verdict, headline, color, scoreColor, icon: Icon, iconColor }) => (
              <Link
                key={c}
                to={`/analyze?demo=${c}`}
                className={`card border p-5 rounded-xl hover:scale-[1.02] transition-transform ${color}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <Icon size={18} className={iconColor} />
                  <span className={`text-xl font-bold ${scoreColor}`}>{score}<span className="text-sm font-normal text-slate-500">/100</span></span>
                </div>
                <div className={`text-xs font-bold tracking-wide mb-2 ${scoreColor}`}>{verdict}</div>
                <p className="text-slate-300 text-sm leading-snug">{headline}</p>
                <div className="mt-4 text-xs text-blue-400 flex items-center gap-1">
                  View full analysis <ArrowRight size={11} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-slate-800 bg-gradient-to-b from-blue-900/10 to-transparent">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to trace the truth?
          </h2>
          <p className="text-slate-400 mb-8">Paste an article, enter a URL, or type a headline. TruthTrace does the rest.</p>
          <Link
            to="/analyze"
            className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5"
          >
            <Search size={17} />
            Start Analyzing
          </Link>
        </div>
      </section>
    </div>
  );
}
