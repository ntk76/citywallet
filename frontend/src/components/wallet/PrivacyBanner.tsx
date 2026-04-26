import { ShieldCheck } from "lucide-react";

export function PrivacyBanner() {
  return (
    <div className="frosted flex items-start gap-2 rounded-2xl border border-border px-3 py-2 text-xs text-muted-foreground">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
      <p>
        On-device personalization is possible — only your <strong>intent</strong> is sent, no profile data.
      </p>
    </div>
  );
}
