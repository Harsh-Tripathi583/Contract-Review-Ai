import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { contractQueryOptions } from "@/hooks/use-contract";
import { Icon } from "@/components/ui/icon";

export const Route = createFileRoute("/review/clauses")({
  component: ClausesPage,
});

function ClausesPage() {
  const { id } = Route.useSearch({ select: (s) => ({ id: (s as { id: string }).id }) });
  const { data: contract } = useSuspenseQuery(contractQueryOptions(id));

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-headline-lg text-on-surface font-semibold mb-1">Clauses</h1>
        <p className="text-on-surface-variant text-body-lg mb-6">
          {contract.clauses.length} clauses extracted by AI.
        </p>
        <ul className="flex flex-col gap-3">
          {contract.clauses.map((c) => (
            <li
              key={c.id}
              className="bg-surface border border-outline-variant rounded-xl p-4 elevation-2"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="text-label-md text-on-surface-variant uppercase">
                    Section {c.section}
                  </p>
                  <h3 className="text-headline-md text-on-surface">{c.title}</h3>
                </div>
                <div className="flex items-center gap-3 text-label-sm text-on-surface-variant">
                  {c.page && (
                    <span className="flex items-center gap-1">
                      <Icon name="find_in_page" size={14} /> Page {c.page}
                    </span>
                  )}
                  {c.confidence !== undefined && (
                    <span className="flex items-center gap-1 text-primary">
                      <Icon name="verified" size={14} /> {Math.round(c.confidence * 100)}%
                    </span>
                  )}
                </div>
              </div>
              <p className="text-body-md text-on-surface-variant">{c.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
