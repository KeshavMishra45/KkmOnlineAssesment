import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import {
  blankCodeQuestion,
  blankMcqQuestion,
  examMaxMarks,
  getExam,
  saveExam,
} from "@/lib/teacher-store";
import { LANGUAGES, starterFor } from "@/lib/code-languages";

export const Route = createFileRoute("/teacher/exams/$examId")({
  head: () => ({
    meta: [
      { title: "Edit Exam Questions — KKM Classroom" },
      {
        name: "description",
        content:
          "Add multiple-choice questions and coding problems with test cases to a KKM Classroom exam.",
      },
      { property: "og:title", content: "Edit Exam Questions — KKM Classroom" },
      { property: "og:description", content: "Add MCQ and coding questions with test cases." },
    ],
  }),
  component: EditExam,
});

const inputClass =
  "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";

function EditExam() {
  const { examId } = useParams({ from: "/teacher/exams/$examId" });
  const [exam, setExam] = useState(null);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    setExam(getExam(examId));
  }, [examId]);

  if (!exam) {
    return (
      <div className="card-soft p-8">
        <h1 className="text-xl font-semibold text-ink">Exam not found</h1>
        <Link to="/teacher" className="btn-primary mt-4 inline-flex">
          BACK TO EXAMS
        </Link>
      </div>
    );
  }

  function update(patch) {
    setExam((prev) => ({ ...prev, ...patch }));
    setSaved("");
  }

  function updateQuestion(index, patch) {
    setExam((prev) => {
      const questions = prev.questions.map((q, i) => (i === index ? { ...q, ...patch } : q));
      return { ...prev, questions };
    });
    setSaved("");
  }

  function removeQuestion(index) {
    setExam((prev) => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }));
    setSaved("");
  }

  function addQuestion(type) {
    const question = type === "mcq" ? blankMcqQuestion() : blankCodeQuestion("java");
    setExam((prev) => ({ ...prev, questions: [...prev.questions, question] }));
    setSaved("");
  }

  function handleSave() {
    saveExam({ ...exam, builtIn: false });
    setSaved("Saved. Students will see the updated exam.");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{exam.title || "Untitled exam"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {exam.questions.length} questions · {examMaxMarks(exam)} marks · {exam.durationMinutes} min
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/code-exam/$examId" params={{ examId: exam.id }} className="btn-ghost">
            PREVIEW
          </Link>
          <button type="button" onClick={handleSave} className="btn-primary inline-flex items-center gap-2">
            <Save className="h-4 w-4" /> SAVE
          </button>
        </div>
      </div>
      {saved && <p className="mt-3 text-sm text-primary">{saved}</p>}

      <div className="card-soft mt-6 grid gap-4 p-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-ink" htmlFor="exam-title">
            Title
          </label>
          <input
            id="exam-title"
            value={exam.title}
            maxLength={120}
            onChange={(e) => update({ title: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink" htmlFor="exam-duration">
            Duration (minutes)
          </label>
          <input
            id="exam-duration"
            type="number"
            min={5}
            max={240}
            value={exam.durationMinutes}
            onChange={(e) => update({ durationMinutes: Number(e.target.value) })}
            className={inputClass}
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-sm font-medium text-ink" htmlFor="exam-description">
            Description
          </label>
          <textarea
            id="exam-description"
            rows={2}
            value={exam.description}
            maxLength={400}
            onChange={(e) => update({ description: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {exam.questions.map((question, index) =>
          question.type === "mcq" ? (
            <McqEditor
              key={question.id}
              question={question}
              index={index}
              onChange={(patch) => updateQuestion(index, patch)}
              onRemove={() => removeQuestion(index)}
            />
          ) : (
            <CodeEditor
              key={question.id}
              question={question}
              index={index}
              onChange={(patch) => updateQuestion(index, patch)}
              onRemove={() => removeQuestion(index)}
            />
          ),
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" onClick={() => addQuestion("mcq")} className="btn-ghost inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> ADD MCQ
        </button>
        <button type="button" onClick={() => addQuestion("code")} className="btn-ghost inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> ADD CODING QUESTION
        </button>
        <button type="button" onClick={handleSave} className="btn-primary inline-flex items-center gap-2">
          <Save className="h-4 w-4" /> SAVE EXAM
        </button>
      </div>
    </div>
  );
}

function QuestionShell({ label, index, onRemove, children }) {
  return (
    <section className="card-soft p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
          Q{index + 1} · {label}
        </h2>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove question ${index + 1}`}
          className="text-muted-foreground transition-colors hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function McqEditor({ question, index, onChange, onRemove }) {
  return (
    <QuestionShell label="Multiple choice" index={index} onRemove={onRemove}>
      <div>
        <label className="text-sm font-medium text-ink">Question</label>
        <textarea
          rows={2}
          value={question.prompt}
          maxLength={600}
          onChange={(e) => onChange({ prompt: e.target.value })}
          className={inputClass}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {question.options.map((option, oi) => (
          <div key={oi} className="flex items-center gap-2">
            <input
              type="radio"
              name={`answer-${question.id}`}
              checked={question.answer === oi}
              onChange={() => onChange({ answer: oi })}
              aria-label={`Mark option ${oi + 1} correct`}
            />
            <input
              value={option}
              maxLength={200}
              placeholder={`Option ${oi + 1}`}
              onChange={(e) =>
                onChange({ options: question.options.map((o, i) => (i === oi ? e.target.value : o)) })
              }
              className={inputClass}
            />
          </div>
        ))}
      </div>
      <div className="w-40">
        <label className="text-sm font-medium text-ink">Marks</label>
        <input
          type="number"
          min={0}
          max={50}
          value={question.marks}
          onChange={(e) => onChange({ marks: Number(e.target.value) })}
          className={inputClass}
        />
      </div>
      <p className="text-xs text-muted-foreground">Select the radio button next to the correct option.</p>
    </QuestionShell>
  );
}

function CodeEditor({ question, index, onChange, onRemove }) {
  const tests = question.tests || [];

  function updateTest(ti, patch) {
    onChange({ tests: tests.map((t, i) => (i === ti ? { ...t, ...patch } : t)) });
  }

  return (
    <QuestionShell label="Coding problem" index={index} onRemove={onRemove}>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-ink">Problem title</label>
          <input
            value={question.title}
            maxLength={120}
            onChange={(e) => onChange({ title: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Language</label>
          <select
            value={question.language || "java"}
            onChange={(e) => {
              const language = e.target.value;
              const wasStarter = question.starterCode === starterFor(question.language || "java");
              onChange({
                language,
                ...(wasStarter || !question.starterCode ? { starterCode: starterFor(language) } : {}),
              });
            }}
            className={inputClass}
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Difficulty</label>
          <select
            value={question.difficulty || "Easy"}
            onChange={(e) => onChange({ difficulty: e.target.value })}
            className={inputClass}
          >
            {["Easy", "Medium", "Hard"].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Marks</label>
          <input
            type="number"
            min={0}
            max={100}
            value={question.marks}
            onChange={(e) => onChange({ marks: Number(e.target.value) })}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Problem statement</label>
        <textarea
          rows={3}
          value={question.prompt}
          maxLength={2000}
          onChange={(e) => onChange({ prompt: e.target.value })}
          className={inputClass}
          placeholder="Describe the input format and what to print."
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Starter code</label>
        <textarea
          rows={8}
          spellCheck={false}
          value={question.starterCode}
          onChange={(e) => onChange({ starterCode: e.target.value })}
          className={`${inputClass} font-mono text-xs`}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-ink">Test cases</label>
          <button
            type="button"
            onClick={() => onChange({ tests: [...tests, { input: "", expected: "", sample: false }] })}
            className="text-sm font-semibold text-primary"
          >
            + Add test
          </button>
        </div>
        <div className="mt-2 space-y-3">
          {tests.map((test, ti) => (
            <div key={ti} className="rounded-md border border-border p-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Input (stdin)</label>
                  <textarea
                    rows={3}
                    spellCheck={false}
                    value={test.input}
                    onChange={(e) => updateTest(ti, { input: e.target.value })}
                    className={`${inputClass} font-mono text-xs`}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Expected output</label>
                  <textarea
                    rows={3}
                    spellCheck={false}
                    value={test.expected}
                    onChange={(e) => updateTest(ti, { expected: e.target.value })}
                    className={`${inputClass} font-mono text-xs`}
                  />
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={Boolean(test.sample)}
                    onChange={(e) => updateTest(ti, { sample: e.target.checked })}
                  />
                  Visible to students (sample test used by Run)
                </label>
                <button
                  type="button"
                  onClick={() => onChange({ tests: tests.filter((_, i) => i !== ti) })}
                  className="text-xs font-semibold text-destructive"
                >
                  Remove test
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </QuestionShell>
  );
}
