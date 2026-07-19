import { createFileRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";
import { SideNavBar, TopNavBar } from "@/components/layout/chrome";
import { contractQueryOptions } from "@/hooks/use-contract";

// Search-param carries the contract id across all review sub-routes so a
// direct link can restore state without navigation state hacks.
const reviewSearch = z.object({
  id: z.string().default("c-1001"),
});

export const Route = createFileRoute("/review")({
  validateSearch: reviewSearch,
  loaderDeps: ({ search }) => ({ id: search.id }),
  loader: ({ context, deps }) => {
    console.log("Parent Route (/review) Loader - deps.id:", deps.id);
    return context.queryClient.ensureQueryData(contractQueryOptions(deps.id));
  },
  component: ReviewLayout,
  head: () => ({
    meta: [
      { title: "Review Workspace — Contract Review AI" },
      {
        name: "description",
        content:
          "AI-assisted contract review workspace with clauses, risks, obligations and audit trail.",
      },
    ],
  }),
});

function ReviewLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavBar current="review" />
      <div className="flex flex-1 pt-16 min-h-0">
        <SideNavBar />
        <main className="ml-64 flex-1 min-w-0 flex flex-col bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
