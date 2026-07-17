import { Icon } from "@/components/ui/icon";

export function LoadingSkeleton() {
  return (
    <div className="flex-1 grid place-items-center p-12">
      <div className="flex items-center gap-3 text-on-surface-variant">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-body-md">Loading review workspace…</span>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  message,
  icon = "inbox",
}: {
  title: string;
  message: string;
  icon?: string;
}) {
  return (
    <div className="flex-1 grid place-items-center p-12 text-center">
      <div className="max-w-sm">
        <div className="w-14 h-14 rounded-full bg-surface-container-low grid place-items-center mx-auto mb-4">
          <Icon name={icon} size={28} className="text-on-surface-variant" />
        </div>
        <h3 className="text-headline-md text-on-surface mb-1">{title}</h3>
        <p className="text-body-md text-on-surface-variant">{message}</p>
      </div>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div className="flex-1 grid place-items-center p-12 text-center">
      <div className="max-w-sm">
        <div className="w-14 h-14 rounded-full bg-error-container grid place-items-center mx-auto mb-4">
          <Icon name="error" size={28} className="text-on-error-container" />
        </div>
        <h3 className="text-headline-md text-on-surface mb-1">Something went wrong</h3>
        <p className="text-body-md text-on-surface-variant mb-4">{error.message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-lg bg-primary-container text-on-primary text-label-md hover:opacity-90"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
