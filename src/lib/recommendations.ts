import { getGames, type Game } from "./rawg";

// Mock GET /api/games/recommendations?tags=...
export async function getRecommendations(tagSlugs: string[]): Promise<Game[]> {
  if (tagSlugs.length === 0) {
    const data = await getGames({ page: 1, pageSize: 12 });
    return data.results;
  }
  // RAWG accepts comma-separated genres
  const data = await getGames({ genre: tagSlugs.join(","), page: 1, pageSize: 12 });
  return data.results;
}
