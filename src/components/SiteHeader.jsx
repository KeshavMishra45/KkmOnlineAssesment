import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import logo from "@/assets/kkm-logo.png";
import { useSession, useLogout } from "@/hooks/use-session";

const PUBLIC_LINKS = [{ to: "/", label: "Home" }];

// Links shown once a session exists, tailored to the signed-in role.
function linksForRole(role) {
  if (role === "teacher") {
    return [{ to: "/teacher", label: "Teacher" }];
  }
  if (role === "student") {
    return [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/exams", label: "Exams" },
      { to: "/dashboard/analysis", label: "Analysis" },
      { to: "/typing", label: "Typing" },
    ];
  }
  return [];
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, isLoading } = useSession();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const navLinks = [...PUBLIC_LINKS, ...linksForRole(user?.role)];

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    setOpen(false);
    navigate({ to: "/login" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="kkm-container flex h-18 items-center justify-between gap-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="KKM Classroom logo" width={48} height={48} className="h-11 w-11 object-contain" />
          <span className="text-lg font-bold tracking-tight text-ink">
            KKM <span className="text-primary">Classroom</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <form
            className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 md:flex"
            onSubmit={(e) => e.preventDefault()}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search courses, exams..."
              aria-label="Search"
              className="w-48 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Search
            </button>
          </form>

          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeProps={{ className: "text-primary font-semibold" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                activeOptions={{ exact: l.to === "/" }}
                className="text-sm transition-colors hover:text-primary"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {!isLoading && user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <span className="text-xs text-muted-foreground">
                {user.regNo} · <span className="capitalize">{user.role}</span>
              </span>
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="btn-ghost"
                type="button"
              >
                {logoutMutation.isPending ? "SIGNING OUT…" : "LOGOUT"}
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="btn-ghost">
                LOGIN
              </Link>
              <Link to="/signup" className="btn-primary">
                SIGN UP
              </Link>
            </div>
          )}

          <button
            className="rounded-md border border-border p-2 lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="kkm-container flex flex-col gap-3 py-4">
            <form className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2" onSubmit={(e) => e.preventDefault()}>
              <Search className="h-4 w-4 text-muted-foreground" />
              <input type="search" placeholder="Search..." aria-label="Search" className="w-full bg-transparent text-sm outline-none" />
            </form>
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-primary">
                {l.label}
              </Link>
            ))}
            {!isLoading && user ? (
              <button onClick={handleLogout} disabled={logoutMutation.isPending} className="btn-primary w-full" type="button">
                {logoutMutation.isPending ? "SIGNING OUT…" : "LOGOUT"}
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="btn-ghost w-full text-center">
                  LOGIN
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="btn-primary w-full text-center">
                  SIGN UP
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
