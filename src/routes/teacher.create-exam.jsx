import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { createExam } from "@/lib/teacher-store";

export const Route = createFileRoute("/teacher/create-exam")({
  head: () => ({
    meta: [
      { title: "Create Exam — KKM Classroom" },
      {
        name: "description",
        content: "Create a new exam, then add multiple-choice and coding questions to it.",
      },
    ],
  }),
  component: CreateExamPage,
});

function CreateExamPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", durationMinutes: 30 });
  const [error, setError] = useState("");

  function handleCreate(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Give the exam a title.");
      return;
    }
    setError("");
    const exam = createExam(form);
    // Straight into the question builder for the exam that was just created.
    navigate({ to: "/teacher/exams/$examId", params: { examId: exam.id } });
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">Create exam</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Set the basics first — you'll add multiple-choice and coding questions on the next screen.
      </p>

      <form onSubmit={handleCreate} className="card-soft mt-6 grid gap-4 p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="title" className="text-sm font-medium text-ink">
            Exam title
          </label>
          <input
            id="title"
            value={form.title}
            maxLength={120}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Java DSA — Weekly Round 3"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div>
          <label htmlFor="description" className="text-sm font-medium text-ink">
            Short description
          </label>
          <input
            id="description"
            value={form.description}
            maxLength={240}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What this round covers"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div>
          <label htmlFor="duration" className="text-sm font-medium text-ink">
            Duration (minutes)
          </label>
          <input
            id="duration"
            type="number"
            min={5}
            max={240}
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
        </div>
        {error && <p className="text-sm text-destructive md:col-span-2">{error}</p>}
        <div className="md:col-span-2">
          <button type="submit" className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> CREATE EXAM
          </button>
        </div>
      </form>
    </div>
  );
}
