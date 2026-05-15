import { useEffect, useState } from "react";
import { Heart, X, Star, Calendar, Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { getGameDetails, type Game, type GameDetails } from "@/lib/rawg";
import { useWishlist } from "@/lib/wishlist";
import { cn } from "@/lib/utils";

interface Props {
  game: Game | null;
  onClose: () => void;
}

export function GameDetailModal({ game, onClose }: Props) {
  const [details, setDetails] = useState<GameDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { has, toggle } = useWishlist();

  useEffect(() => {
    if (!game) return;
    let cancelled = false;
    setDetails(null);
    setError(null);
    getGameDetails(game.id)
      .then((d) => !cancelled && setDetails(d))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [game?.id]);

  useEffect(() => {
    if (!game) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [game, onClose]);

  if (!game) return null;

  const inList = has(game.id);
  const handleToggle = () => {
    const added = toggle(game);
    toast[added ? "success" : "message"](
      added ? `Added "${game.name}" to wishlist` : `Removed "${game.name}" from wishlist`
    );
  };

  const score = details?.metacritic ?? game.metacritic;
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur ring-1 ring-white/10 transition hover:bg-black/80"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="max-h-[92vh] overflow-y-auto">
          {/* Hero image */}
          <div className="relative aspect-[16/9] w-full bg-zinc-900">
            {game.background_image ? (
              <img
                src={game.background_image}
                alt={game.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-zinc-600">No image</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                {game.name}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={cn("rounded-md px-2 py-1 text-xs font-bold", scoreColor)}>
                  <Star className="mr-1 inline h-3 w-3" />
                  {score ?? "N/A"}
                </span>
                {game.released && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs text-white/80 backdrop-blur">
                    <Calendar className="h-3 w-3" />
                    {new Date(game.released).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
                {details?.playtime ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs text-white/80 backdrop-blur">
                    <Clock className="h-3 w-3" />
                    {details.playtime}h avg
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-5 p-5 sm:p-7">
            {/* Genres */}
            {game.genres?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {game.genres.map((g) => (
                  <span
                    key={g.id}
                    className="rounded-md bg-white/5 px-2 py-1 text-xs text-white/80 ring-1 ring-white/10"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Wishlist CTA */}
            <button
              onClick={handleToggle}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-base font-bold transition",
                inList
                  ? "bg-[var(--neon)]/20 text-[var(--neon)] ring-1 ring-[var(--neon)]/40 hover:bg-[var(--neon)]/30"
                  : "bg-[var(--neon)] text-black hover:opacity-90 shadow-[var(--neon-glow)]"
              )}
            >
              <Heart className={cn("h-5 w-5", inList && "fill-current")} />
              {inList ? "In Your Wishlist" : "Add to Wishlist"}
            </button>

            {/* Description */}
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--neon)]">
                About
              </h3>
              {error ? (
                <p className="text-sm text-red-300">Failed to load details: {error}</p>
              ) : !details ? (
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-[95%] animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-[88%] animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-[70%] animate-pulse rounded bg-white/10" />
                </div>
              ) : (
                <p className="whitespace-pre-line text-sm leading-relaxed text-white/80">
                  {details.description_raw || "No description available."}
                </p>
              )}
            </div>

            {/* Meta */}
            {details && (
              <div className="grid grid-cols-1 gap-3 border-t border-white/5 pt-4 sm:grid-cols-2">
                {details.developers?.length > 0 && (
                  <Meta label="Developer" value={details.developers.map((d) => d.name).join(", ")} />
                )}
                {details.publishers?.length > 0 && (
                  <Meta label="Publisher" value={details.publishers.map((p) => p.name).join(", ")} />
                )}
                {details.esrb_rating && <Meta label="ESRB" value={details.esrb_rating.name} />}
                {details.website && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-white/50">
                      Website
                    </div>
                    <a
                      href={details.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-[var(--neon)] hover:underline"
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-widest text-white/50">{label}</div>
      <div className="mt-0.5 text-sm text-white/85">{value}</div>
    </div>
  );
}
