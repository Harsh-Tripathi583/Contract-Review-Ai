import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DocumentViewer, SampleContractBody } from "@/components/review/document-viewer";
import { contractQueryOptions } from "@/hooks/use-contract";
import { Icon } from "@/components/ui/icon";

export const Route = createFileRoute("/review/")({
  component: OverviewPage,
});

function OverviewPage() {
  const search = Route.useSearch();
  console.log("Child Route (/review/) OverviewPage - Route.useSearch() returned:", search);
  const { id } = Route.useSearch({ select: (s) => ({ id: (s as { id: string }).id }) });
  console.log("Child Route (/review/) OverviewPage - extracted id:", id);
  const { data: contract } = useSuspenseQuery(contractQueryOptions(id));

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <DocumentViewer title={contract.metadata.title} rawText={contract.rawText}>
        <SampleContractBody />
      </DocumentViewer>

      <aside className="w-[380px] flex-shrink-0 bg-surface-container-lowest border-l border-outline-variant/30 flex flex-col overflow-hidden shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.02)]">
        <div className="p-4 border-b border-outline-variant/30 bg-surface/50 sticky top-0 z-10">
          <h2 className="text-headline-md text-on-surface mb-2 font-semibold">Analysis Overview</h2>
          <div className="bg-warn-bg border border-warn-fg/30 rounded-lg p-3 flex items-start gap-3">
            <Icon name="warning" size={20} className="text-warn-fg flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-label-md font-bold" style={{ color: "var(--color-warn-fg)" }}>
                Medium Risk Identified
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--color-warn-fg)" }}>
                {contract.summary.recommendation}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-2">
            <ScoreCard
              label="Overall Risk"
              value={contract.summary.overallRiskScore}
              suffix="/100"
              tint="warn"
            />
            <ScoreCard
              label="AI Confidence"
              value={contract.summary.aiConfidence}
              suffix="%"
              tint="tertiary"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2">
              Key Metadata
            </h3>
            <ul className="flex flex-col gap-2">
              <MetaRow label="Title" value={contract.metadata.title} />
              <MetaRow label="Type" value={contract.metadata.agreementType} />
              <MetaRow
                label="Value"
                value={`$${contract.metadata.contractValue.toLocaleString()} ${contract.metadata.currency}`}
              />
              <MetaRow label="Governing Law" value={contract.metadata.governingLaw} />
              <MetaRow label="Effective Date" value={contract.metadata.effectiveDate} />
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[#EFF6FF]/60 border-l-2 border-primary-container border-t border-r border-b border-outline-variant/30 relative overflow-hidden">
            <div className="absolute top-2 right-2 opacity-10">
              <Icon name="auto_awesome" size={36} className="text-primary" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="info" size={16} className="text-primary-container" />
              <span className="text-label-sm text-primary-container uppercase tracking-wider font-semibold">
                AI Insight
              </span>
            </div>
            <p className="text-body-md text-on-surface leading-relaxed relative z-10">
              {contract.summary.headline}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  suffix,
  tint,
}: {
  label: string;
  value: number;
  suffix: string;
  tint: "warn" | "tertiary";
}) {
  const color = tint === "warn" ? "var(--color-warn-fg)" : "var(--color-tertiary-container)";
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
      <span className="text-label-md text-on-surface-variant mb-1">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-display font-bold" style={{ color }}>
          {value}
        </span>
        <span className="text-label-sm text-outline">{suffix}</span>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex justify-between items-center py-2 border-b border-surface-variant/50 last:border-0 gap-4">
      <span className="text-body-md text-on-surface-variant">{label}</span>
      <span className="text-label-md text-on-surface truncate max-w-[200px]" title={value}>
        {value}
      </span>
    </li>
  );
}
