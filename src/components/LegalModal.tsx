import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

export function LegalModal({ open, onClose, kind }: { open: boolean; onClose: () => void; kind: "terms" | "privacy" | null }) {
  const title = kind === "terms" ? "Terms of Service" : "Privacy Policy";
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-zinc-950 border-white/10 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-[var(--neon)]">{title}</DialogTitle>
          <DialogDescription className="text-white/60">Please read carefully.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-white/80 leading-relaxed">
          {Array.from({ length: 5 }).map((_, i) => (
            <p key={i}>{LOREM}</p>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
