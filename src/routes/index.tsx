import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Flame, Loader2 } from "lucide-react";
import { getGames, GENRE_FILTERS, type Game } from "@/lib/rawg";
import { GameCard } from "@/components/GameCard";
import { GameGridSkeleton } from "@/components/GameGridSkeleton";
import { GameDetailModal } from "@/components/GameDetailModal";
import { useWishlist } from "@/lib/wishlist";
import { useAuth } from "@/lib/auth";
import { RecommendationsSection } from "@/components/RecommendationsSection";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trending — GameDrop" },
      { name: "description", content: "The hottest games right now, curated from RAWG." },
    ],
  }),
  component: TrendingPage,
});

function TrendingPage() {
  const [games, setGames] = useState<Game[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [genre, setGenre] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [active, setActive] = useState<Game | null>(null);
  const { has, toggle } = useWishlist();
  const { user } = useAuth();

  // Initial / genre change load
  useEffect(() => {
    let cancelled = false;
    setGames(null);
    setError(null);
    setPage(1);
    getGames({ genre, page: 1 })
      .then((data) => {
        if (cancelled) return;
        setGames(data.results);
        setHasNext(Boolean(data.next));
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [genre]);

  const loadMore = async () => {
    if (loadingMore || !hasNext) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const data = await getGames({ genre, page: next });
      setGames((cur) => [...(cur ?? []), ...data.results]);
      setPage(next);
      setHasNext(Boolean(data.next));
    } catch (e) {
      toast.error("Failed to load more games");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleToggle = (game: Game) => {
    const added = toggle(game);
    toast[added ? "success" : "message"](
      added ? `Added "${game.name}" to wishlist` : `Removed "${game.name}" from wishlist`
    );
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[var(--neon)]/10 via-zinc-900 to-zinc-950 p-8 sm:p-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--neon)]/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-[var(--neon)]">
            <Flame className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Trending now</span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
            What the world is <span className="text-[var(--neon)]">playing</span>.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-foreground/70 sm:text-base">
            Curated from millions of players. Hover a card for details, tap the heart to save it.
          </p>
        </div>
      </section>

      {user && <RecommendationsSection />}

      {/* Genre filters */}
      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 pb-1">
          {GENRE_FILTERS.map((f) => {
            const active = genre === f.slug;
            return (
              <button
                key={f.label}
                onClick={() => setGenre(f.slug)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition-all duration-200",
                  active
                    ? "bg-[var(--neon)] text-black ring-[var(--neon)] shadow-[var(--neon-glow)]"
                    : "bg-white/5 text-white/80 ring-white/10 hover:bg-white/10 hover:text-white"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          Failed to load games: {error}
        </div>
      )}

      {!games && !error && <GameGridSkeleton />}

      {games && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {games.map((g) => (
              <GameCard key={g.id} game={g} inWishlist={has(g.id)} onToggle={handleToggle} onOpen={setActive} />
            ))}
          </div>

          {games.length === 0 && (
            <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-8 text-center text-sm text-white/60">
              No games found for this filter.
            </div>
          )}

          {hasNext && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-full bg-white/5 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-[var(--neon)] hover:text-black hover:ring-[var(--neon)] hover:shadow-[var(--neon-glow)] disabled:opacity-60"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </>
      )}

      <GameDetailModal game={active} onClose={() => setActive(null)} />
    </div>
  );
}
