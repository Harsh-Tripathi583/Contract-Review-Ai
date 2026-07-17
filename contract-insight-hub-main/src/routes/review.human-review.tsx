import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { contractQueryOptions, useAddComment, useSubmitDecision } from "@/hooks/use-contract";
import { Icon } from "@/components/ui/icon";
import type { ReviewDecision } from "@/types/contract";
import { toast } from "sonner";

export const Route = createFileRoute("/review/human-review")({
  component: HumanReviewPage,
});

const decisionSchema = z.object({
  aiFindingsAccepted: z.boolean(),
  riskSeverityValidated: z.boolean(),
  manualNotesAdded: z.boolean(),
  comments: z.string().min(1, "Reviewer comments are required"),
  decision: z.enum(["ready", "minor", "legal", "procurement", "high-risk", "missing-info"]),
});
type DecisionValues = z.infer<typeof decisionSchema>;

const decisionWarnings: Record<ReviewDecision, { color: string; message: string } | null> = {
  ready: null,
  minor: { color: "warn", message: "Reviewer to circulate revisions to counterpart." },
  legal: { color: "warn", message: "Routing to Legal Queue. This action requires department head sign-off." },
  procurement: { color: "warn", message: "Routing to Procurement for pricing and terms review." },
  "high-risk": { color: "error", message: "High risk — escalating to executive review immediately." },
  "missing-info": { color: "warn", message: "Requesting missing information from document owner." },
};

function HumanReviewPage() {
  const { id } = Route.useSearch({ select: (s) => ({ id: (s as { id: string }).id }) });
  const { data: contract } = useSuspenseQuery(contractQueryOptions(id));
  const submit = useSubmitDecision(id);
  const addComment = useAddComment(id);

  const form = useForm<DecisionValues>({
    resolver: zodResolver(decisionSchema),
    defaultValues: {
      aiFindingsAccepted: true,
      riskSeverityValidated: true,
      manualNotesAdded: false,
      comments: contract.comments[0]?.message ?? "",
      decision: "legal",
    },
  });

  const decision = form.watch("decision");
  const warn = decisionWarnings[decision];

  const onSubmit = form.handleSubmit(async (values) => {
    await submit.mutateAsync({
      decision: values.decision,
      comments: values.comments,
      checklist: {
        aiFindingsAccepted: values.aiFindingsAccepted,
        riskSeverityValidated: values.riskSeverityValidated,
        manualNotesAdded: values.manualNotesAdded,
      },
    });
    await addComment.mutateAsync({
      author: "You",
      message: values.comments,
      target: { type: "general" },
    });
    toast.success("Decision submitted");
  });

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[900px] mx-auto">
        <header className="mb-8">
          <h1 className="text-headline-lg text-on-surface font-semibold mb-1">
            Final Review & Decision
          </h1>
          <p className="text-on-surface-variant text-body-lg">
            Verify AI findings and provide your final determination for this contract.
          </p>
        </header>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface border border-outline-variant rounded-xl p-6 elevation-2 flex flex-col gap-4 h-fit">
            <h3 className="text-headline-md text-on-surface border-b border-outline-variant/50 pb-2 mb-1">
              Review Checklist
            </h3>
            <Check label="AI findings accepted" name="aiFindingsAccepted" form={form} />
            <Check label="Risk severity validated" name="riskSeverityValidated" form={form} />
            <Check label="Manual notes added" name="manualNotesAdded" form={form} />
          </div>

          <div className="md:col-span-2 bg-surface border border-outline-variant rounded-xl p-6 elevation-2 flex flex-col gap-6">
            <div>
              <label
                htmlFor="reviewer-comments"
                className="block text-label-md text-on-surface uppercase tracking-wider mb-2"
              >
                Reviewer Comments
              </label>
              <textarea
                id="reviewer-comments"
                rows={4}
                {...form.register("comments")}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none resize-y"
                placeholder="e.g., Legal team needs to double-check the IP indemnity section before we sign off."
              />
              {form.formState.errors.comments && (
                <p className="text-error text-label-sm mt-1">
                  {form.formState.errors.comments.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="final-decision"
                className="block text-label-md text-on-surface uppercase tracking-wider mb-2"
              >
                Final Decision
              </label>
              <select
                id="final-decision"
                {...form.register("decision")}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
              >
                <option value="ready">Ready for Review</option>
                <option value="minor">Minor Revisions Recommended</option>
                <option value="legal">Legal Review Required</option>
                <option value="procurement">Procurement Review Required</option>
                <option value="high-risk">High Risk — Immediate Review</option>
                <option value="missing-info">Request Missing Information</option>
              </select>

              {warn && (
                <div
                  className={`mt-4 border-l-2 p-3 rounded-r-md flex items-start gap-2 ${
                    warn.color === "error"
                      ? "bg-error-container border-error"
                      : "bg-warn-bg"
                  }`}
                  style={warn.color !== "error" ? { borderLeftColor: "var(--color-warn-fg)" } : {}}
                >
                  <Icon
                    name="warning"
                    size={18}
                    className={warn.color === "error" ? "text-on-error-container" : ""}
                    style={warn.color !== "error" ? { color: "var(--color-warn-fg)" } : {}}
                  />
                  <p
                    className={`text-body-md font-medium ${
                      warn.color === "error" ? "text-on-error-container" : ""
                    }`}
                    style={warn.color !== "error" ? { color: "var(--color-warn-fg)" } : {}}
                  >
                    {warn.message}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-outline-variant">
            <div className="flex gap-4 w-full md:w-auto">
              <button
                type="button"
                className="flex-1 md:flex-none bg-surface border border-outline-variant text-on-surface px-6 py-2 rounded-lg text-label-md hover:bg-surface-variant transition-colors"
              >
                Save Draft
              </button>
              <button
                type="submit"
                disabled={submit.isPending}
                className="flex-1 md:flex-none bg-primary-container text-on-primary px-6 py-2 rounded-lg text-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
              >
                <Icon name="check_circle" size={18} />
                {submit.isPending ? "Submitting…" : "Submit Decision"}
              </button>
            </div>
            <button
              type="button"
              className="text-primary text-label-md hover:underline flex items-center gap-1 px-2 py-1"
            >
              <Icon name="download" size={18} />
              Export Report
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-outline-variant/30 flex items-center gap-4 text-on-surface-variant text-label-sm overflow-x-auto pb-2">
          {contract.audit.map((e, i) => (
            <div key={e.id} className="flex items-center gap-4 shrink-0">
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Icon name={e.icon ?? "history"} size={14} /> {e.action}
              </span>
              {i < contract.audit.length - 1 && (
                <span className="w-1 h-1 rounded-full bg-outline-variant shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Check({
  label,
  name,
  form,
}: {
  label: string;
  name: "aiFindingsAccepted" | "riskSeverityValidated" | "manualNotesAdded";
  form: ReturnType<typeof useForm<DecisionValues>>;
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer group">
      <input
        type="checkbox"
        {...form.register(name)}
        className="mt-1 w-4 h-4 accent-primary-container rounded"
      />
      <span className="text-on-surface group-hover:text-primary transition-colors text-body-md">
        {label}
      </span>
    </label>
  );
}
