import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, X } from "lucide-react";
import { toast } from "sonner";
import { getGamesInRange, type Game } from "@/lib/rawg";
import { useWishlist } from "@/lib/wishlist";
import { GameDetailModal } from "@/components/GameDetailModal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Release Calendar — GameDrop" },
      { name: "description", content: "Upcoming game releases by date." },
    ],
  }),
  component: CalendarPage,
});

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function fmt(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function CalendarPage() {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [games, setGames] = useState<Game[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [active, setActive] = useState<Game | null>(null);
  const { has, toggle } = useWishlist();

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const { start, end, weeks } = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    const w: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) w.push(cells.slice(i, i + 7));
    return { start: fmt(firstDay), end: fmt(lastDay), weeks: w };
  }, [year, month]);

  useEffect(() => {
    let cancelled = false;
    setGames(null);
    setError(null);
    getGamesInRange(start, end)
      .then((g) => !cancelled && setGames(g))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [start, end]);

  const byDate = useMemo(() => {
    const map = new Map<string, Game[]>();
    games?.forEach((g) => {
      if (!g.released) return;
      const arr = map.get(g.released) ?? [];
      arr.push(g);
      map.set(g.released, arr);
    });
    return map;
  }, [games]);

  const selectedGames = selectedDate ? byDate.get(selectedDate) ?? [] : [];

  const handleToggle = (g: Game) => {
    const added = toggle(g);
    toast[added ? "success" : "message"](
      added ? `Added "${g.name}" to wishlist` : `Removed "${g.name}" from wishlist`
    );
  };

  const todayStr = fmt(today);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[var(--neon)]">
            <CalendarDays className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Release Calendar</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {MONTHS[month]} {year}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="rounded-lg bg-white/5 px-3 py-2 text-sm font-semibold ring-1 ring-white/10 transition hover:bg-white/10"
          >
            Today
          </button>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          Failed to load: {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40">
        <div className="grid grid-cols-7 border-b border-white/5 bg-zinc-900/60">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-2 py-3 text-center text-xs font-bold uppercase tracking-widest text-foreground/50">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {weeks.flat().map((date, i) => {
            const ds = date ? fmt(date) : null;
            const dayGames = ds ? byDate.get(ds) ?? [] : [];
            const isToday = ds === todayStr;
            return (
              <button
                key={i}
                disabled={!date}
                onClick={() => ds && setSelectedDate(ds)}
                className={cn(
                  "min-h-[88px] sm:min-h-[110px] border-b border-r border-white/5 p-1.5 text-left transition",
                  date && "hover:bg-white/5",
                  !date && "bg-zinc-950/40",
                  dayGames.length > 0 && "cursor-pointer"
                )}
              >
                {date && (
                  <>
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "inline-grid h-6 w-6 place-items-center rounded-full text-xs font-semibold",
                          isToday && "bg-[var(--neon)] text-black",
                          !isToday && "text-foreground/70"
                        )}
                      >
                        {date.getDate()}
                      </span>
                      {dayGames.length > 0 && (
                        <span className="rounded-full bg-[var(--neon)]/20 px-1.5 text-[10px] font-bold text-[var(--neon)]">
                          {dayGames.length}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayGames.slice(0, 2).map((g) => (
                        <div
                          key={g.id}
                          className="flex items-center gap-1.5 rounded-md bg-white/5 p-1 ring-1 ring-white/10"
                        >
                          {g.background_image && (
                            <img
                              src={g.background_image}
                              alt=""
                              className="h-5 w-5 flex-none rounded object-cover"
                              loading="lazy"
                            />
                          )}
                          <span className="line-clamp-1 text-[10px] font-medium text-white/80">
                            {g.name}
                          </span>
                        </div>
                      ))}
                      {dayGames.length > 2 && (
                        <div className="text-[10px] font-semibold text-[var(--neon)]">
                          +{dayGames.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-[var(--neon)]">Releasing</div>
                <h2 className="mt-0.5 text-lg font-bold">
                  {new Date(selectedDate).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5">
              {selectedGames.length === 0 ? (
                <p className="py-8 text-center text-sm text-foreground/60">No releases on this date.</p>
              ) : (
                <ul className="space-y-3">
                  {selectedGames.map((g) => {
                    const inList = has(g.id);
                    return (
                      <li
                        key={g.id}
                        onClick={() => { setActive(g); setSelectedDate(null); }}
                        className="flex cursor-pointer items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 transition hover:bg-white/10 hover:ring-[var(--neon)]/40"
                      >
                        {g.background_image ? (
                          <img
                            src={g.background_image}
                            alt={g.name}
                            className="h-16 w-16 flex-none rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 flex-none rounded-lg bg-zinc-800" />
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-bold">{g.name}</h3>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {g.genres?.slice(0, 3).map((gn) => (
                              <span
                                key={gn.id}
                                className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/70 ring-1 ring-white/10"
                              >
                                {gn.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggle(g); }}
                          className={cn(
                            "flex-none rounded-lg px-3 py-2 text-xs font-semibold transition",
                            inList
                              ? "bg-[var(--neon)]/20 text-[var(--neon)] ring-1 ring-[var(--neon)]/40"
                              : "bg-white text-black hover:bg-[var(--neon)]"
                          )}
                        >
                          {inList ? "Saved" : "+ Wishlist"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <GameDetailModal game={active} onClose={() => setActive(null)} />
    </div>
  );
}
