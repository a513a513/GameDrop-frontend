// Replace with your own RAWG API key from https://rawg.io/apidocs
export const RAWG_API_KEY = "ad265db07f9f461ea1cf07603be43656";
const BASE = "https://api.rawg.io/api";

export interface Game {
  id: number;
  name: string;
  slug: string;
  background_image: string | null;
  released: string | null;
  metacritic: number | null;
  rating: number;
  genres: { id: number; name: string }[];
  parent_platforms?: { platform: { id: number; name: string; slug: string } }[];
}

export interface ListResponse {
  count: number;
  next: string | null;
  results: Game[];
}

export const GENRE_FILTERS: { label: string; slug: string | null }[] = [
  { label: "All", slug: null },
  { label: "Action", slug: "action" },
  { label: "RPG", slug: "role-playing-games-rpg" },
  { label: "Shooter", slug: "shooter" },
  { label: "Indie", slug: "indie" },
  { label: "Adventure", slug: "adventure" },
  { label: "Strategy", slug: "strategy" },
  { label: "Puzzle", slug: "puzzle" },
  { label: "Racing", slug: "racing" },
  { label: "Sports", slug: "sports" },
];

export async function getGames(opts: {
  genre?: string | null;
  page?: number;
  pageSize?: number;
}): Promise<ListResponse> {
  const { genre, page = 1, pageSize = 20 } = opts;
  const params = new URLSearchParams({
    key: RAWG_API_KEY,
    ordering: "-added",
    page: String(page),
    page_size: String(pageSize),
  });
  if (genre) params.set("genres", genre);
  return fetchJson<ListResponse>(`${BASE}/games?${params.toString()}`);
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`RAWG ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getTrendingGames(): Promise<Game[]> {
  const data = await fetchJson<ListResponse>(
    `${BASE}/games?key=${RAWG_API_KEY}&ordering=-added&page_size=20`
  );
  return data.results;
}

export async function getGamesInRange(start: string, end: string): Promise<Game[]> {
  const data = await fetchJson<ListResponse>(
    `${BASE}/games?key=${RAWG_API_KEY}&dates=${start},${end}&ordering=released&page_size=40`
  );
  return data.results;
}

export interface GameDetails extends Game {
  description_raw: string;
  website: string | null;
  playtime: number;
  developers: { id: number; name: string }[];
  publishers: { id: number; name: string }[];
  esrb_rating: { id: number; name: string } | null;
}

export async function getGameDetails(id: number): Promise<GameDetails> {
  return fetchJson<GameDetails>(`${BASE}/games/${id}?key=${RAWG_API_KEY}`);
}
