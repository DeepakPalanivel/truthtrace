import type { ElementType } from 'react';
import { GitBranch, Newspaper, Share2, AlertTriangle, ArrowDown, FlaskConical } from 'lucide-react';
import type { NewsDNA, NewsDNANode } from '../../types';
import clsx from 'clsx';

interface Props {
  dna: NewsDNA;
}

const nodeConfig: Record<NewsDNANode['type'], { icon: ElementType; color: string; bg: string }> = {
  ORIGINAL_CLAIM: { icon: Newspaper, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
  PUBLISHED_ARTICLE: { icon: Newspaper, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  SOCIAL_MEDIA: { icon: Share2, color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30' },
  MODIFIED_VERSION: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' },
  VIRAL_CLAIM: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30' },
};

const relationshipLabel: Record<string, string> = {
  PUBLISHED: 'Published',
  SHARED: 'Shared',
  MODIFIED: 'Modified & Reused',
  VIRAL_SPREAD: 'Went Viral',
};

export default function NewsDNAPanel({ dna }: Props) {
  // Build ordered chain from links
  const orderedNodes: NewsDNANode[] = [];
  const nodeMap = new Map(dna.nodes.map((n) => [n.id, n]));

  // Simple linear chain traversal
  const visited = new Set<string>();
  const starts = dna.nodes.filter((n) => !dna.links.some((l) => l.target === n.id));
  let current = starts[0] || dna.nodes[0];

  while (current && !visited.has(current.id)) {
    orderedNodes.push(current);
    visited.add(current.id);
    const nextLink = dna.links.find((l) => l.source === current.id);
    if (!nextLink) break;
    const nextNode = nodeMap.get(nextLink.target);
    if (!nextNode) break;
    current = nextNode;
  }

  // Add any remaining nodes
  dna.nodes.forEach((n) => {
    if (!visited.has(n.id)) orderedNodes.push(n);
  });

  return (
    <div className="card p-5 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <GitBranch size={15} className="text-blue-400" />
        <p className="section-title">News DNA</p>
        {dna.isSimulated && (
          <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs ml-auto">
            <FlaskConical size={9} /> {dna.propagationLabel}
          </span>
        )}
      </div>

      {!dna.isSimulated && (
        <p className="text-xs text-slate-500 mb-3">Information propagation based on source data</p>
      )}

      <div className="space-y-1 mt-3">
        {orderedNodes.map((node, i) => {
          const config = nodeConfig[node.type] || nodeConfig.ORIGINAL_CLAIM;
          const Icon = config.icon;
          const link = dna.links.find((l) => l.source === node.id);

          return (
            <div key={node.id}>
              <div className={clsx('flex items-start gap-3 p-3 rounded-lg border', config.bg)}>
                <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5', 'bg-current/10')}>
                  <Icon size={12} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">{node.label}</span>
                    {node.isSimulated && (
                      <span className="text-xs text-slate-600">(illustrative)</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{node.description}</p>
                  {(node.date || node.source) && (
                    <div className="flex gap-3 mt-1 text-xs text-slate-500">
                      {node.date && <span>{node.date}</span>}
                      {node.source && <span>{node.source}</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow + relationship label */}
              {link && i < orderedNodes.length - 1 && (
                <div className="flex items-center gap-2 py-1 pl-4">
                  <ArrowDown size={12} className="text-slate-600" />
                  <span className="text-xs text-slate-600">{relationshipLabel[link.relationship] || link.relationship}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {dna.isSimulated && (
        <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-700">
          Propagation paths shown above are illustrative. Real propagation tracking requires integration with social media and news monitoring APIs.
        </p>
      )}
    </div>
  );
}
