import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, BookOpen, PieChart, TrendingUp } from "lucide-react";
import { getResults } from "@/lib/exam-results";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard — KKM Classroom" },
      {
        name: "description",
        content:
          "Your KKM Classroom dashboard: latest exam score, questions attempted and section-wise performance.",
      },
      { property: "og:title", content: "Dashboard — KKM Classroom" },
      {
        property: "og:description",
        content: "Latest attempt, questions attempted and performance at a glance.",
      },
    ],
  }),
  component: DashboardHome,
});

function DashboardHome() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    setResults(getResults());
  }, []);

  const latest = results[0] || null;

  const stats = latest
    ? [
        { icon: Award, label: "Latest score", value: `${latest.score} / ${latest.total}` },
        {
          icon: BookOpen,
          label: "Questions attempted",
          value: `${latest.attempted} / ${latest.total}`,
        },
        { icon: TrendingUp, label: "Correct answers", value: latest.correct },
        { icon: PieChart, label: "Negative marks", value: latest.negativeMarks },
      ]
    : [
        { icon: BookOpen, label: "Exams attempted", value: "0" },
        { icon: Award, label: "Latest score", value: "—" },
        { icon: TrendingUp, label: "Correct answers", value: "—" },
        { icon: PieChart, label: "Negative marks", value: "—" },
      ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {latest
          ? `Last attempt on ${new Date(latest.submittedAt).toLocaleString()}`
          : "Take an exam and your results appear here instantly."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-soft p-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <s.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-2xl font-bold text-ink">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="card-soft mt-8 p-6">
        <h2 className="font-semibold text-ink">Section-wise performance</h2>
        {latest ? (
          <div className="mt-5 space-y-4">
            {latest.sections.map((s) => {
              const pct = Math.round((Math.max(0, s.score) / s.total) * 100);
              return (
                <div key={s.id}>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink">{s.name}</span>
                    <span className="text-muted-foreground">
                      {s.attempted}/{s.total} attempted · {pct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-secondary">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No attempts recorded yet.</p>
        )}
        <Link to="/dashboard/analysis" className="btn-ghost mt-6">
          OPEN DETAILED ANALYSIS
        </Link>
      </section>

      {results.length > 1 && (
        <section className="card-soft mt-6 p-6">
          <h2 className="font-semibold text-ink">Previous attempts</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {results.slice(1).map((r) => (
              <li key={r.id} className="flex justify-between border-t border-border py-2">
                <span className="text-muted-foreground">
                  {new Date(r.submittedAt).toLocaleString()}
                </span>
                <span className="font-semibold text-ink">
                  {r.score} / {r.total} · {r.attempted} attempted
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
