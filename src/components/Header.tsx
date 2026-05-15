import { Link, useNavigate } from "@tanstack/react-router";
import { Gamepad2, Flame, CalendarDays, Heart, LogIn, LogOut, UserCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const navItems = [
  { to: "/", label: "Trending", icon: Flame },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/wishlist", label: "My Wishlist", icon: Heart },
] as const;

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function onLogout() {
    logout();
    toast.message("Logged out");
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--neon)]/15 text-[var(--neon)] ring-1 ring-[var(--neon)]/30 transition group-hover:shadow-[var(--neon-glow)]">
            <Gamepad2 className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Game<span className="text-[var(--neon)]">Drop</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-[var(--neon)] bg-white/5 ring-1 ring-[var(--neon)]/30" }}
              inactiveProps={{ className: "text-foreground/70 hover:text-foreground hover:bg-white/5" }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}

          <div className="ml-1 h-6 w-px bg-white/10" />

          {user ? (
            <>
              <Link
                to="/me"
                activeProps={{ className: "text-[var(--neon)] bg-white/5 ring-1 ring-[var(--neon)]/30" }}
                inactiveProps={{ className: "text-foreground/70 hover:text-foreground hover:bg-white/5" }}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition"
              >
                <UserCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">{user.username}</span>
              </Link>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition hover:bg-white/5 hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-lg bg-[var(--neon)] px-3 py-2 text-sm font-bold text-black transition hover:shadow-[var(--neon-glow)]"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
