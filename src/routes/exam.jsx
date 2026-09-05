import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ShieldAlert, Clock, Maximize, AlertTriangle, Lock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ExamWatermark from "@/components/ExamWatermark";
import { getSession } from "@/lib/exam-session";
import { saveResult } from "@/lib/exam-results";
import {
  SECTIONS,
  TOTAL_QUESTIONS,
  EXAM_TITLE,
  EXAM_DURATION_SECONDS,
  NEGATIVE_MARK,
  POSITIVE_MARK,
  evaluate,
} from "@/lib/exam-data";
import {
  useExamLockdown,
  requestFullscreen,
  exitFullscreen,
  isFullscreenActive,
} from "@/hooks/use-exam-lockdown";
import { getCurrentUser } from "@/lib/auth.functions";

export const Route = createFileRoute("/exam")({
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
      { title: "Exam Page — KKM Classroom" },
      { name: "description", content: "The KKM Classroom secure exam page." },
      { property: "og:title", content: "Exam Page — KKM Classroom" },
      {
        property: "og:description",
        content: "Locked-down live exam attempt, watermarked to the student.",
      },
    ],
  }),
  component: ExamPage,
});

const MAX_VIOLATIONS = 5;

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function ExamPage() {
  const navigate = useNavigate();
  const session = useMemo(() => getSession(), []);
  const [regNo, setRegNo] = useState(session?.regNo || "");
  const [manualRegNo, setManualRegNo] = useState("");

  const [phase, setPhase] = useState(session?.regNo ? "start" : "need-id");
  const [answers, setAnswers] = useState({});
  const [sectionIndex, setSectionIndex] = useState(0);
  const [current, setCurrent] = useState(0); // index inside the active section
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [violations, setViolations] = useState([]);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [showViolationToast, setShowViolationToast] = useState(null);

  const active = phase === "in-progress";
  const submittedRef = useRef(false);
  const toastTimerRef = useRef(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const section = SECTIONS[sectionIndex];
  const question = section.questions[current];

  useExamLockdown({
    active,
    onViolation: (message) => recordViolation(message),
  });

  function recordViolation(message) {
    setViolations((prev) => {
      const next = [...prev, { message, time: new Date().toLocaleTimeString() }];
      if (next.length >= MAX_VIOLATIONS && !submittedRef.current) {
        submittedRef.current = true;
        setTimeout(() => handleSubmit(true, "Too many violations — exam auto-submitted", next), 0);
      }
      return next;
    });
    setShowViolationToast(message);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowViolationToast(null), 3500);
  }

  useEffect(() => {
    if (!active) return undefined;

    function handleFullscreenChange() {
      if (!isFullscreenActive()) {
        setShowFullscreenPrompt(true);
        recordViolation("Exited fullscreen mode");
      } else {
        setShowFullscreenPrompt(false);
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (!active) return undefined;
    function handleBeforeUnload(e) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [active]);

  useEffect(() => {
    if (!active) return undefined;
    if (timeLeft <= 0) {
      handleSubmit(true, "Time is up");
      return undefined;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, timeLeft]);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  async function handleBeginExam() {
    await requestFullscreen();
    setPhase("in-progress");
  }

  async function handleSubmit(auto = false, reason = "", violationList = null) {
    submittedRef.current = true;
    await exitFullscreen();

    const finalViolations = violationList || violations;
    const summary = evaluate(answersRef.current);

    saveResult({
      id: `attempt-${Date.now()}`,
      title: EXAM_TITLE,
      regNo,
      submittedAt: new Date().toISOString(),
      autoSubmitted: auto,
      autoReason: auto ? reason : "",
      timeTakenSeconds: EXAM_DURATION_SECONDS - timeLeft,
      violations: finalViolations,
      answers: answersRef.current,
      ...summary,
    });

    setPhase("submitted");
    navigate({ to: "/dashboard/analysis" });
  }

  function selectAnswer(qId, optionIndex) {
    setAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  }

  function clearAnswer(qId) {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  }

  function confirmManualRegNo(e) {
    e.preventDefault();
    if (!manualRegNo.trim()) return;
    setRegNo(manualRegNo.trim().toUpperCase());
    setPhase("start");
  }

  function goNext() {
    if (current < section.questions.length - 1) {
      setCurrent((c) => c + 1);
    } else if (sectionIndex < SECTIONS.length - 1) {
      setSectionIndex((s) => s + 1);
      setCurrent(0);
    }
  }

  function goPrev() {
    if (current > 0) {
      setCurrent((c) => c - 1);
    } else if (sectionIndex > 0) {
      const prevIndex = sectionIndex - 1;
      setSectionIndex(prevIndex);
      setCurrent(SECTIONS[prevIndex].questions.length - 1);
    }
  }

  const attemptedCount = Object.keys(answers).length;
  const isLastQuestion =
    sectionIndex === SECTIONS.length - 1 && current === section.questions.length - 1;

  return (
    <div
      className="flex min-h-screen flex-col bg-background"
      style={active ? { userSelect: "none", WebkitUserSelect: "none" } : undefined}
    >
      {active && <ExamWatermark regNo={regNo} />}
      {!active && <SiteHeader />}

      {phase === "need-id" && (
        <main className="kkm-container flex flex-1 items-center justify-center py-24">
          <div className="card-soft w-full max-w-md p-8 text-center">
            <Lock className="mx-auto h-8 w-8 text-primary" />
            <h1 className="mt-3 text-2xl font-bold text-ink">Confirm your registration number</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We couldn't find a signed-in session. Enter your registration number to continue, or{" "}
              <Link to="/login" className="font-semibold text-primary underline underline-offset-2">
                sign in properly
              </Link>
              .
            </p>
            <form className="mt-6 space-y-3 text-left" onSubmit={confirmManualRegNo}>
              <label htmlFor="manualRegNo" className="text-sm font-medium text-ink">
                Registration number
              </label>
              <input
                id="manualRegNo"
                value={manualRegNo}
                onChange={(e) => setManualRegNo(e.target.value)}
                placeholder="e.g. KKM2026001"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
              <button type="submit" className="btn-primary w-full">
                CONTINUE
              </button>
            </form>
          </div>
        </main>
      )}

      {phase === "start" && (
        <main className="kkm-container flex flex-1 items-center justify-center py-24">
          <div className="card-soft w-full max-w-lg p-10 text-center">
            <ShieldAlert className="mx-auto h-9 w-9 text-primary" />
            <h1 className="mt-3 text-2xl font-bold text-ink">{EXAM_TITLE}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Registration No. <span className="font-semibold text-ink">{regNo}</span>
            </p>

            <div className="mt-6 rounded-lg bg-surface p-5 text-left text-sm text-muted-foreground">
              <p className="font-semibold text-ink">Before you begin:</p>
              <ul className="mt-2 list-inside list-disc space-y-1.5">
                <li>Sections: {SECTIONS.map((s) => s.name).join(" · ")}</li>
                <li>
                  Marking scheme: +{POSITIVE_MARK} for a correct answer, {NEGATIVE_MARK} for a wrong
                  answer, 0 for a question not attempted.
                </li>
                <li>The exam opens in full-screen and is locked for the duration.</li>
                <li>Switching tabs, minimizing, or leaving full-screen is detected and logged.</li>
                <li>{MAX_VIOLATIONS} recorded violations will auto-submit your exam.</li>
                <li>
                  Duration: {Math.round(EXAM_DURATION_SECONDS / 60)} minutes · {TOTAL_QUESTIONS}{" "}
                  questions
                </li>
                <li>On submission you are taken straight to your dashboard analysis.</li>
              </ul>
            </div>

            <button onClick={handleBeginExam} className="btn-primary mt-6 w-full">
              <Maximize className="h-4 w-4" /> ENTER FULL-SCREEN &amp; START EXAM
            </button>
            <Link to="/exams" className="btn-ghost mt-3 w-full">
              BACK TO EXAM PORTAL
            </Link>
          </div>
        </main>
      )}

      {phase === "in-progress" && (
        <main className="relative z-30 flex flex-1 flex-col">
          {/* Exam bar */}
          <div className="border-b border-border bg-primary text-primary-foreground">
            <div className="kkm-container flex flex-wrap items-center justify-between gap-3 py-2.5">
              <p className="text-sm font-semibold">KKM SECURE EXAM</p>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="rounded bg-primary-foreground/15 px-2.5 py-1">
                  Maximum Mark: {POSITIVE_MARK} &nbsp;·&nbsp; Negative Mark: {NEGATIVE_MARK}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded bg-primary-foreground/15 px-2.5 py-1">
                  <Clock className="h-3.5 w-3.5" /> Time Left: {formatTime(timeLeft)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded bg-destructive px-2.5 py-1 text-destructive-foreground">
                  <AlertTriangle className="h-3.5 w-3.5" /> {violations.length}/{MAX_VIOLATIONS}
                </span>
              </div>
            </div>
          </div>

          {/* Section tabs */}
          <div className="border-b border-border bg-surface">
            <div className="kkm-container flex flex-wrap items-center gap-1 py-2">
              <span className="mr-2 rounded bg-ink px-2 py-1 text-xs font-bold text-background">
                Q {current + 1}
              </span>
              {SECTIONS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSectionIndex(i);
                    setCurrent(0);
                  }}
                  className={
                    "rounded-t px-4 py-1.5 text-sm font-medium transition-colors " +
                    (i === sectionIndex
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-primary")
                  }
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="kkm-container flex flex-1 flex-col gap-6 py-6 lg:flex-row">
            {/* Question area */}
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {section.name} · Question {current + 1} of {section.questions.length} ·{" "}
                {attemptedCount}/{TOTAL_QUESTIONS} attempted
              </p>

              <div className="card-soft mt-3 p-6">
                <p className="text-lg font-semibold text-ink">{question.prompt}</p>
                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  Options (correct +{POSITIVE_MARK}, wrong {NEGATIVE_MARK})
                </p>
                <div className="mt-4 space-y-2.5">
                  {question.options.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectAnswer(question.id, i)}
                      className={
                        "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors " +
                        (answers[question.id] === i
                          ? "border-primary bg-accent text-accent-foreground"
                          : "border-border hover:border-primary/50")
                      }
                    >
                      <span
                        className={
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold " +
                          (answers[question.id] === i
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input text-muted-foreground")
                        }
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>

                {answers[question.id] !== undefined && (
                  <button
                    type="button"
                    onClick={() => clearAnswer(question.id)}
                    className="mt-4 text-xs font-semibold text-muted-foreground underline underline-offset-2 hover:text-destructive"
                  >
                    CLEAR RESPONSE
                  </button>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <button
                  type="button"
                  disabled={sectionIndex === 0 && current === 0}
                  onClick={goPrev}
                  className="btn-ghost disabled:opacity-40"
                >
                  PREVIOUS
                </button>

                {!isLastQuestion ? (
                  <button type="button" onClick={goNext} className="btn-primary">
                    NEXT
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubmit(false)}
                    className="btn-primary"
                  >
                    SUBMIT &amp; SEE ANALYSIS
                  </button>
                )}
              </div>
            </div>

            {/* Questions palette — right side bubbles */}
            <aside className="lg:w-72 lg:shrink-0">
              <div className="card-soft sticky top-4 p-4">
                <p className="text-center text-sm font-bold text-ink">Questions Palette</p>

                {SECTIONS.map((s, si) => (
                  <div key={s.id} className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {s.name}
                    </p>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {s.questions.map((q, qi) => {
                        const isCurrent = si === sectionIndex && qi === current;
                        const isAttempted = answers[q.id] !== undefined;
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => {
                              setSectionIndex(si);
                              setCurrent(qi);
                            }}
                            className={
                              "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-colors " +
                              (isCurrent
                                ? "border-primary bg-primary text-primary-foreground ring-2 ring-ring/40"
                                : isAttempted
                                  ? "border-success bg-success text-background"
                                  : "border-border bg-secondary text-muted-foreground")
                            }
                          >
                            {qi + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full bg-success" /> Attempted (
                    {attemptedCount})
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border border-border bg-secondary" /> Not
                    attempted ({TOTAL_QUESTIONS - attemptedCount})
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full bg-primary" /> Current question
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  className="btn-primary mt-5 w-full"
                >
                  SUBMIT EXAM
                </button>
              </div>
            </aside>
          </div>

          {showViolationToast && (
            <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground shadow-lg">
              ⚠ {showViolationToast}
            </div>
          )}

          {showFullscreenPrompt && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 p-6">
              <div className="card-soft max-w-sm p-8 text-center">
                <ShieldAlert className="mx-auto h-8 w-8 text-destructive" />
                <h2 className="mt-3 text-lg font-bold text-ink">Full-screen exited</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  This has been logged as violation {violations.length} of {MAX_VIOLATIONS}. Return
                  to full-screen to keep the exam running.
                </p>
                <button
                  onClick={async () => {
                    await requestFullscreen();
                  }}
                  className="btn-primary mt-5 w-full"
                >
                  <Maximize className="h-4 w-4" /> RESUME FULL-SCREEN
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {phase === "submitted" && (
        <main className="kkm-container flex flex-1 items-center justify-center py-24">
          <div className="card-soft w-full max-w-md p-10 text-center">
            <p className="text-lg font-semibold text-ink">Exam submitted</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Taking you to your dashboard analysis…
            </p>
            <Link to="/dashboard/analysis" className="btn-primary mt-6 w-full">
              OPEN ANALYSIS
            </Link>
          </div>
        </main>
      )}

      {!active && <SiteFooter />}
    </div>
  );
}
