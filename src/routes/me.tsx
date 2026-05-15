import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, UserCircle2 } from "lucide-react";
import { useAuth, RECOMMEND_TAGS } from "@/lib/auth";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/me")({
  head: () => ({ meta: [{ title: "My Page — GameDrop" }] }),
  component: MyPage,
});

function MyPage() {
  const { user, loading, withdraw } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (!user) return null;

  const tagLabels = RECOMMEND_TAGS
    .filter((t) => user.favoriteTags.includes(t.slug))
    .map((t) => t.label);

  async function onDelete() {
    setDeleting(true);
    try {
      await withdraw();
      toast.success("Account deleted");
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[var(--neon)]/10 via-zinc-900 to-zinc-950 p-8">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--neon)]/20 text-[var(--neon)] ring-1 ring-[var(--neon)]/40">
            <UserCircle2 className="h-9 w-9" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{user.username}</h1>
            <p className="text-sm text-white/60">GameDrop member</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-white/70">Favorite tags</h2>
        {tagLabels.length === 0 ? (
          <p className="mt-3 text-sm text-white/60">
            No favorite tags yet.{" "}
            <Link to="/" className="font-semibold text-[var(--neon)] hover:underline">
              Pick some on the home page
            </Link>
            .
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {tagLabels.map((t) => (
              <span
                key={t}
                className="rounded-full bg-[var(--neon)]/15 px-3 py-1 text-sm font-semibold text-[var(--neon)] ring-1 ring-[var(--neon)]/30"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-red-300">Danger zone</h2>
        <p className="mt-2 text-sm text-white/70">
          Deleting your account is permanent. All saved tags and wishlist data tied to this account will be removed.
        </p>
        <button
          onClick={() => setConfirmOpen(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-600"
        >
          <Trash2 className="h-4 w-4" />
          Delete Account
        </button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete your account?</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to delete your account? All your data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setConfirmOpen(false)}
              className="rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              disabled={deleting}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
