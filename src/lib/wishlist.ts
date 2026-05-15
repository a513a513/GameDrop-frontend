import { useEffect, useState, useCallback } from "react";
import type { Game } from "./rawg";

const KEY = "gamedrop:wishlist";

function read(): Game[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(list: Game[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("gamedrop:wishlist"));
}

export function useWishlist() {
  const [list, setList] = useState<Game[]>([]);

  useEffect(() => {
    setList(read());
    const handler = () => setList(read());
    window.addEventListener("gamedrop:wishlist", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("gamedrop:wishlist", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const has = useCallback((id: number) => list.some((g) => g.id === id), [list]);

  const add = useCallback((game: Game) => {
    const cur = read();
    if (cur.some((g) => g.id === game.id)) return;
    write([game, ...cur]);
  }, []);

  const remove = useCallback((id: number) => {
    write(read().filter((g) => g.id !== id));
  }, []);

  const toggle = useCallback((game: Game) => {
    const cur = read();
    if (cur.some((g) => g.id === game.id)) {
      write(cur.filter((g) => g.id !== game.id));
      return false;
    }
    write([game, ...cur]);
    return true;
  }, []);

  return { list, has, add, remove, toggle };
}
