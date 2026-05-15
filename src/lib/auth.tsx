import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface User {
  username: string;
  favoriteTags: string[];
}

interface StoredAccount {
  username: string;
  password: string;
  favoriteTags: string[];
}

const ACCOUNTS_KEY = "gamedrop:accounts";
const SESSION_KEY = "gamedrop:session";

function readAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]"); } catch { return []; }
}
function writeAccounts(a: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(a));
}
function readSession(): User | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  withdraw: () => Promise<void>;
  updateFavoriteTags: (tags: string[]) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(readSession());
    setLoading(false);
  }, []);

  const persist = (u: User | null) => {
    if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else localStorage.removeItem(SESSION_KEY);
    setUser(u);
  };

  const register: AuthCtx["register"] = async (username, password) => {
    await delay();
    const accounts = readAccounts();
    if (accounts.some((a) => a.username.toLowerCase() === username.toLowerCase())) {
      throw new Error("Username already exists");
    }
    const acc: StoredAccount = { username, password, favoriteTags: [] };
    accounts.push(acc);
    writeAccounts(accounts);
    persist({ username, favoriteTags: [] });
  };

  const login: AuthCtx["login"] = async (username, password) => {
    await delay();
    const acc = readAccounts().find(
      (a) => a.username.toLowerCase() === username.toLowerCase() && a.password === password
    );
    if (!acc) throw new Error("Invalid username or password");
    persist({ username: acc.username, favoriteTags: acc.favoriteTags });
  };

  const logout = () => persist(null);

  const withdraw = async () => {
    await delay();
    if (!user) return;
    writeAccounts(readAccounts().filter((a) => a.username !== user.username));
    persist(null);
  };

  const updateFavoriteTags = (tags: string[]) => {
    if (!user) return;
    const accounts = readAccounts();
    const idx = accounts.findIndex((a) => a.username === user.username);
    if (idx >= 0) {
      accounts[idx].favoriteTags = tags;
      writeAccounts(accounts);
    }
    persist({ ...user, favoriteTags: tags });
  };

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, withdraw, updateFavoriteTags }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const RECOMMEND_TAGS = [
  { label: "RPG", slug: "role-playing-games-rpg" },
  { label: "FPS", slug: "shooter" },
  { label: "Action", slug: "action" },
  { label: "Strategy", slug: "strategy" },
  { label: "Indie", slug: "indie" },
  { label: "Puzzle", slug: "puzzle" },
  { label: "Adventure", slug: "adventure" },
  { label: "Racing", slug: "racing" },
] as const;
