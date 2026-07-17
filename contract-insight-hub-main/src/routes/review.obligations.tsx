import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { contractQueryOptions } from "@/hooks/use-contract";
import { Icon } from "@/components/ui/icon";

export const Route = createFileRoute("/review/obligations")({
  component: ObligationsPage,
});

function ObligationsPage() {
  const { id } = Route.useSearch({ select: (s) => ({ id: (s as { id: string }).id }) });
  const { data: contract } = useSuspenseQuery(contractQueryOptions(id));
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-headline-lg text-on-surface font-semibold mb-1">Obligations</h1>
        <p className="text-on-surface-variant text-body-lg mb-6">
          Actionable commitments for each party.
        </p>
        <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden elevation-2">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr className="text-label-md text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-4">Party</th>
                <th className="py-3 px-4">Obligation</th>
                <th className="py-3 px-4">Clause</th>
                <th className="py-3 px-4">Due</th>
                <th className="py-3 px-4">Type</th>
              </tr>
            </thead>
            <tbody>
              {contract.obligations.map((o) => (
                <tr key={o.id} className="border-t border-outline-variant/50 text-body-md">
                  <td className="py-3 px-4 font-semibold text-on-surface">{o.party}</td>
                  <td className="py-3 px-4 text-on-surface-variant">{o.description}</td>
                  <td className="py-3 px-4 text-on-surface-variant">{o.clauseRef ?? "—"}</td>
                  <td className="py-3 px-4 text-on-surface-variant">{o.dueDate ?? "—"}</td>
                  <td className="py-3 px-4">
                    <span className="text-label-sm bg-secondary-container text-on-secondary-container px-2 py-1 rounded flex items-center gap-1 w-max">
                      <Icon name="schedule" size={14} /> {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
