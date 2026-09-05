import { createFileRoute, Link, redirect, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Clock, Play, Send, XCircle } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getSession } from "@/lib/exam-session";
import { getExam, saveSubmission, scoreSubmission, examMaxMarks } from "@/lib/teacher-store";
import { languageLabel } from "@/lib/code-languages";
import { runCode } from "@/lib/code-runner.functions";
import { getCurrentUser } from "@/lib/auth.functions";

export const Route = createFileRoute("/code-exam/$examId")({
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUser();
    if (!user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    if (user.role === "teacher") {
      throw redirect({ to: "/teacher" });
    }
  },
  head: () => ({
    meta: [
      { title: "Coding Exam — KKM Classroom" },
      {
        name: "description",
        content:
          "Solve LeetCode-style DSA problems in Java, C, Python or JavaScript, run your code against sample tests, then submit.",
      },
      { property: "og:title", content: "Coding Exam — KKM Classroom" },
      {
        property: "og:description",
        content: "Run and submit Java, C, Python or JavaScript solutions against test cases.",
      },
    ],
  }),
  component: CodeExamPage,
});

function formatClock(seconds) {
  const m = Math.floor(Math.max(0, seconds) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(Math.max(0, seconds) % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function CodeExamPage() {
  const { examId } = useParams({ from: "/code-exam/$examId" });
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [regNo, setRegNo] = useState("");
  const [manualRegNo, setManualRegNo] = useState("");
  const [index, setIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [codeState, setCodeState] = useState({}); // qId -> { code, passed, total, results, output }
  const [running, setRunning] = useState(false);
  const [runNotice, setRunNotice] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    const found = getExam(examId);
    setExam(found);
    setRegNo(getSession()?.regNo || "");
    if (found) {
      setTimeLeft((found.durationMinutes || 30) * 60);
      const seeded = {};
      found.questions
        .filter((q) => q.type === "code")
        .forEach((q) => {
          seeded[q.id] = { code: q.starterCode || "", passed: 0, total: (q.tests || []).length, results: [] };
        });
      setCodeState(seeded);
    }
  }, [examId]);

  useEffect(() => {
    if (timeLeft === null) return undefined;
    if (timeLeft <= 0) return undefined;
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const questions = useMemo(() => exam?.questions || [], [exam]);
  const question = questions[index];

  if (!exam) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="kkm-container flex flex-1 items-center justify-center py-16">
          <div className="card-soft p-8 text-center">
            <h1 className="text-xl font-semibold text-ink">Exam not found</h1>
            <Link to="/exams" className="btn-primary mt-4 inline-flex">
              BACK TO EXAM PORTAL
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!regNo) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="kkm-container flex flex-1 items-center justify-center py-16">
          <form
            className="card-soft w-full max-w-md p-8"
            onSubmit={(e) => {
              e.preventDefault();
              if (manualRegNo.trim()) setRegNo(manualRegNo.trim().toUpperCase());
            }}
          >
            <h1 className="text-xl font-semibold text-ink">Confirm your registration number</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your attempt is saved against this number so your teacher can review it.
            </p>
            <input
              value={manualRegNo}
              maxLength={32}
              onChange={(e) => setManualRegNo(e.target.value)}
              placeholder="e.g. KKM2026001"
              className="mt-4 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button type="submit" className="btn-primary mt-4 w-full">
              START
            </button>
          </form>
        </main>
        <SiteFooter />
      </div>
    );
  }

  function setCode(qId, code) {
    setCodeState((prev) => ({ ...prev, [qId]: { ...prev[qId], code } }));
  }

  async function handleRun(mode) {
    if (!question || question.type !== "code" || running) return;
    const tests =
      mode === "run"
        ? (question.tests || []).filter((t) => t.sample)
        : question.tests || [];
    if (!tests.length) {
      setRunNotice("This question has no test cases yet.");
      return;
    }
    setRunning(true);
    setRunNotice(mode === "run" ? "Running sample tests…" : "Running all tests…");
    try {
      const response = await runCode({
        data: {
          code: codeState[question.id]?.code || "",
          language: question.language || "java",
          tests: tests.map((t) => ({ input: t.input, expected: t.expected })),
        },
      });

      if (!response.ok && response.error) {
        setRunNotice(response.error);
      } else if (response.compileError) {
        setRunNotice("Your code did not compile.");
      } else {
        setRunNotice(
          mode === "run"
            ? `${response.passed} of ${response.total} sample tests passed.`
            : `${response.passed} of ${response.total} tests passed — answer recorded.`,
        );
      }

      setCodeState((prev) => ({
        ...prev,
        [question.id]: {
          ...prev[question.id],
          results: response.results || [],
          compileError: response.compileError || "",
          ...(mode === "submit"
            ? { passed: response.passed || 0, total: response.total || tests.length }
            : {}),
        },
      }));
    } catch {
      setRunNotice("Something went wrong while running your code. Try again.");
    } finally {
      setRunning(false);
    }
  }

  function handleFinish() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    const codeAnswers = {};
    Object.entries(codeState).forEach(([qId, value]) => {
      codeAnswers[qId] = { code: value.code, passed: value.passed || 0 };
    });
    const scored = scoreSubmission(exam, { mcqAnswers, codeAnswers });
    const submission = saveSubmission({
      id: `sub-${Date.now()}`,
      examId: exam.id,
      examTitle: exam.title,
      regNo,
      submittedAt: new Date().toISOString(),
      mcqAnswers,
      codeAnswers,
      ...scored,
    });
    navigate({ to: "/teacher/results/$submissionId", params: { submissionId: submission.id } });
  }

  const state = question?.type === "code" ? codeState[question.id] || {} : {};

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="kkm-container flex-1 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">{exam.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {regNo} · {questions.length} questions · {examMaxMarks(exam)} marks
            </p>
          </div>
          <p className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-ink">
            <Clock className="h-4 w-4 text-primary" /> {formatClock(timeLeft ?? 0)}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {questions.map((q, i) => (
            <button
              key={q.id}
              type="button"
              onClick={() => {
                setIndex(i);
                setRunNotice("");
              }}
              className={
                "h-9 w-9 rounded-md text-sm font-semibold transition-colors " +
                (i === index
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-muted-foreground hover:text-primary")
              }
            >
              {i + 1}
            </button>
          ))}
        </div>

        {!question && <p className="mt-8 text-muted-foreground">This exam has no questions yet.</p>}

        {question?.type === "mcq" && (
          <section className="card-soft mt-6 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
              Question {index + 1} · {question.marks} mark{question.marks === 1 ? "" : "s"}
            </h2>
            <p className="mt-2 text-lg font-medium text-ink">{question.prompt}</p>
            <div className="mt-4 space-y-2">
              {question.options.map((option, oi) => (
                <label
                  key={oi}
                  className={
                    "flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors " +
                    (mcqAnswers[question.id] === oi
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border hover:border-primary")
                  }
                >
                  <input
                    type="radio"
                    name={question.id}
                    checked={mcqAnswers[question.id] === oi}
                    onChange={() => setMcqAnswers((prev) => ({ ...prev, [question.id]: oi }))}
                  />
                  {option}
                </label>
              ))}
            </div>
          </section>
        )}

        {question?.type === "code" && (
          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="card-soft p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                {question.difficulty || "Easy"} · {languageLabel(question.language)} · {question.marks} marks
              </h2>
              <h3 className="mt-2 text-lg font-semibold text-ink">{question.title}</h3>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{question.prompt}</p>

              <h4 className="mt-5 text-sm font-semibold text-ink">Sample tests</h4>
              <div className="mt-2 space-y-3">
                {(question.tests || [])
                  .filter((t) => t.sample)
                  .map((t, ti) => (
                    <div key={ti} className="rounded-md bg-surface p-3 text-xs">
                      <p className="font-semibold text-muted-foreground">Input</p>
                      <pre className="mt-1 whitespace-pre-wrap">{t.input}</pre>
                      <p className="mt-2 font-semibold text-muted-foreground">Expected output</p>
                      <pre className="mt-1 whitespace-pre-wrap">{t.expected}</pre>
                    </div>
                  ))}
              </div>
            </div>

            <div className="card-soft flex flex-col p-6">
              <label htmlFor="code" className="text-sm font-medium text-ink">
                Your {languageLabel(question.language)} solution
              </label>
              <textarea
                id="code"
                rows={16}
                spellCheck={false}
                value={state.code || ""}
                onChange={(e) => setCode(question.id, e.target.value)}
                className="mt-2 w-full flex-1 rounded-md border border-input bg-background p-3 font-mono text-xs leading-relaxed outline-none focus:border-primary"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={running}
                  onClick={() => handleRun("run")}
                  className="btn-ghost inline-flex items-center gap-2 disabled:opacity-60"
                >
                  <Play className="h-4 w-4" /> RUN
                </button>
                <button
                  type="button"
                  disabled={running}
                  onClick={() => handleRun("submit")}
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" /> SUBMIT CODE
                </button>
                {state.total ? (
                  <span className="self-center text-sm text-muted-foreground">
                    Recorded: {state.passed || 0} / {state.total} tests
                  </span>
                ) : null}
              </div>
              {runNotice && <p className="mt-3 text-sm text-primary">{runNotice}</p>}
              {state.compileError && (
                <pre className="mt-3 overflow-x-auto rounded-md bg-destructive/10 p-3 text-xs text-destructive">
                  {state.compileError}
                </pre>
              )}
              {(state.results || []).length > 0 && (
                <div className="mt-3 space-y-2">
                  {state.results.map((r) => (
                    <div key={r.index} className="rounded-md border border-border p-3 text-xs">
                      <p className="flex items-center gap-2 font-semibold">
                        {r.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        Test {r.index + 1} {r.passed ? "passed" : "failed"}
                      </p>
                      {!r.passed && (
                        <div className="mt-2 grid gap-2 md:grid-cols-2">
                          <div>
                            <p className="font-semibold text-muted-foreground">Expected</p>
                            <pre className="whitespace-pre-wrap">{r.expected}</pre>
                          </div>
                          <div>
                            <p className="font-semibold text-muted-foreground">Your output</p>
                            <pre className="whitespace-pre-wrap">{r.actual || "(nothing)"}</pre>
                          </div>
                        </div>
                      )}
                      {r.stderr && <pre className="mt-2 whitespace-pre-wrap text-destructive">{r.stderr}</pre>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="btn-ghost disabled:opacity-50"
          >
            PREVIOUS
          </button>
          <button
            type="button"
            disabled={index >= questions.length - 1}
            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
            className="btn-ghost disabled:opacity-50"
          >
            NEXT
          </button>
          <button
            type="button"
            onClick={handleFinish}
            disabled={submitting}
            className="btn-primary ml-auto disabled:opacity-60"
          >
            FINISH & SUBMIT EXAM
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Press SUBMIT CODE on each coding question to record how many hidden tests pass, then finish the exam.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
