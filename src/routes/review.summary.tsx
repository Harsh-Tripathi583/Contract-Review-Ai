import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { contractQueryOptions } from "@/hooks/use-contract";
import { Icon } from "@/components/ui/icon";

export const Route = createFileRoute("/review/summary")({
  component: SummaryPage,
});

function SummaryPage() {
  const { id } = Route.useSearch({ select: (s) => ({ id: (s as { id: string }).id }) });
  const { data: contract } = useSuspenseQuery(contractQueryOptions(id));
  const s = contract.summary;
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-headline-lg text-on-surface font-semibold mb-1">Executive Summary</h1>
        <p className="text-on-surface-variant text-body-lg mb-6">
          AI-generated overview for stakeholders.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-surface border border-outline-variant rounded-xl p-6 elevation-2 text-center">
            <p className="text-label-md text-on-surface-variant uppercase mb-2">Overall Risk</p>
            <p className="text-display font-bold" style={{ color: "var(--color-warn-fg)" }}>
              {s.overallRiskScore}
              <span className="text-label-md text-outline">/100</span>
            </p>
          </div>
          <div className="bg-surface border border-outline-variant rounded-xl p-6 elevation-2 text-center">
            <p className="text-label-md text-on-surface-variant uppercase mb-2">AI Confidence</p>
            <p className="text-display font-bold text-tertiary-container">
              {s.aiConfidence}
              <span className="text-label-md text-outline">%</span>
            </p>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl p-6 elevation-2 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="auto_awesome" size={18} className="text-primary" />
            <h2 className="text-headline-md text-on-surface">Headline</h2>
          </div>
          <p className="text-body-lg text-on-surface-variant">{s.headline}</p>
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl p-6 elevation-2 mb-4">
          <h2 className="text-headline-md text-on-surface mb-3">Key Points</h2>
          <ul className="space-y-2">
            {s.keyPoints.map((k, i) => (
              <li key={i} className="flex gap-2 text-body-md text-on-surface-variant">
                <Icon name="chevron_right" size={18} className="text-primary flex-shrink-0" />
                <span>{k}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl p-4 border-l-2 border-primary-container bg-[#EFF6FF]/60 border-t border-r border-b border-outline-variant/30">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="lightbulb" size={16} className="text-primary-container" />
            <span className="text-label-md text-primary-container uppercase tracking-wider">
              Recommendation
            </span>
          </div>
          <p className="text-body-md text-on-surface">{s.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
