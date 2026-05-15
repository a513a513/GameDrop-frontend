import { Heart, Star, X } from "lucide-react";
import type { Game } from "@/lib/rawg";
import { cn } from "@/lib/utils";

interface Props {
  game: Game;
  inWishlist?: boolean;
  onToggle?: (game: Game) => void;
  onRemove?: (game: Game) => void;
  onOpen?: (game: Game) => void;
  variant?: "default" | "wishlist";
}

export function GameCard({ game, inWishlist, onToggle, onRemove, onOpen, variant = "default" }: Props) {
  const score = game.metacritic;
  const scoreColor =
    score == null
      ? "bg-white/10 text-white/70"
      : score >= 80
        ? "bg-[var(--neon)]/20 text-[var(--neon)] ring-1 ring-[var(--neon)]/40"
        : score >= 60
          ? "bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/30"
          : "bg-red-500/20 text-red-300 ring-1 ring-red-500/30";

  return (
    <div
      onClick={() => onOpen?.(game)}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={(e) => {
        if (onOpen && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen(game);
        }
      }}
      className={cn(
        "group relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/5 transition-all duration-300 hover:ring-[var(--neon)]/50 hover:-translate-y-1 hover:shadow-[var(--neon-glow)]",
        onOpen && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--neon)]"
      )}
    >
      {game.background_image ? (
        <img
          src={game.background_image}
          alt={game.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-500 text-sm">
          No image
        </div>
      )}

      {/* Permanent bottom gradient with title */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 pt-10 transition-opacity duration-300 group-hover:opacity-0">
        <h3 className="line-clamp-2 text-sm font-semibold text-white">{game.name}</h3>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 flex flex-col justify-end gap-3 bg-black/80 p-4 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
        <h3 className="line-clamp-2 text-base font-bold text-white">{game.name}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", scoreColor)}>
            <Star className="mr-1 inline h-3 w-3" />
            {score ?? "N/A"}
          </span>
          {game.released && (
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/80">
              {new Date(game.released).getFullYear()}
            </span>
          )}
        </div>
        {game.genres?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {game.genres.slice(0, 3).map((g) => (
              <span key={g.id} className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-white/70 ring-1 ring-white/10">
                {g.name}
              </span>
            ))}
          </div>
        )}
        {variant === "wishlist" ? (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove?.(game); }}
            className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-300 ring-1 ring-red-500/40 transition hover:bg-red-500/30"
          >
            <X className="h-4 w-4" />
            Remove
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle?.(game); }}
            className={cn(
              "mt-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition",
              inWishlist
                ? "bg-[var(--neon)]/20 text-[var(--neon)] ring-1 ring-[var(--neon)]/40"
                : "bg-white text-black hover:bg-[var(--neon)] hover:text-black"
            )}
          >
            <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
            {inWishlist ? "In Wishlist" : "Add to Wishlist"}
          </button>
        )}
      </div>
    </div>
  );
}
