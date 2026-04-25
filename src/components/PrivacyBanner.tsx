import { Shield } from "lucide-react";

export default function PrivacyBanner() {
  return (
    <div className="glass rounded-xl p-3 flex gap-3 items-start text-xs">
      <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
      <p className="text-muted-foreground leading-relaxed">
        <span className="text-foreground font-medium">On-Device-Personalisierung denkbar.</span>{" "}
        Nur ein anonymisierter Intent-Tag wird gesendet — keine Profile, keine Standorte.
      </p>
    </div>
  );
}
