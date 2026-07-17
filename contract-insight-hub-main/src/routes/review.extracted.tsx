import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { contractQueryOptions, useUpdateMetadata } from "@/hooks/use-contract";
import { Icon } from "@/components/ui/icon";
import type { ContractMetadata } from "@/types/contract";

export const Route = createFileRoute("/review/extracted")({
  component: ExtractedPage,
});

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  agreementType: z.string().min(1),
  effectiveDate: z.string().min(1),
  expirationDate: z.string().optional(),
  paymentTerms: z.string().min(1),
  terminationConditions: z.string().min(1),
  contractValue: z.coerce.number().nonnegative(),
  currency: z.string().length(3, "3-letter code"),
  governingLaw: z.string().min(1),
});
type FormValues = z.infer<typeof schema>;

function ExtractedPage() {
  const { id } = Route.useSearch({ select: (s) => ({ id: (s as { id: string }).id }) });
  const { data: contract } = useSuspenseQuery(contractQueryOptions(id));
  const [editing, setEditing] = useState(false);
  const update = useUpdateMetadata(id);

  const defaults: FormValues = {
    title: contract.metadata.title,
    agreementType: contract.metadata.agreementType,
    effectiveDate: contract.metadata.effectiveDate,
    expirationDate: contract.metadata.expirationDate ?? "",
    paymentTerms: contract.metadata.paymentTerms,
    terminationConditions: contract.metadata.terminationConditions,
    contractValue: contract.metadata.contractValue,
    currency: contract.metadata.currency,
    governingLaw: contract.metadata.governingLaw,
  };

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  useEffect(() => {
    form.reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract.id]);

  const onSubmit = form.handleSubmit(async (values) => {
    await update.mutateAsync(values as Partial<ContractMetadata>);
    setEditing(false);
  });

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-headline-lg text-on-surface font-semibold">Extracted Information</h1>
            <p className="text-on-surface-variant text-body-lg">
              Verify AI-extracted fields. Every value is editable.
            </p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 rounded-lg border border-outline-variant text-label-md text-on-surface hover:bg-surface-variant flex items-center gap-1"
            >
              <Icon name="edit" size={16} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  form.reset(defaults);
                  setEditing(false);
                }}
                className="px-4 py-2 rounded-lg border border-outline-variant text-label-md text-on-surface hover:bg-surface-variant"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={update.isPending}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary text-label-md flex items-center gap-1"
              >
                <Icon name="save" size={16} /> Save
              </button>
            </div>
          )}
        </header>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Contract Title" name="title" form={form} editing={editing} />
          <Field label="Agreement Type" name="agreementType" form={form} editing={editing} />
          <Field label="Effective Date" name="effectiveDate" type="date" form={form} editing={editing} />
          <Field label="Expiration Date" name="expirationDate" type="date" form={form} editing={editing} />
          <Field label="Contract Value" name="contractValue" type="number" form={form} editing={editing} />
          <Field label="Currency" name="currency" form={form} editing={editing} />
          <Field label="Governing Law" name="governingLaw" form={form} editing={editing} />
          <div />
          <Field
            label="Payment Terms"
            name="paymentTerms"
            form={form}
            editing={editing}
            textarea
            className="md:col-span-2"
          />
          <Field
            label="Termination Conditions"
            name="terminationConditions"
            form={form}
            editing={editing}
            textarea
            className="md:col-span-2"
          />
        </form>

        <section className="mt-10">
          <h2 className="text-headline-md text-on-surface mb-3 font-semibold">Parties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contract.metadata.parties.map((p) => (
              <div
                key={p.id}
                className="bg-surface border border-outline-variant rounded-xl p-4 elevation-2"
              >
                <p className="text-label-md text-on-surface-variant uppercase">{p.role}</p>
                <p className="text-headline-md text-on-surface">{p.name}</p>
                {p.jurisdiction && (
                  <p className="text-body-md text-on-surface-variant mt-1">
                    Jurisdiction: {p.jurisdiction}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// Field is intentionally simple — production forms could split further, but
// this keeps read/edit toggle logic in one place.
function Field({
  label,
  name,
  form,
  editing,
  type = "text",
  textarea,
  className,
}: {
  label: string;
  name: keyof FormValues;
  form: ReturnType<typeof useForm<FormValues>>;
  editing: boolean;
  type?: string;
  textarea?: boolean;
  className?: string;
}) {
  const err = form.formState.errors[name];
  const val = form.watch(name);
  return (
    <div className={className}>
      <label className="block text-label-md text-on-surface uppercase tracking-wider mb-1">
        {label}
      </label>
      {editing ? (
        textarea ? (
          <textarea
            {...form.register(name)}
            rows={3}
            className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
          />
        ) : (
          <input
            {...form.register(name)}
            type={type}
            className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
          />
        )
      ) : (
        <div className="rounded-lg border border-outline-variant/50 bg-surface-container-low px-3 py-2 text-body-md text-on-surface min-h-[40px]">
          {String(val ?? "—")}
        </div>
      )}
      {err && <p className="text-error text-label-sm mt-1">{err.message as string}</p>}
    </div>
  );
}
