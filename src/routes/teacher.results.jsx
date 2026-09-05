import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getExams, getSubmissions } from "@/lib/teacher-store";

export const Route = createFileRoute("/teacher/results")({
  head: () => ({
    meta: [
      { title: "Student Results — KKM Classroom" },
      {
        name: "description",
        content: "Every student exam attempt with scores, test cases passed and links to review answers.",
      },
      { property: "og:title", content: "Student Results — KKM Classroom" },
      { property: "og:description", content: "Scores and answer reviews for every student attempt." },
    ],
  }),
  component: TeacherResults,
});

function TeacherResults() {
  const [submissions, setSubmissions] = useState([]);
  const [exams, setExams] = useState([]);
  const [examFilter, setExamFilter] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setSubmissions(getSubmissions());
    setExams(getExams());
  }, []);

  const rows = useMemo(
    () =>
      submissions.filter(
        (s) =>
          (examFilter === "all" || s.examId === examFilter) &&
          (!query.trim() || (s.regNo || "").toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [submissions, examFilter, query],
  );

  const average = rows.length
    ? Number((rows.reduce((sum, r) => sum + (r.percentage || 0), 0) / rows.length).toFixed(1))
    : 0;

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">Student results</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Every submitted attempt, newest first. Open a row to read the answers and code a student wrote.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="exam-filter" className="text-sm font-medium text-ink">
            Exam
          </label>
          <select
            id="exam-filter"
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            className="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="all">All exams</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="reg-search" className="text-sm font-medium text-ink">
            Registration number
          </label>
          <input
            id="reg-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students"
            className="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <p className="ml-auto text-sm text-muted-foreground">
          {rows.length} attempt{rows.length === 1 ? "" : "s"} · class average {average}%
        </p>
      </div>

      <div className="card-soft mt-6 overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface">
            <tr>
              <th className="px-4 py-3 font-semibold text-ink">Student</th>
              <th className="px-4 py-3 font-semibold text-ink">Exam</th>
              <th className="px-4 py-3 font-semibold text-ink">Submitted</th>
              <th className="px-4 py-3 font-semibold text-ink">Score</th>
              <th className="px-4 py-3 font-semibold text-ink">Tests passed</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No attempts yet. Once a student submits an exam it appears here.
                </td>
              </tr>
            )}
            {rows.map((s) => {
              const codeRows = (s.breakdown || []).filter((b) => b.type === "code");
              const passed = codeRows.reduce((a, b) => a + (b.passed || 0), 0);
              const totalTests = codeRows.reduce((a, b) => a + (b.totalTests || 0), 0);
              return (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{s.regNo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.examTitle}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(s.submittedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-semibold text-primary">
                    {s.score} / {s.maxMarks} ({s.percentage}%)
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {totalTests ? `${passed} / ${totalTests}` : "—"}
                  </td>
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
