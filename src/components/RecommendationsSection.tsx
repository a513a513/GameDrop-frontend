import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth, RECOMMEND_TAGS } from "@/lib/auth";
import { getRecommendations } from "@/lib/recommendations";
import { useWishlist } from "@/lib/wishlist";
import { GameCard } from "@/components/GameCard";
import { GameDetailModal } from "@/components/GameDetailModal";
import type { Game } from "@/lib/rawg";
import { cn } from "@/lib/utils";

export function RecommendationsSection() {
  const { user, updateFavoriteTags } = useAuth();
  const { has, toggle } = useWishlist();
  const [selected, setSelected] = useState<string[]>(user?.favoriteTags ?? []);
  const [games, setGames] = useState<Game[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<Game | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync from user changes (login/logout)
  useEffect(() => { setSelected(user?.favoriteTags ?? []); }, [user?.username]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRecommendations(selected)
      .then((res) => { if (!cancelled) setGames(res); })
      .catch(() => { if (!cancelled) toast.error("Failed to load recommendations"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selected.join(",")]);

  if (!user) return null;

  function toggleTag(slug: string) {
    const next = selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug];
    setSelected(next);
    updateFavoriteTags(next);
  }

  const scroll = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });
  };

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--neon)]/20 bg-gradient-to-br from-[var(--neon)]/10 via-zinc-900/60 to-zinc-950 p-6 sm:p-8">
      <div className="flex items-center gap-2 text-[var(--neon)]">
        <Sparkles className="h-5 w-5" />
        <span className="text-xs font-bold uppercase tracking-widest">Personalized</span>
      </div>
      <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        Recommended for <span className="text-[var(--neon)]">{user.username}</span>
      </h2>

      <div className="-mx-2 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 pb-1">
          {RECOMMEND_TAGS.map((t) => {
            const on = selected.includes(t.slug);
            return (
              <button
                key={t.slug}
                onClick={() => toggleTag(t.slug)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition-all duration-200",
                  on
                    ? "bg-[var(--neon)] text-black ring-[var(--neon)] shadow-[var(--neon-glow)] scale-105"
                    : "bg-white/5 text-white/80 ring-white/10 hover:bg-white/10 hover:text-white"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-white/50">
        {selected.length === 0
          ? "Showing general picks. Select tags to personalize."
          : `Filtered by ${selected.length} tag${selected.length > 1 ? "s" : ""}.`}
      </p>

      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/70 p-2 text-white ring-1 ring-white/10 backdrop-blur transition hover:bg-[var(--neon)] hover:text-black sm:block"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/70 p-2 text-white ring-1 ring-white/10 backdrop-blur transition hover:bg-[var(--neon)] hover:text-black sm:block"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
        >
          {loading && !games && (
            <div className="flex w-full items-center justify-center py-16 text-white/60">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          {games?.map((g) => (
            <div key={g.id} className="w-[220px] shrink-0 snap-start sm:w-[240px]">
              <GameCard
                game={g}
                inWishlist={has(g.id)}
                onToggle={(game) => {
                  const added = toggle(game);
                  toast[added ? "success" : "message"](
                    added ? `Added "${game.name}"` : `Removed "${game.name}"`
                  );
                }}
                onOpen={setActive}
              />
            </div>
          ))}
          {games && games.length === 0 && (
            <p className="py-8 text-sm text-white/60">No recommendations match these tags.</p>
          )}
        </div>
      </div>

      <GameDetailModal game={active} onClose={() => setActive(null)} />
    </section>
  );
}
