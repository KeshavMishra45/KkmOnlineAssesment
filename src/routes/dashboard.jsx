import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getCurrentUser } from "@/lib/auth.functions";

export const Route = createFileRoute("/dashboard")({
  // Route guard: dashboard/analysis is for signed-in students (a logged-in
  // teacher is sent to their own workspace instead of a student view).
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUser();
    if (!user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    if (user.role === "teacher") {
      throw redirect({ to: "/teacher" });
    }
    return { user };
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="kkm-container flex flex-1 flex-col gap-8 py-10 lg:flex-row">
        <aside className="lg:w-56">
          <nav className="card-soft flex gap-2 p-3 lg:flex-col">
            <Link
              to="/dashboard"
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Overview
            </Link>
            <Link
              to="/dashboard/analysis"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Analysis
            </Link>
          </nav>
        </aside>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
