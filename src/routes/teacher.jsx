import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getCurrentUser } from "@/lib/auth.functions";

export const Route = createFileRoute("/teacher")({
  // Route guard: only a logged-in user with role "teacher" may reach any
  // /teacher/* route. Everyone else is redirected away before the page
  // (and its data) ever renders.
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUser();
    if (!user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    if (user.role !== "teacher") {
      throw redirect({ to: "/dashboard" });
    }
    return { user };
  },
  component: TeacherLayout,
});

function TeacherLayout() {
  const { user } = Route.useRouteContext();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="kkm-container flex flex-1 flex-col gap-8 py-10 lg:flex-row">
        <aside className="lg:w-56">
          <nav className="card-soft flex gap-2 p-3 lg:flex-col">
            <Link
              to="/teacher"
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Exams
            </Link>
            <Link
              to="/teacher/create-exam"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Create exam
            </Link>
            <Link
              to="/teacher/results"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Student results
            </Link>
            <Link
              to="/teacher/analysis"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Analysis
            </Link>
          </nav>
          <p className="mt-4 px-3 text-xs text-muted-foreground">
            Signed in as <span className="font-semibold text-ink">{user?.regNo}</span> · Teacher workspace — build
            exams, mix multiple-choice with coding problems, and review every attempt.
          </p>
        </aside>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
