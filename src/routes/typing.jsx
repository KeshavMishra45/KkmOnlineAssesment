import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Timer } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const Route = createFileRoute("/typing")({
  head: () => ({
    meta: [
      { title: "Typing Practice — KKM Classroom" },
      { name: "description", content: "Practice typing with a timer, live accuracy and words-per-minute tracking on KKM Classroom." },
      { property: "og:title", content: "Typing Practice — KKM Classroom" },
      { property: "og:description", content: "Timed typing practice with live speed and accuracy for students." },
    ],
  }),
  component: TypingPage,
});

const passages = [
  "Learning to type quickly is a skill that grows with steady daily practice. Sit straight, keep your wrists relaxed and let your fingers rest on the home row keys before you begin.",
  "A good student reviews notes on the same day they are written. Small sessions of focused study, repeated often, will always beat one long night before the exam.",
  "Science begins with a simple question and patient observation. Write down what you see, measure it carefully and never be afraid of an answer you did not expect.",
];

const durations = [30, 60, 120];

function TypingPage() {
  const [duration, setDuration] = useState(60);
  const [left, setLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [text, setText] = useState(passages[0]);
  const [typed, setTyped] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setRunning(false);
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const stats = useMemo(() => {
    const correct = typed.split("").filter((c, i) => c === text[i]).length;
    const elapsed = Math.max(duration - left, 1);
    const wpm = Math.round((typed.length / 5 / elapsed) * 60);
    const accuracy = typed.length ? Math.round((correct / typed.length) * 100) : 100;
    return { wpm, accuracy, correct };
  }, [typed, text, duration, left]);

  function reset(nextDuration = duration, nextText = text) {
    setRunning(false);
    setDone(false);
    setTyped("");
    setDuration(nextDuration);
    setLeft(nextDuration);
    setText(nextText);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleChange(e) {
    if (done) return;
    if (!running) setRunning(true);
    setTyped(e.target.value.slice(0, text.length));
    if (e.target.value.length >= text.length) {
      setRunning(false);
      setDone(true);
    }
  }

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="kkm-container py-12">
        <h1 className="text-3xl font-bold text-ink">Typing Practice</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start typing the passage below — the timer begins with your first keystroke.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="card-soft flex items-center gap-2 px-4 py-2 text-lg font-bold text-primary">
            <Timer className="h-5 w-5" />
            {mm}:{ss}
          </div>
          {durations.map((d) => (
            <button
              key={d}
              onClick={() => reset(d)}
              className={d === duration ? "btn-primary" : "btn-ghost"}
            >
              {d}s
            </button>
          ))}
          <button onClick={() => reset(duration, passages[Math.floor(Math.random() * passages.length)])} className="btn-ghost">
            <RotateCcw className="h-4 w-4" /> NEW TEXT
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat label="Speed" value={`${stats.wpm} WPM`} />
          <Stat label="Accuracy" value={`${stats.accuracy}%`} />
          <Stat label="Characters" value={`${typed.length} / ${text.length}`} />
        </div>

        <div className="card-soft mt-6 p-6 text-lg leading-relaxed">
          {text.split("").map((ch, i) => {
            const state = i < typed.length ? (typed[i] === ch ? "ok" : "bad") : "todo";
            return (
              <span
                key={i}
                className={
                  state === "ok"
                    ? "text-primary"
                    : state === "bad"
                      ? "bg-destructive/15 text-destructive"
                      : "text-muted-foreground"
                }
              >
                {ch}
              </span>
            );
          })}
        </div>

        <textarea
          ref={inputRef}
          value={typed}
          onChange={handleChange}
          disabled={done}
          rows={4}
          placeholder="Start typing here..."
          aria-label="Typing input"
          className="card-soft mt-4 w-full resize-none p-4 text-base outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
        />

        {done && (
          <div className="card-soft mt-4 flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="text-sm text-ink">
              Finished — <span className="font-semibold text-primary">{stats.wpm} WPM</span> at {stats.accuracy}% accuracy.
            </p>
            <button onClick={() => reset()} className="btn-primary">TRY AGAIN</button>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card-soft p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
