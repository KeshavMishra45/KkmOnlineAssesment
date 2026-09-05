import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getExams, submissionsForExam, examMaxMarks } from "@/lib/teacher-store";

export const Route = createFileRoute("/teacher/analysis")({
  head: () => ({
    meta: [
      { title: "Analysis — KKM Classroom" },
      {
        name: "description",
        content: "Marks of every student who has taken a given exam, with class-wide charts and stats.",
      },
    ],
  }),
  component: TeacherAnalysisPage,
});

const PASS_THRESHOLD_PERCENT = 40;
const COLORS = { pass: "#16a34a", fail: "#dc2626" };

function TeacherAnalysisPage() {
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");

  useEffect(() => {
    const all = getExams();
    setExams(all);
    if (all.length) setExamId(all[0].id);
  }, []);

  const exam = exams.find((e) => e.id === examId) || null;
  const submissions = useMemo(() => (exam ? submissionsForExam(exam.id) : []), [exam]);

  const stats = useMemo(() => {
    if (!submissions.length) return null;
    const percentages = submissions.map((s) => s.percentage || 0);
    const scores = submissions.map((s) => s.score || 0);
    const passCount = percentages.filter((p) => p >= PASS_THRESHOLD_PERCENT).length;
    return {
      attempts: submissions.length,
      average: Number((percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(1)),
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
      passCount,
      failCount: submissions.length - passCount,
    };
  }, [submissions]);

  const barData = useMemo(
    () =>
      [...submissions]
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .map((s) => ({ name: s.regNo || "—", Score: s.score || 0 })),
    [submissions],
  );

  const pieData = stats
    ? [
        { name: `Pass (≥${PASS_THRESHOLD_PERCENT}%)`, value: stats.passCount, color: COLORS.pass },
        { name: "Fail", value: stats.failCount, color: COLORS.fail },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">Analysis</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pick an exam to see the marks of every student who has taken it.
      </p>

      <div className="mt-6">
        <label htmlFor="exam-select" className="text-sm font-medium text-ink">
          Exam
        </label>
        <select
          id="exam-select"
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
          className="mt-1 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary md:w-auto"
        >
          {exams.length === 0 && <option value="">No exams yet</option>}
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </div>

      {!exam && (
        <div className="card-soft mt-8 p-10 text-center text-sm text-muted-foreground">
          Create an exam first, then come back here once students have attempted it.
        </div>
      )}

      {exam && !stats && (
        <div className="card-soft mt-8 p-10 text-center">
          <h2 className="text-xl font-bold text-ink">No attempts yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No student has taken "{exam.title}" yet. Marks and charts will appear here once they do.
          </p>
        </div>
      )}

      {exam && stats && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: "Attempts", value: stats.attempts },
              { label: "Class average", value: `${stats.average}%` },
              { label: "Highest score", value: `${stats.highest} / ${examMaxMarks(exam)}` },
              { label: "Lowest score", value: `${stats.lowest} / ${examMaxMarks(exam)}` },
              { label: `Passed (≥${PASS_THRESHOLD_PERCENT}%)`, value: `${stats.passCount}/${stats.attempts}` },
            ].map((s) => (
              <div key={s.label} className="card-soft p-5">
                <p className="text-2xl font-bold text-ink">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <section className="card-soft p-6 lg:col-span-2">
              <h2 className="font-semibold text-ink">Marks by student</h2>
              <div className="mt-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} interval={0} angle={-30} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} fontSize={12} domain={[0, examMaxMarks(exam)]} />
                    <Tooltip />
                    <Bar dataKey="Score" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="card-soft p-6">
              <h2 className="font-semibold text-ink">Pass / fail split</h2>
              <div className="mt-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
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
          </div>

          <section className="card-soft mt-6 overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface">
                <tr>
                  <th className="px-4 py-3 font-semibold text-ink">Student</th>
                  <th className="px-4 py-3 font-semibold text-ink">Submitted</th>
                  <th className="px-4 py-3 font-semibold text-ink">Score</th>
                  <th className="px-4 py-3 font-semibold text-ink">Percentage</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {[...submissions]
                  .sort((a, b) => (b.score || 0) - (a.score || 0))
                  .map((s) => (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-ink">{s.regNo}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(s.submittedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-primary">
                        {s.score} / {s.maxMarks}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.percentage}%</td>
                      <td className="px-4 py-3">
                        <Link
                          to="/teacher/results/$submissionId"
                          params={{ submissionId: s.id }}
                          className="font-semibold text-primary hover:underline"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
