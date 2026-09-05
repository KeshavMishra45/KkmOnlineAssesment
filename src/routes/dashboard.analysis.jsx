import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { getLatestResult } from "@/lib/exam-results";
import { SECTIONS, NEGATIVE_MARK, POSITIVE_MARK } from "@/lib/exam-data";

export const Route = createFileRoute("/dashboard/analysis")({
  head: () => ({
    meta: [
      { title: "Result Analysis — KKM Classroom Dashboard" },
      {
        name: "description",
        content:
          "Pie-chart analysis of your latest KKM exam: attempted, not attempted, correct, wrong and negative marks.",
      },
      { property: "og:title", content: "Result Analysis — KKM Classroom Dashboard" },
      {
        property: "og:description",
        content: "Section-wise scores and question palette for your latest attempt.",
      },
    ],
  }),
  component: AnalysisPage,
});

const COLORS = {
  correct: "#16a34a",
  wrong: "#dc2626",
  notAttempted: "#94a3b8",
  attempted: "#2563eb",
};

function formatDuration(seconds = 0) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function AnalysisPage() {
  const [result, setResult] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setResult(getLatestResult());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <div className="card-soft p-10 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!result) {
    return (
      <div className="card-soft p-10 text-center">
        <h1 className="text-2xl font-bold text-ink">No attempt yet</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Finish an exam and your analysis — pie chart, section scores and the question palette —
          appears here automatically.
        </p>
        <Link to="/exams" className="btn-primary mt-6">
          GO TO EXAM PORTAL
        </Link>
      </div>
    );
  }

  const pieData = [
    { name: "Correct", value: result.correct, color: COLORS.correct },
    { name: "Wrong", value: result.wrong, color: COLORS.wrong },
    { name: "Not attempted", value: result.notAttempted, color: COLORS.notAttempted },
  ].filter((d) => d.value > 0);

  const attemptPie = [
    { name: "Attempted", value: result.attempted, color: COLORS.attempted },
    { name: "Not attempted", value: result.notAttempted, color: COLORS.notAttempted },
  ].filter((d) => d.value > 0);

  const sectionData = (result.sections || []).map((s) => ({
    name: s.name,
    Correct: s.correct,
    Wrong: s.wrong,
    "Not attempted": s.notAttempted,
  }));

  const stats = [
    { label: "Score", value: `${result.score} / ${result.total}` },
    { label: "Questions attempted", value: `${result.attempted} / ${result.total}` },
    { label: "Correct answers", value: result.correct },
    { label: "Wrong answers", value: result.wrong },
    { label: "Negative marks", value: result.negativeMarks },
    { label: "Time taken", value: formatDuration(result.timeTakenSeconds) },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">Result Analysis</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {result.title} · Reg. No. {result.regNo || "—"} ·{" "}
            {new Date(result.submittedAt).toLocaleString()}
          </p>
        </div>
        <span className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
          Marking: +{POSITIVE_MARK} / {NEGATIVE_MARK}
        </span>
      </div>

      {result.autoSubmitted && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          Auto-submitted: {result.autoReason || "lockdown rule triggered"}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card-soft p-5">
            <p className="text-2xl font-bold text-ink">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card-soft p-6">
          <h2 className="font-semibold text-ink">Answer breakdown</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={100}
                  paddingAngle={2}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card-soft p-6">
          <h2 className="font-semibold text-ink">Attempted vs not attempted</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attemptPie}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {attemptPie.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="card-soft mt-6 p-6">
        <h2 className="font-semibold text-ink">Section-wise performance</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Correct" stackId="a" fill={COLORS.correct} />
              <Bar dataKey="Wrong" stackId="a" fill={COLORS.wrong} />
              <Bar dataKey="Not attempted" stackId="a" fill={COLORS.notAttempted} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">Section</th>
                <th className="py-2">Attempted</th>
                <th className="py-2">Correct</th>
                <th className="py-2">Wrong</th>
                <th className="py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {(result.sections || []).map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="py-2 font-medium text-ink">{s.name}</td>
                  <td className="py-2">
                    {s.attempted} / {s.total}
                  </td>
                  <td className="py-2 text-success">{s.correct}</td>
                  <td className="py-2 text-destructive">{s.wrong}</td>
                  <td className="py-2 font-semibold text-ink">{s.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-soft mt-6 p-6">
        <h2 className="font-semibold text-ink">Question palette</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Green = correct · Red = wrong · Grey = not attempted
        </p>
        <div className="mt-4 space-y-4">
          {SECTIONS.map((section) => (
            <div key={section.id}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {section.name}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {section.questions.map((q, i) => {
                  const given = result.answers?.[q.id];
                  const state =
                    given === undefined || given === null
                      ? "notAttempted"
                      : given === q.answer
                        ? "correct"
                        : "wrong";
                  return (
                    <span
                      key={q.id}
                      title={q.prompt}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: COLORS[state] }}
                    >
                      {i + 1}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/dashboard" className="btn-ghost">
          BACK TO DASHBOARD
        </Link>
        <Link to="/exams" className="btn-primary">
          TAKE ANOTHER EXAM
        </Link>
      </div>
    </div>
  );
}
