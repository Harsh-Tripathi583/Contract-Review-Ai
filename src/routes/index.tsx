import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@/components/ui/icon";
import { TopNavBar } from "@/components/layout/chrome";
import { useUploadContract } from "@/hooks/use-contract";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: UploadPage,
  head: () => ({
    meta: [
      { title: "Upload Contract — Contract Review AI" },
      {
        name: "description",
        content:
          "Upload a PDF, DOCX, or TXT contract and start an AI-assisted analysis in seconds.",
      },
    ],
  }),
});

const uploadSchema = z.object({
  file: z
    .instanceof(File, { message: "Select a contract file" })
    .refine((f) => f.size <= 50 * 1024 * 1024, "Max size is 50MB")
    .refine((f) => /\.(pdf|docx|txt)$/i.test(f.name), "File must be PDF, DOCX or TXT"),
});
type UploadValues = z.infer<typeof uploadSchema>;

function UploadPage() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const upload = useUploadContract();

  const form = useForm<UploadValues>({ resolver: zodResolver(uploadSchema) });

  const handleFile = useCallback(
    (f: File | undefined) => {
      if (!f) return;
      setFile(f);
      form.setValue("file", f, { shouldValidate: true });
    },
    [form],
  );

  const onSubmit = form.handleSubmit(async ({ file }) => {
    setProcessing(true);
    try {
      const { contractId } = await upload.mutateAsync(file);
      // Small artificial delay so processing UI is visible on demo.
      await new Promise<void>((resolve) => window.setTimeout(resolve, 1800));
      await navigate({ to: "/review", search: { id: contractId } });
    } catch (error) {
      console.error("Contract upload or review navigation failed", error);
      fetch("http://localhost:8000/api/log-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : "Error",
          errorObj: String(error)
        })
      }).catch(() => {});
      setProcessing(false);
      toast.error("Analysis could not be opened. Check the API connection and try again.");
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <TopNavBar />
      <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-12 px-4 md:px-8 relative">
        {!processing && (
          <form
            onSubmit={onSubmit}
            className="w-full max-w-3xl flex flex-col items-center text-center gap-6"
          >
            <div className="space-y-2 mb-2">
              <h2 className="text-display font-display font-bold text-on-surface">
                Upload Contract
              </h2>
              <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
                Upload a contract to analyze risks, extract clauses, identify obligations, and
                generate an AI-assisted review.
              </p>
            </div>

            <label
              htmlFor="file-upload"
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                handleFile(e.dataTransfer.files[0]);
              }}
              className={`w-full relative bg-surface-container-lowest border-2 border-dashed rounded-xl p-12 transition-all duration-300 hover:border-primary hover:bg-surface-container flex flex-col items-center justify-center cursor-pointer group ${
                dragActive ? "drag-active" : "border-outline-variant"
              }`}
            >
              <div className="w-20 h-20 bg-surface-container-low rounded-full grid place-items-center mb-4 group-hover:bg-primary-fixed transition-colors">
                <Icon name="description" size={40} className="text-primary" />
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface mb-1">
                {file ? file.name : "Drag & drop your file here"}
              </h3>
              <p className="text-body-md text-on-surface-variant mb-4">
                or click to browse from your computer
              </p>
              <div className="flex items-center gap-2 text-label-md text-secondary">
                <span className="px-2 py-1 bg-surface-variant rounded-md">PDF</span>
                <span className="px-2 py-1 bg-surface-variant rounded-md">DOCX</span>
                <span className="px-2 py-1 bg-surface-variant rounded-md">TXT</span>
                <span className="text-outline mx-2">•</span>
                <span>Max size 50MB</span>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.docx,.txt"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>

            {form.formState.errors.file && (
              <p className="text-error text-body-md">{form.formState.errors.file.message}</p>
            )}

            <div className="flex items-center gap-1 text-on-tertiary-fixed-variant bg-tertiary-fixed-dim/20 px-4 py-2 rounded-full text-label-sm">
              <Icon name="auto_awesome" size={16} />
              <span>AI-assisted contract analysis</span>
            </div>

            <div className="flex gap-4 pt-2 w-full justify-center">
              <button
                type="button"
                onClick={() => document.getElementById("file-upload")?.click()}
                className="px-6 py-3 rounded-lg border border-outline-variant text-label-md text-on-surface hover:bg-surface-variant transition-colors"
              >
                Browse Files
              </button>
              <button
                type="submit"
                disabled={!file}
                className="px-6 py-3 rounded-lg bg-primary-container text-on-primary text-label-md shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze Contract
              </button>
            </div>
          </form>
        )}

        {processing && <ProcessingView fileName={file?.name ?? "document.pdf"} />}
      </main>
    </div>
  );
}

const steps = [
  { label: "Reading document", done: true },
  { label: "Extracting text", done: true },
  { label: "Identifying clauses...", active: true },
  { label: "Extracting obligations" },
  { label: "Detecting risks" },
  { label: "Calculating confidence" },
  { label: "Generating executive summary" },
  { label: "Preparing review workspace" },
];

function ProcessingView({ fileName }: { fileName: string }) {
  return (
    <div className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed-dim/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <div className="flex items-center justify-between mb-12 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-fixed rounded-xl grid place-items-center">
            <Icon name="memory" size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface">
              Processing Document...
            </h2>
            <p className="text-body-md text-on-surface-variant">AI is analyzing {fileName}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[32px] font-bold text-primary">45%</span>
        </div>
      </div>

      <div className="w-full h-2 bg-surface-container-high rounded-full mb-12 overflow-hidden">
        <div className="h-full bg-primary-container rounded-full relative" style={{ width: "45%" }}>
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/40 rounded-full ai-pulse-dot" />
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {steps.map((s) => (
          <div
            key={s.label}
            className={`step-item flex items-center gap-4 ${!s.done && !s.active ? "opacity-50" : ""}`}
          >
            {s.done ? (
              <div className="w-6 h-6 rounded-full bg-tertiary-fixed-dim grid place-items-center flex-shrink-0">
                <Icon name="check" size={14} className="text-on-tertiary-fixed-variant" />
              </div>
            ) : s.active ? (
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-outline-variant flex-shrink-0" />
            )}
            <span
              className={s.active ? "text-label-md text-primary" : "text-body-md text-on-surface"}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
