import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { contractQueryOptions } from "@/hooks/use-contract";
import { Icon } from "@/components/ui/icon";

export const Route = createFileRoute("/review/audit-trail")({
  component: AuditPage,
});

function AuditPage() {
  const { id } = Route.useSearch({ select: (s) => ({ id: (s as { id: string }).id }) });
  const { data: contract } = useSuspenseQuery(contractQueryOptions(id));
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-headline-lg text-on-surface font-semibold mb-1">Audit Trail</h1>
        <p className="text-on-surface-variant text-body-lg mb-8">
          Complete history of actions on this contract.
        </p>
        <ol className="relative border-l-2 border-outline-variant/40 ml-3 space-y-6">
          {contract.audit.map((e) => (
            <li key={e.id} className="ml-6">
              <span className="absolute -left-[13px] w-6 h-6 rounded-full bg-primary-fixed grid place-items-center">
                <Icon name={e.icon ?? "history"} size={14} className="text-primary" />
              </span>
              <div className="bg-surface border border-outline-variant rounded-xl p-4 elevation-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-headline-md text-on-surface">{e.action}</p>
                  <p className="text-label-sm text-on-surface-variant">
                    {new Date(e.timestamp).toLocaleString()}
                  </p>
                </div>
                <p className="text-body-md text-on-surface-variant">
                  by <span className="font-medium text-on-surface">{e.actor}</span>
                  {e.detail ? ` — ${e.detail}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
