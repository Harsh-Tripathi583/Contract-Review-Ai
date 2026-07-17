import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DocumentViewer, SampleContractBody } from "@/components/review/document-viewer";
import { contractQueryOptions, useUpdateRisk } from "@/hooks/use-contract";
import { Icon } from "@/components/ui/icon";
import type { Risk, RiskSeverity } from "@/types/contract";

export const Route = createFileRoute("/review/risks")({
  component: RisksPage,
});

const severityBadge: Record<RiskSeverity, { label: string; bg: string; fg: string; bar: string }> = {
  critical: { label: "Critical", bg: "bg-error-container", fg: "text-on-error-container", bar: "bg-error" },
  high: { label: "High", bg: "bg-error-container", fg: "text-on-error-container", bar: "bg-error" },
  medium: { label: "Medium", bg: "bg-secondary-container", fg: "text-on-secondary-container", bar: "bg-secondary" },
  low: { label: "Low", bg: "bg-tertiary-container", fg: "text-on-tertiary-container", bar: "bg-tertiary" },
};

function RisksPage() {
  const { id } = Route.useSearch({ select: (s) => ({ id: (s as { id: string }).id }) });
  const { data: contract } = useSuspenseQuery(contractQueryOptions(id));

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <DocumentViewer title="Master Services Agreement">
        <SampleContractBody />
      </DocumentViewer>

      <aside className="w-[440px] flex-shrink-0 bg-surface flex flex-col overflow-hidden shadow-[-4px_0_12px_rgba(0,0,0,0.02)]">
        <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
          <div>
            <h2 className="text-headline-md text-on-surface font-semibold">Risk Analysis</h2>
            <p className="text-label-sm text-on-surface-variant mt-1">
              {contract.risks.length} Issues Identified
            </p>
          </div>
          <button className="text-on-surface-variant hover:text-primary p-2 rounded hover:bg-surface transition-colors">
            <Icon name="filter_list" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <BentoCard label="Legal" value="High" color="text-error" icon="error" filled />
            <BentoCard label="Commercial" value="Low" color="text-tertiary" icon="check_circle" />
            <BentoCard label="Operational" value="Medium" color="text-secondary" icon="warning" />
            <BentoCard label="Compliance" value="Low" color="text-tertiary" icon="check_circle" />
          </div>
          <div className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2">
            Detailed Findings
          </div>
          {contract.risks.map((r) => (
            <RiskCard key={r.id} risk={r} contractId={id} />
          ))}
        </div>
      </aside>
    </div>
  );
}

function BentoCard({
  label,
  value,
  color,
  icon,
  filled,
}: {
  label: string;
  value: string;
  color: string;
  icon: string;
  filled?: boolean;
}) {
  return (
    <div className="bg-surface border border-outline-variant rounded-lg p-2 flex flex-col justify-between h-20">
      <span className="text-label-sm text-on-surface-variant uppercase">{label}</span>
      <div className="flex items-center justify-between">
        <span className={`text-headline-md font-semibold ${color}`}>{value}</span>
        <Icon name={icon} className={color} filled={filled} />
      </div>
    </div>
  );
}

function RiskCard({ risk, contractId }: { risk: Risk; contractId: string }) {
  const badge = severityBadge[risk.severity];
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    severity: risk.severity,
    reviewerNote: risk.reviewerNote ?? "",
  });
  const [status, setStatus] = useState(risk.status ?? "open");
  const updateRisk = useUpdateRisk(contractId);

  const save = () => {
    updateRisk.mutate({ id: risk.id, ...draft });
    setEditing(false);
  };

  return (
    <div className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden relative shadow-sm">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${badge.bar}`} />
      <div className="p-4 pl-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-body-lg font-semibold text-on-surface">{risk.title}</h3>
          <span className={`${badge.bg} ${badge.fg} text-label-sm px-2 py-1 rounded`}>
            {badge.label}
          </span>
        </div>
        <p className="text-body-md text-on-surface-variant mb-3">{risk.description}</p>

        <div className="bg-surface-container-highest rounded p-3 mb-3 border border-outline-variant/50">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="psychology" size={16} className="text-primary" />
            <span className="text-label-sm text-on-surface font-semibold">AI Reasoning</span>
          </div>
          <p className="text-label-md text-on-surface-variant font-normal">{risk.reasoning}</p>
        </div>

        <div className="flex items-start gap-2 mb-4 text-body-md text-on-surface">
          <Icon name="lightbulb" size={18} className="text-primary mt-0.5" />
          <div>
            <span className="font-medium">Recommendation:</span> {risk.recommendation}
          </div>
        </div>

        {editing && (
          <div className="mb-4 space-y-2 p-3 rounded bg-surface-container-low border border-outline-variant">
            <label className="text-label-md text-on-surface-variant uppercase">Severity</label>
            <select
              value={draft.severity}
              onChange={(e) => setDraft((d) => ({ ...d, severity: e.target.value as RiskSeverity }))}
              className="w-full px-2 py-1 border border-outline-variant rounded bg-surface text-body-md"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <label className="text-label-md text-on-surface-variant uppercase">Reviewer Note</label>
            <textarea
              value={draft.reviewerNote}
              onChange={(e) => setDraft((d) => ({ ...d, reviewerNote: e.target.value }))}
              rows={2}
              className="w-full px-2 py-1 border border-outline-variant rounded bg-surface text-body-md"
              placeholder="Add reviewer note…"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditing(false)}
                className="text-label-md px-3 py-1 rounded border border-outline-variant"
              >
                Cancel
              </button>
              <button
                onClick={save}
                className="text-label-md px-3 py-1 rounded bg-primary-container text-on-primary"
              >
                Save
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-outline-variant pt-3 mt-1">
          <div className="flex gap-3">
            <div className="flex items-center gap-1 text-label-sm text-on-surface-variant">
              <Icon name="find_in_page" size={14} /> Page {risk.page}
            </div>
            <div className="flex items-center gap-1 text-label-sm text-primary">
              <Icon name="verified" size={14} /> {Math.round(risk.confidence * 100)}% Match
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {status !== "open" && (
              <span
                className={`text-label-sm px-2 py-0.5 rounded ${
                  status === "accepted" ? "bg-tertiary-container text-on-tertiary-container" : "bg-error-container text-on-error-container"
                }`}
              >
                {status}
              </span>
            )}
            <button
              onClick={() => setEditing((v) => !v)}
              className="text-on-surface-variant hover:text-primary"
              aria-label="Edit"
            >
              <Icon name="edit" size={18} />
            </button>
            <button
              onClick={() => {
                setStatus("accepted");
                updateRisk.mutate({ id: risk.id, status: "accepted" });
              }}
              className="text-on-surface-variant hover:text-tertiary"
              aria-label="Accept"
            >
              <Icon name="check" size={18} />
            </button>
            <button
              onClick={() => {
                setStatus("rejected");
                updateRisk.mutate({ id: risk.id, status: "rejected" });
              }}
              className="text-on-surface-variant hover:text-error"
              aria-label="Reject"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
