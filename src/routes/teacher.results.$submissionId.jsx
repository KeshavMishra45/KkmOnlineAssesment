import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { getExam, getSubmission } from "@/lib/teacher-store";
import { languageLabel } from "@/lib/code-languages";

export const Route = createFileRoute("/teacher/results/$submissionId")({
  head: () => ({
    meta: [
      { title: "Review Submission — KKM Classroom" },
      {
        name: "description",
        content: "Read a student's multiple-choice answers and submitted code, question by question.",
      },
      { property: "og:title", content: "Review Submission — KKM Classroom" },
      { property: "og:description", content: "Question-by-question review of a student's attempt." },
    ],
  }),
  component: ReviewSubmission,
});

function ReviewSubmission() {
  const { submissionId } = useParams({ from: "/teacher/results/$submissionId" });
  const [submission, setSubmission] = useState(null);
  const [exam, setExam] = useState(null);

  useEffect(() => {
    const found = getSubmission(submissionId);
    setSubmission(found);
    setExam(found ? getExam(found.examId) : null);
  }, [submissionId]);

  if (!submission) {
    return (
      <div className="card-soft p-8">
        <h1 className="text-xl font-semibold text-ink">Submission not found</h1>
        <Link to="/teacher/results" className="btn-primary mt-4 inline-flex">
          BACK TO RESULTS
        </Link>
      </div>
    );
  }

  const questions = exam?.questions || [];

  return (
    <div>
      <Link to="/teacher/results" className="text-sm font-semibold text-primary hover:underline">
        ← All results
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-ink">{submission.regNo}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {submission.examTitle} · submitted {new Date(submission.submittedAt).toLocaleString()}
      </p>
      <p className="mt-2 text-lg font-semibold text-primary">
        {submission.score} / {submission.maxMarks} marks ({submission.percentage}%)
      </p>

      <div className="mt-6 space-y-5">
        {(submission.breakdown || []).map((item, index) => {
          const question = questions.find((q) => q.id === item.questionId);
          if (!question) return null;
          if (item.type === "mcq") {
            return (
              <section key={item.questionId} className="card-soft p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                  Q{index + 1} · Multiple choice
                </h2>
                <p className="mt-2 font-medium text-ink">{question.prompt}</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {question.options.map((option, oi) => {
                    const isAnswer = question.answer === oi;
                    const isGiven = item.given === oi;
                    return (
                      <li
                        key={oi}
                        className={
                          "flex items-center gap-2 rounded-md px-3 py-2 " +
                          (isAnswer
                            ? "bg-accent text-accent-foreground"
                            : isGiven
                              ? "bg-destructive/10 text-destructive"
                              : "text-muted-foreground")
                        }
                      >
                        {isAnswer ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isGiven ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <span className="h-4 w-4" />
                        )}
                        {option}
                        {isGiven && <span className="ml-auto text-xs font-semibold">student's answer</span>}
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-3 text-sm font-semibold text-primary">
                  {item.earned} / {item.marks} marks
                </p>
              </section>
            );
          }
          return (
            <section key={item.questionId} className="card-soft p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                Q{index + 1} · Coding · {languageLabel(question.language)}
              </h2>
              <p className="mt-2 font-medium text-ink">{question.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{question.prompt}</p>
              <p className="mt-3 text-sm font-semibold text-primary">
                {item.passed} / {item.totalTests} tests passed · {item.earned} / {item.marks} marks
              </p>
              <pre className="mt-3 overflow-x-auto rounded-md bg-surface p-4 text-xs leading-relaxed">
                <code>{item.code || "// no code submitted"}</code>
              </pre>
            </section>
          );
        })}
      </div>
    </div>
  );
}
