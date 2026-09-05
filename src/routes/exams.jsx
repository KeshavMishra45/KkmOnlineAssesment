import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarClock, CheckCircle2 } from "lucide-react";
import { Code2 } from "lucide-react";
import { getExams, examMaxMarks } from "@/lib/teacher-store";
import { languageLabel } from "@/lib/code-languages";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getCurrentUser } from "@/lib/auth.functions";

export const Route = createFileRoute("/exams")({
  // Route guard: the exam portal is for signed-in students; a logged-in
  // teacher is sent to their own workspace instead.
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
  head: () => ({
    meta: [
      { title: "Exam Portal — KKM Classroom" },
      { name: "description", content: "See upcoming and finished exams, schedules and results in the KKM Classroom exam portal." },
      { property: "og:title", content: "Exam Portal — KKM Classroom" },
      { property: "og:description", content: "Upcoming and finished exams for students and teachers." },
    ],
  }),
  component: ExamsPage,
});

const upcoming = [
  { id: 1, title: "Placement Mock — Java · C · Aptitude · Verbal Reasoning", date: "12 Sep 2026, 10:00 AM", duration: "30 min", questions: 32 },
  { id: 2, title: "Java — Core Concepts", date: "15 Sep 2026, 02:00 PM", duration: "30 min", questions: 32 },
  { id: 3, title: "Aptitude & Verbal Reasoning", date: "20 Sep 2026, 11:30 AM", duration: "30 min", questions: 32 },
];

const finished = [
  { id: 4, title: "C Programming — Basics", date: "28 Aug 2026", score: "24.5 / 32", grade: "B+" },
  { id: 5, title: "Java — OOP Fundamentals", date: "20 Aug 2026", score: "29 / 32", grade: "A" },
  { id: 6, title: "Verbal Reasoning — Set 2", date: "11 Aug 2026", score: "19.75 / 32", grade: "C+" },
];

function ExamsPage() {
  const [tab, setTab] = useState("upcoming");
  const [codingExams, setCodingExams] = useState([]);

  useEffect(() => {
    setCodingExams(getExams().filter((e) => e.questions.some((q) => q.type === "code")));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="kkm-container py-12">
        <h1 className="text-3xl font-bold text-ink">Exam Portal</h1>
        <p className="mt-2 text-sm text-muted-foreground">Track everything you have coming up and everything you have completed.</p>

        <div className="mt-6 inline-flex rounded-full bg-surface p-1">
          {[
            { id: "upcoming", label: "Upcoming" },
            { id: "finished", label: "Finished" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                "rounded-full px-6 py-2 text-sm font-semibold transition-colors " +
                (tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary")
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tab === "upcoming"
            ? upcoming.map((e) => (
                <article key={e.id} className="card-soft p-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    <CalendarClock className="h-3.5 w-3.5" /> Upcoming
                  </span>
                  <h2 className="mt-4 font-semibold text-ink">{e.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{e.date}</p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {e.duration} · {e.questions} questions
                  </p>
                  <Link to="/exam" className="btn-primary mt-5 w-full">
                    OPEN EXAM
                  </Link>
                </article>
              ))
            : finished.map((e) => (
                <article key={e.id} className="card-soft p-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Finished
                  </span>
                  <h2 className="mt-4 font-semibold text-ink">{e.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{e.date}</p>
                  <p className="mt-3 text-sm font-semibold text-primary">
                    {e.score} · Grade {e.grade}
                  </p>
                  <Link to="/exam" className="btn-ghost mt-5 w-full">
                    REVIEW
                  </Link>
                </article>
              ))}
        </div>
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-ink">Coding rounds</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            LeetCode-style DSA problems in Java, C, Python and JavaScript. Write your solution, run it against the
            sample tests, then submit.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {codingExams.map((exam) => {
              const languages = [
                ...new Set(exam.questions.filter((q) => q.type === "code").map((q) => q.language || "java")),
              ];
              return (
                <article key={exam.id} className="card-soft p-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    <Code2 className="h-3.5 w-3.5" /> {languages.map(languageLabel).join(" · ")}
                  </span>
                  <h3 className="mt-4 font-semibold text-ink">{exam.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{exam.description}</p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {exam.durationMinutes} min · {exam.questions.length} questions · {examMaxMarks(exam)} marks
                  </p>
                  <Link to="/code-exam/$examId" params={{ examId: exam.id }} className="btn-primary mt-5 w-full">
                    START CODING EXAM
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
