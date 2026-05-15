import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/lib/wishlist";
import { GameCard } from "@/components/GameCard";
import { GameDetailModal } from "@/components/GameDetailModal";
import type { Game } from "@/lib/rawg";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "My Wishlist — GameDrop" },
      { name: "description", content: "Games you've saved on GameDrop." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { list, remove } = useWishlist();
  const [active, setActive] = useState<Game | null>(null);

  const handleRemove = (game: Game) => {
    remove(game.id);
    toast.message(`Removed "${game.name}" from wishlist`);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-[var(--neon)]">
          <Heart className="h-5 w-5 fill-current" />
          <span className="text-xs font-bold uppercase tracking-widest">My Wishlist</span>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {list.length} {list.length === 1 ? "game" : "games"} saved
        </h1>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-900/40 p-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-zinc-600" />
          <h2 className="mt-4 text-lg font-semibold">Your wishlist is empty</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Browse trending games and tap the heart to save them here.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-[var(--neon)] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
          >
            Explore trending
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {list.map((g) => (
            <GameCard key={g.id} game={g} variant="wishlist" onRemove={handleRemove} onOpen={setActive} />
          ))}
        </div>
      )}

      <GameDetailModal game={active} onClose={() => setActive(null)} />
    </div>
  );
}
