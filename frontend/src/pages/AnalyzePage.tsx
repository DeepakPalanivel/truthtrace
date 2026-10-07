import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText, Link as LinkIcon, Heading, CheckCircle, Loader2,
  AlertCircle, ChevronDown, Play, FlaskConical, XCircle, Zap
} from 'lucide-react';
import clsx from 'clsx';
import { analyzeNews, getDemoAnalysis, checkHealth } from '../services/api';
import type { ProcessingStep } from '../types';

type InputMode = 'text' | 'url' | 'headline';

const INITIAL_STEPS: ProcessingStep[] = [
  { step: 'extract', label: 'Extracting content', status: 'pending' },
  { step: 'claims', label: 'Identifying claims', status: 'pending' },
  { step: 'source', label: 'Checking source', status: 'pending' },
  { step: 'evidence', label: 'Comparing evidence', status: 'pending' },
  { step: 'context', label: 'Analyzing context', status: 'pending' },
  { step: 'report', label: 'Generating explanation', status: 'pending' },
];

const SAMPLE_TEXTS = [
  {
    label: 'Sample: Viral Claim',
    text: 'BREAKING: Government announces ₹50,000 direct benefit for EVERY Indian citizen! PM Modi signs order today. Money will be deposited directly to your Aadhaar-linked bank account within 48 hours. Share immediately before they delete this!!',
  },
  {
    label: 'Sample: Science Report',
    text: "India's ISRO successfully launched the NISAR satellite in collaboration with NASA on March 12, 2024. The joint Earth observation satellite, designed to monitor global ecosystems, ice sheets, and natural hazards, was launched aboard a GSLV Mk II rocket from Sriharikota.",
  },
];

export default function AnalyzePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const demoParam = searchParams.get('demo');

  const [mode, setMode] = useState<InputMode>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<ProcessingStep[]>(INITIAL_STEPS);
  const [error, setError] = useState<string | null>(null);
  const [showSamples, setShowSamples] = useState(false);
  const [searchProvider, setSearchProvider] = useState<string>('');

  // Load search provider status
  useEffect(() => {
    checkHealth().then((h) => {
      if (h.search) setSearchProvider(h.search.provider);
    });
  }, []);

  // Auto-trigger demo if ?demo=N
  useEffect(() => {
    if (demoParam && ['1', '2', '3'].includes(demoParam)) {
      handleDemo(parseInt(demoParam, 10) as 1 | 2 | 3);
    }
  }, [demoParam]);

  function advanceSteps(currentIndex: number) {
    setSteps((prev) =>
      prev.map((s, i) => {
        if (i < currentIndex) return { ...s, status: 'done' };
        if (i === currentIndex) return { ...s, status: 'processing' };
        return s;
      })
    );
  }

  async function handleDemo(caseNumber: 1 | 2 | 3) {
    setError(null);
    setLoading(true);
    setSteps(INITIAL_STEPS);

    // Simulate step progression for demo
    for (let i = 0; i < INITIAL_STEPS.length; i++) {
      advanceSteps(i);
      await new Promise((r) => setTimeout(r, 350));
    }

    try {
      const result = await getDemoAnalysis(caseNumber);
      setSteps(result.processingSteps);
      navigate(`/results/${result.id}`, { state: { analysis: result } });
    } catch {
      setError('Failed to load demo. Please try again.');
      setLoading(false);
      setSteps(INITIAL_STEPS);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const input =
      mode === 'text' ? { text } :
      mode === 'url' ? { url } :
      { headline, description };

    if (mode === 'text' && !text.trim()) {
      setError('Please paste news article text.');
      return;
    }
    if (mode === 'url' && !url.trim()) {
      setError('Please enter a URL.');
      return;
    }
    if (mode === 'headline' && !headline.trim()) {
      setError('Please enter a headline.');
      return;
    }

    setLoading(true);
    setSteps(INITIAL_STEPS);

    // Animate step progression while waiting for API
    let stepIdx = 0;
    const stepTimer = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, INITIAL_STEPS.length - 1);
      setSteps((prev) =>
        prev.map((s, i) => {
          if (i < stepIdx) return { ...s, status: 'done' };
          if (i === stepIdx) return { ...s, status: 'processing' };
          return s;
        })
      );
    }, 1000);

    try {
      const result = await analyzeNews(input);
      clearInterval(stepTimer);
      setSteps(result.processingSteps);
      navigate(`/results/${result.id}`, { state: { analysis: result } });
    } catch (err: unknown) {
      clearInterval(stepTimer);
      setLoading(false);
      setSteps(INITIAL_STEPS);
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      setError(`${msg}. The backend server may not be running — try Demo Mode instead.`);
    }
  }

  const tabs = [
    { id: 'text' as const, label: 'Paste Article', icon: FileText },
    { id: 'url' as const, label: 'Enter URL', icon: LinkIcon },
    { id: 'headline' as const, label: 'Headline + Text', icon: Heading },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-slide-up">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Analyze News</h1>
        <p className="text-slate-400">Paste an article, provide a URL, or enter a headline to get a full truth analysis.</p>
      </div>

      {/* Demo shortcuts */}
      <div className="card p-4 mb-6 rounded-xl">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <FlaskConical size={15} className="text-blue-400" />
            <span className="text-sm font-semibold text-white">Try a Demo Analysis</span>
            <span className="text-xs text-slate-500">(no API required)</span>
          </div>
          {searchProvider && (
            <span className={clsx(
              'text-xs px-2 py-1 rounded-full border font-medium flex items-center gap-1.5',
              searchProvider === 'tavily' || searchProvider === 'serper'
                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                : searchProvider === 'duckduckgo'
                ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                : 'text-slate-400 border-slate-600 bg-slate-800'
            )}>
              <Zap size={10} />
              {searchProvider === 'tavily' ? 'Live search (Tavily)'
                : searchProvider === 'serper' ? 'Live search (Serper)'
                : searchProvider === 'duckduckgo' ? 'Basic search (DuckDuckGo)'
                : 'No search configured'}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { n: 1 as const, label: 'Likely False', sub: 'Fabricated benefit claim', color: 'hover:border-red-500/50 hover:bg-red-500/5' },
            { n: 2 as const, label: 'Misleading Context', sub: 'Old image, new claim', color: 'hover:border-orange-500/50 hover:bg-orange-500/5' },
            { n: 3 as const, label: 'Likely True', sub: 'Verifiable science news', color: 'hover:border-green-500/50 hover:bg-green-500/5' },
          ].map(({ n, label, sub, color }) => (
            <button
              key={n}
              onClick={() => handleDemo(n)}
              disabled={loading}
              className={clsx(
                'text-left p-3 rounded-lg border border-slate-700 transition-all disabled:opacity-50',
                color
              )}
            >
              <div className="text-sm font-medium text-slate-200">{label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input form */}
      <div className="card rounded-xl overflow-hidden">
        {/* Mode tabs */}
        <div className="flex border-b border-slate-700">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setMode(id); setError(null); }}
              disabled={loading}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
                mode === id
                  ? 'bg-blue-600/15 text-blue-300 border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Text mode */}
          {mode === 'text' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="article-text">
                  Article text
                </label>
                <button
                  type="button"
                  onClick={() => setShowSamples(!showSamples)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  Sample text <ChevronDown size={12} className={clsx('transition-transform', showSamples && 'rotate-180')} />
                </button>
              </div>
              {showSamples && (
                <div className="mb-3 space-y-2">
                  {SAMPLE_TEXTS.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => { setText(s.text); setShowSamples(false); }}
                      className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
                    >
                      <span className="text-blue-400 font-medium">{s.label}</span>
                      <p className="text-slate-400 text-xs mt-1 truncate">{s.text.substring(0, 80)}...</p>
                    </button>
                  ))}
                </div>
              )}
              <textarea
                id="article-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the full news article or claim text here..."
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={8}
                disabled={loading}
                maxLength={10000}
              />
              <div className="text-right text-xs text-slate-600 mt-1">{text.length}/10000</div>
            </div>
          )}

          {/* URL mode */}
          {mode === 'url' && (
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2" htmlFor="news-url">
                Article URL
              </label>
              <input
                id="news-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/news-article"
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-2">
                NewzaX will fetch and extract the article content. Works best with news articles.
              </p>
            </div>
          )}

          {/* Headline mode */}
          {mode === 'headline' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2" htmlFor="headline">
                  Headline
                </label>
                <input
                  id="headline"
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Enter the news headline..."
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                  maxLength={500}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2" htmlFor="description">
                  Description or body text (optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add supporting text for better analysis..."
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  disabled={loading}
                  maxLength={5000}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
            ) : (
              <><Play size={16} /> Analyze News</>
            )}
          </button>
        </form>
      </div>

      {/* Processing steps overlay */}
      {loading && (
        <div className="mt-6 card p-6 rounded-xl animate-fade-in">
          <p className="text-sm font-semibold text-slate-300 mb-4">Processing pipeline</p>
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.step} className="flex items-center gap-3">
                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                  {step.status === 'done' && <CheckCircle size={16} className="text-emerald-400" />}
                  {step.status === 'processing' && <Loader2 size={16} className="text-blue-400 animate-spin" />}
                  {step.status === 'pending' && <div className="w-3 h-3 rounded-full bg-slate-600" />}
                  {step.status === 'error' && <XCircle size={16} className="text-yellow-400" />}
                </div>
                <span className={clsx(
                  'text-sm',
                  step.status === 'done' && 'text-emerald-400',
                  step.status === 'processing' && 'text-blue-300 font-medium',
                  step.status === 'pending' && 'text-slate-500',
                  step.status === 'error' && 'text-yellow-400',
                )}>
                  {step.label}
                  {step.status === 'error' && ' (unavailable)'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

