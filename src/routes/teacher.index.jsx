import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileCode2, ListChecks, Plus, Trash2, Users } from "lucide-react";
import { deleteExam, examMaxMarks, getExams, getSubmissions } from "@/lib/teacher-store";
import { languageLabel } from "@/lib/code-languages";

export const Route = createFileRoute("/teacher/")({
  head: () => ({
    meta: [
      { title: "Teacher — Exam Builder | KKM Classroom" },
      {
        name: "description",
        content:
          "Create exams, add multiple-choice and coding questions in Java, C, Python or JavaScript, and publish them to students.",
      },
      { property: "og:title", content: "Teacher — Exam Builder | KKM Classroom" },
      {
        property: "og:description",
        content: "Build MCQ and coding exams and publish them to your students.",
      },
    ],
  }),
  component: TeacherExams,
});

function TeacherExams() {
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    setExams(getExams());
    setSubmissions(getSubmissions());
  }, []);

  function handleDelete(exam) {
    if (!window.confirm(`Delete "${exam.title}"?`)) return;
    deleteExam(exam.id);
    setExams(getExams());
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">Exams</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Mix multiple-choice questions with LeetCode-style coding problems in Java, C, Python or JavaScript.
          </p>
        </div>
        <Link to="/teacher/create-exam" className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> CREATE EXAM
        </Link>
      </div>

      {exams.length === 0 && (
        <div className="card-soft mt-8 p-10 text-center">
          <p className="text-sm text-muted-foreground">No exams yet.</p>
          <Link to="/teacher/create-exam" className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> CREATE YOUR FIRST EXAM
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {exams.map((exam) => {
          const mcqCount = exam.questions.filter((q) => q.type === "mcq").length;
          const codeQuestions = exam.questions.filter((q) => q.type === "code");
          const languages = [...new Set(codeQuestions.map((q) => q.language || "java"))];
          const attempts = submissions.filter((s) => s.examId === exam.id).length;
          return (
            <article key={exam.id} className="card-soft flex flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-ink">{exam.title}</h2>
                {!exam.builtIn && (
                  <button
                    type="button"
                    onClick={() => handleDelete(exam)}
                    aria-label={`Delete ${exam.title}`}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{exam.description}</p>
              <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4" /> {mcqCount} multiple-choice
                </li>
                <li className="flex items-center gap-2">
                  <FileCode2 className="h-4 w-4" /> {codeQuestions.length} coding
                  {languages.length ? ` · ${languages.map(languageLabel).join(", ")}` : ""}
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> {attempts} attempt{attempts === 1 ? "" : "s"}
                </li>
              </ul>
              <p className="mt-3 text-sm font-semibold text-primary">
                {exam.durationMinutes} min · {examMaxMarks(exam)} marks
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to="/teacher/exams/$examId"
                  params={{ examId: exam.id }}
                  className="btn-primary flex-1"
                >
                  EDIT QUESTIONS
                </Link>
                <Link to="/code-exam/$examId" params={{ examId: exam.id }} className="btn-ghost flex-1">
                  PREVIEW
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
