// Local store for teacher-created exams and student submissions.
// Kept in localStorage so the whole flow works without a backend; swap the
// four read/write helpers for API calls once one is connected.

import { starterFor } from "@/lib/code-languages";

const EXAMS_KEY = "kkm_teacher_exams";
const SUBMISSIONS_KEY = "kkm_exam_submissions";

export const DEFAULT_JAVA_STARTER = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // read the input, print the answer
    }
}
`;

// ---------------------------------------------------------------- seed exam

export const SEED_JAVA_DSA_EXAM = {
  id: "java-dsa-easy",
  title: "Java DSA — Easy Coding Round",
  description:
    "Two beginner-friendly data-structure problems plus two quick concept questions. Write plain Java, read from standard input, print the answer.",
  durationMinutes: 45,
  createdAt: "2026-09-01T09:00:00.000Z",
  builtIn: true,
  questions: [
    {
      id: "jd-code-1",
      type: "code",
      title: "Sum of an array",
      difficulty: "Easy",
      marks: 10,
      prompt:
        "The first line contains n, the number of elements. The second line contains n space-separated integers. Print the sum of all elements.",
      language: "java",
      starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int sum = 0;
        for (int i = 0; i < n; i++) {
            // TODO: add each number to sum
        }
        System.out.println(sum);
    }
}
`,
      tests: [
        { input: "5\n1 2 3 4 5\n", expected: "15", sample: true },
        { input: "3\n10 -2 7\n", expected: "15", sample: true },
        { input: "1\n0\n", expected: "0", sample: false },
        { input: "6\n100 200 300 -50 -50 0\n", expected: "500", sample: false },
      ],
    },
    {
      id: "jd-code-2",
      type: "code",
      title: "Reverse a string",
      difficulty: "Easy",
      marks: 10,
      prompt:
        "A single line contains a word without spaces. Print the word reversed. Example: input `hello` prints `olleh`.",
      language: "java",
      starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        // TODO: build the reversed string and print it
    }
}
`,
      tests: [
        { input: "hello\n", expected: "olleh", sample: true },
        { input: "kkm\n", expected: "mkk", sample: true },
        { input: "a\n", expected: "a", sample: false },
        { input: "dsaisfun\n", expected: "nufsiasd", sample: false },
      ],
    },
    {
      id: "jd-mcq-1",
      type: "mcq",
      marks: 1,
      prompt: "What is the time complexity of searching an element in a sorted array using binary search?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answer: 1,
    },
    {
      id: "jd-mcq-2",
      type: "mcq",
      marks: 1,
      prompt: "Which Java collection keeps elements in insertion order and allows duplicates?",
      options: ["HashSet", "TreeSet", "ArrayList", "HashMap"],
      answer: 2,
    },
  ],
};


// Easy DSA rounds in the other supported languages. Same stdin/stdout format.
export const SEED_C_DSA_EXAM = {
  id: "c-dsa-easy",
  title: "C DSA — Easy Coding Round",
  description: "Beginner array and loop problems in C. Read from standard input and print the answer.",
  durationMinutes: 40,
  createdAt: "2026-09-01T09:10:00.000Z",
  builtIn: true,
  questions: [
    {
      id: "cd-code-1",
      type: "code",
      title: "Largest element in an array",
      difficulty: "Easy",
      marks: 10,
      prompt:
        "First line: n. Second line: n space-separated integers. Print the largest element.",
      language: "c",
      starterCode: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    int best = -1000000000;
    for (int i = 0; i < n; i++) {
        int x;
        scanf("%d", &x);
        /* TODO: keep the biggest value in best */
    }
    printf("%d\\n", best);
    return 0;
}
`,
      tests: [
        { input: "5\n3 9 2 8 1\n", expected: "9", sample: true },
        { input: "3\n-4 -9 -1\n", expected: "-1", sample: true },
        { input: "1\n42\n", expected: "42", sample: false },
        { input: "4\n7 7 7 7\n", expected: "7", sample: false },
      ],
    },
    {
      id: "cd-code-2",
      type: "code",
      title: "Count even numbers",
      difficulty: "Easy",
      marks: 10,
      prompt: "First line: n. Second line: n integers. Print how many of them are even.",
      language: "c",
      starterCode: starterFor("c"),
      tests: [
        { input: "5\n1 2 3 4 6\n", expected: "3", sample: true },
        { input: "3\n1 3 5\n", expected: "0", sample: true },
        { input: "4\n2 4 6 8\n", expected: "4", sample: false },
      ],
    },
    {
      id: "cd-mcq-1",
      type: "mcq",
      marks: 1,
      prompt: "Which data structure follows First In First Out order?",
      options: ["Stack", "Queue", "Binary tree", "Heap"],
      answer: 1,
    },
  ],
};

export const SEED_PYTHON_DSA_EXAM = {
  id: "python-dsa-easy",
  title: "Python DSA — Easy Coding Round",
  description: "Warm-up string and list problems in Python.",
  durationMinutes: 35,
  createdAt: "2026-09-01T09:20:00.000Z",
  builtIn: true,
  questions: [
    {
      id: "pd-code-1",
      type: "code",
      title: "Second largest number",
      difficulty: "Easy",
      marks: 10,
      prompt:
        "First line: n. Second line: n space-separated integers (all distinct). Print the second largest value.",
      language: "python",
      starterCode: `import sys

data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:1 + n]))
# TODO: print the second largest value
`,
      tests: [
        { input: "5\n4 1 9 7 3\n", expected: "7", sample: true },
        { input: "2\n10 20\n", expected: "10", sample: true },
        { input: "4\n-1 -5 -3 -9\n", expected: "-3", sample: false },
      ],
    },
    {
      id: "pd-code-2",
      type: "code",
      title: "Palindrome check",
      difficulty: "Easy",
      marks: 10,
      prompt: "A single word is given. Print YES if it is a palindrome, otherwise NO.",
      language: "python",
      starterCode: starterFor("python"),
      tests: [
        { input: "madam\n", expected: "YES", sample: true },
        { input: "kkm\n", expected: "YES", sample: true },
        { input: "python\n", expected: "NO", sample: false },
        { input: "abba\n", expected: "YES", sample: false },
      ],
    },
  ],
};

export const SEED_JS_DSA_EXAM = {
  id: "javascript-dsa-easy",
  title: "JavaScript DSA — Easy Coding Round",
  description: "Simple array problems in JavaScript, run on Node.",
  durationMinutes: 35,
  createdAt: "2026-09-01T09:30:00.000Z",
  builtIn: true,
  questions: [
    {
      id: "jsd-code-1",
      type: "code",
      title: "Sum of even numbers",
      difficulty: "Easy",
      marks: 10,
      prompt: "First line: n. Second line: n integers. Print the sum of the even ones.",
      language: "javascript",
      starterCode: `const data = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean);
const n = Number(data[0]);
const nums = data.slice(1, 1 + n).map(Number);
// TODO: print the sum of even numbers
`,
      tests: [
        { input: "5\n1 2 3 4 5\n", expected: "6", sample: true },
        { input: "3\n2 4 6\n", expected: "12", sample: true },
        { input: "3\n1 3 5\n", expected: "0", sample: false },
      ],
    },
    {
      id: "jsd-code-2",
      type: "code",
      title: "Reverse an array",
      difficulty: "Easy",
      marks: 10,
      prompt:
        "First line: n. Second line: n integers. Print them in reverse order, space separated on one line.",
      language: "javascript",
      starterCode: starterFor("javascript"),
      tests: [
        { input: "4\n1 2 3 4\n", expected: "4 3 2 1", sample: true },
        { input: "1\n9\n", expected: "9", sample: true },
        { input: "3\n5 -2 0\n", expected: "0 -2 5", sample: false },
      ],
    },
  ],
};

export const SEED_EXAMS = [
  SEED_JAVA_DSA_EXAM,
  SEED_C_DSA_EXAM,
  SEED_PYTHON_DSA_EXAM,
  SEED_JS_DSA_EXAM,
];

// ------------------------------------------------------------------- exams

function read(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors (private mode, quota).
  }
}

export function getExams() {
  const stored = read(EXAMS_KEY, []);
  const missingSeeds = SEED_EXAMS.filter((seed) => !stored.some((e) => e.id === seed.id));
  return [...missingSeeds, ...stored];
}

export function getExam(examId) {
  return getExams().find((e) => e.id === examId) || null;
}

export function saveExam(exam) {
  const all = getExams();
  const index = all.findIndex((e) => e.id === exam.id);
  if (index >= 0) all[index] = exam;
  else all.unshift(exam);
  write(EXAMS_KEY, all);
  return exam;
}

export function deleteExam(examId) {
  write(
    EXAMS_KEY,
    getExams().filter((e) => e.id !== examId),
  );
}

export function createExam({ title, description, durationMinutes }) {
  return saveExam({
    id: `exam-${Date.now()}`,
    title: title.trim(),
    description: description.trim(),
    durationMinutes: Number(durationMinutes) || 30,
    createdAt: new Date().toISOString(),
    questions: [],
  });
}

export function blankMcqQuestion() {
  return {
    id: `q-${Date.now()}`,
    type: "mcq",
    marks: 1,
    prompt: "",
    options: ["", "", "", ""],
    answer: 0,
  };
}

export function blankCodeQuestion(language = "java") {
  return {
    id: `q-${Date.now()}`,
    type: "code",
    title: "",
    difficulty: "Easy",
    marks: 10,
    prompt: "",
    language,
    starterCode: starterFor(language),
    tests: [
      { input: "", expected: "", sample: true },
      { input: "", expected: "", sample: false },
    ],
  };
}

export function examMaxMarks(exam) {
  return (exam?.questions || []).reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
}

// ------------------------------------------------------------- submissions

export function getSubmissions() {
  return read(SUBMISSIONS_KEY, []);
}

export function getSubmission(id) {
  return getSubmissions().find((s) => s.id === id) || null;
}

export function saveSubmission(submission) {
  const all = getSubmissions();
  all.unshift(submission);
  write(SUBMISSIONS_KEY, all.slice(0, 200));
  return submission;
}

export function submissionsForExam(examId) {
  return getSubmissions().filter((s) => s.examId === examId);
}

// Scores a submission draft: MCQ by answer key, code by test cases passed.
export function scoreSubmission(exam, { mcqAnswers = {}, codeAnswers = {} }) {
  let score = 0;
  const breakdown = (exam.questions || []).map((q) => {
    const marks = Number(q.marks) || 0;
    if (q.type === "mcq") {
      const given = mcqAnswers[q.id];
      const correct = given !== undefined && given !== null && given === q.answer;
      if (correct) score += marks;
      return { questionId: q.id, type: "mcq", marks, earned: correct ? marks : 0, correct, given };
    }
    const submitted = codeAnswers[q.id];
    const total = (q.tests || []).length || 1;
    const passed = submitted?.passed ?? 0;
    const earned = Number(((passed / total) * marks).toFixed(2));
    score += earned;
    return {
      questionId: q.id,
      type: "code",
      marks,
      earned,
      passed,
      totalTests: total,
      code: submitted?.code || "",
    };
  });

  const maxMarks = examMaxMarks(exam);
  return {
    score: Number(score.toFixed(2)),
    maxMarks,
    percentage: maxMarks ? Number(((score / maxMarks) * 100).toFixed(1)) : 0,
    breakdown,
  };
}
