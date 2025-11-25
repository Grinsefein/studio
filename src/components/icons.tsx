import { ShieldCheck } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <ShieldCheck className="h-7 w-7" />
      <span className="text-xl font-bold tracking-tight text-foreground">
        Recon Sentinel
      </span>
    </div>
  );
}
