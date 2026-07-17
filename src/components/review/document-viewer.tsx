// Reusable document viewer used by Overview and Risk Analysis tabs.
import { Icon } from "@/components/ui/icon";
import type { ReactNode } from "react";

export function DocumentViewer({
  title,
  rawText,
  children,
}: {
  title: string;
  rawText?: string;
  children?: ReactNode;
}) {
  return (
    <section className="flex-1 flex flex-col border-r border-outline-variant/50 bg-[#F8FAFC] min-w-0">
      <div className="h-12 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between px-4 flex-shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-on-surface-variant hover:bg-surface-variant rounded transition-colors">
            <Icon name="view_sidebar" size={20} />
          </button>
          <div className="w-px h-5 bg-outline-variant/50 mx-1" />
          <span className="text-label-md text-on-surface-variant w-16 text-center">Page 1/14</span>
        </div>
        <div className="flex items-center gap-1 bg-surface-container-low rounded p-0.5">
          <button className="p-1 text-on-surface-variant hover:bg-surface-variant rounded">
            <Icon name="remove" size={18} />
          </button>
          <span className="text-label-md text-on-surface px-2 min-w-[3rem] text-center">100%</span>
          <button className="p-1 text-on-surface-variant hover:bg-surface-variant rounded">
            <Icon name="add" size={18} />
          </button>
        </div>
        <div className="relative">
          <Icon
            name="search"
            size={18}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
          />
          <input
            className="pl-8 pr-3 py-1 bg-surface border border-outline-variant/50 rounded-md text-body-md outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container w-48 placeholder:text-outline-variant"
            placeholder="Find in document..."
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 flex justify-center items-start">
        <div className="w-[640px] min-h-[860px] bg-surface-container-lowest shadow-sm border border-outline-variant/20 p-12 flex flex-col gap-6">
          <div className="border-b-2 border-on-surface pb-4 mb-4">
            <h1 className="text-headline-lg font-bold text-center uppercase tracking-widest text-on-surface">
              {title}
            </h1>
          </div>
          <div className="space-y-4 text-body-md text-on-surface/80 leading-relaxed text-justify whitespace-pre-wrap">
            {rawText ? rawText.split("\n\n").map((para, idx) => <p key={idx}>{para}</p>) : children}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SampleContractBody() {
  return (
    <>
      <p>
        This Software as a Service Agreement (this "Agreement") is entered into as of October 15,
        2023 (the "Effective Date"), by and between <strong>Acme Corp</strong>, a Delaware
        corporation ("Provider"), and <strong>Globex Inc.</strong>, a California corporation
        ("Customer").
      </p>
      <h3 className="font-bold text-on-surface mt-6 uppercase text-sm tracking-wider">
        1. Definitions
      </h3>
      <p>
        "Authorized User" means any employee, contractor, agent, or other individual authorized by
        Customer to access and use the Services.
      </p>
      <h3 className="font-bold text-on-surface mt-6 uppercase text-sm tracking-wider">
        5. Term and Termination
      </h3>
      <div className="border-l-2 border-secondary-container pl-3 py-1 my-2 bg-secondary-container/10">
        <p>
          5.3 Renewal. This Agreement shall automatically renew for successive twelve (12) month
          periods unless either party provides written notice of non-renewal at least ninety (90)
          days prior to the expiration of the then-current term.
        </p>
      </div>
      <h3 className="font-bold text-on-surface mt-6 uppercase text-sm tracking-wider">
        12. Limitation of Liability
      </h3>
      <div className="border-l-2 border-error pl-3 py-1 my-2 bg-error-container/10">
        <p>
          12.2 Liability Cap. Except for obligations regarding confidentiality and indemnification,
          the total aggregate liability of Client shall not exceed the amounts paid under this
          Agreement. Provider liability remains uncapped for indirect damages arising from service
          failures.
        </p>
      </div>
      <h3 className="font-bold text-on-surface mt-6 uppercase text-sm tracking-wider">
        15. General Provisions
      </h3>
      <div className="border-l-2 border-tertiary pl-3 py-1 my-2 bg-tertiary-container/10">
        <p className="italic text-outline">[Section 15.4 Governing Law — Omitted from document]</p>
      </div>
    </>
  );
}
