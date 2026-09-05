// Question bank for the KKM secure exam.
// Four sections: Java, C, Aptitude and Verbal Reasoning.

export const NEGATIVE_MARK = -0.25;
export const POSITIVE_MARK = 1;

export const SECTIONS = [
  {
    id: "java",
    name: "Java",
    questions: [
      {
        id: "java-1",
        prompt: "Which keyword is used to inherit a class in Java?",
        options: ["implements", "extends", "inherits", "super"],
        answer: 1,
      },
      {
        id: "java-2",
        prompt: "What is the size of an int variable in Java?",
        options: ["2 bytes", "4 bytes", "8 bytes", "Depends on the JVM"],
        answer: 1,
      },
      {
        id: "java-3",
        prompt: "Which of these is NOT a valid access modifier in Java?",
        options: ["private", "protected", "internal", "public"],
        answer: 2,
      },
      {
        id: "java-4",
        prompt: "Which collection class does NOT allow duplicate elements?",
        options: ["ArrayList", "LinkedList", "HashSet", "Vector"],
        answer: 2,
      },
      {
        id: "java-5",
        prompt: "The method used to start a thread's execution is:",
        options: ["run()", "start()", "execute()", "init()"],
        answer: 1,
      },
      {
        id: "java-6",
        prompt: "String objects in Java are:",
        options: ["Mutable", "Immutable", "Primitive", "Volatile"],
        answer: 1,
      },
      {
        id: "java-7",
        prompt: "Which exception is thrown when dividing an integer by zero?",
        options: ["NumberFormatException", "ArithmeticException", "NullPointerException", "IOException"],
        answer: 1,
      },
      {
        id: "java-8",
        prompt: "An interface method without a body is by default:",
        options: ["static", "final", "abstract", "synchronized"],
        answer: 2,
      },
    ],
  },
  {
    id: "c",
    name: "C",
    questions: [
      {
        id: "c-1",
        prompt: "Which of these is the correct way to declare a pointer to an int in C?",
        options: ["int p;", "int *p;", "ptr int p;", "int &p;"],
        answer: 1,
      },
      {
        id: "c-2",
        prompt: "The function used to allocate memory dynamically in C is:",
        options: ["alloc()", "malloc()", "new", "create()"],
        answer: 1,
      },
      {
        id: "c-3",
        prompt: "What is the output of sizeof(char) in C?",
        options: ["1", "2", "4", "8"],
        answer: 0,
      },
      {
        id: "c-4",
        prompt: "Which header file is required for printf()?",
        options: ["conio.h", "stdlib.h", "stdio.h", "string.h"],
        answer: 2,
      },
      {
        id: "c-5",
        prompt: "In C, an array index always starts from:",
        options: ["1", "0", "-1", "The declared lower bound"],
        answer: 1,
      },
      {
        id: "c-6",
        prompt: "Which operator is used to access a member through a structure pointer?",
        options: [".", "->", "::", "*"],
        answer: 1,
      },
      {
        id: "c-7",
        prompt: "The keyword used to define a constant value in C is:",
        options: ["const", "static", "final", "define"],
        answer: 0,
      },
      {
        id: "c-8",
        prompt: "A function that calls itself is called:",
        options: ["Inline function", "Recursive function", "Static function", "Nested function"],
        answer: 1,
      },
    ],
  },
  {
    id: "aptitude",
    name: "Aptitude",
    questions: [
      {
        id: "apt-1",
        prompt: "If a train travels 180 km in 3 hours, its average speed is:",
        options: ["50 km/h", "55 km/h", "60 km/h", "65 km/h"],
        answer: 2,
      },
      {
        id: "apt-2",
        prompt: "20% of 450 is:",
        options: ["80", "85", "90", "95"],
        answer: 2,
      },
      {
        id: "apt-3",
        prompt: "The next number in the series 2, 6, 12, 20, 30, ___ is:",
        options: ["40", "42", "44", "46"],
        answer: 1,
      },
      {
        id: "apt-4",
        prompt: "A sum doubles in 5 years at simple interest. The rate per annum is:",
        options: ["10%", "15%", "20%", "25%"],
        answer: 2,
      },
      {
        id: "apt-5",
        prompt: "The average of the first 10 natural numbers is:",
        options: ["5", "5.5", "6", "6.5"],
        answer: 1,
      },
      {
        id: "apt-6",
        prompt: "If 5 workers build a wall in 12 days, 6 workers will take:",
        options: ["9 days", "10 days", "11 days", "12 days"],
        answer: 1,
      },
      {
        id: "apt-7",
        prompt: "The ratio 3 : 4 expressed as a percentage of the total is:",
        options: ["30% : 70%", "40% : 60%", "42.8% : 57.2%", "45% : 55%"],
        answer: 2,
      },
      {
        id: "apt-8",
        prompt: "The compound interest on ₹1000 at 10% for 2 years is:",
        options: ["₹200", "₹210", "₹220", "₹231"],
        answer: 1,
      },
    ],
  },
  {
    id: "verbal",
    name: "Verbal Reasoning",
    questions: [
      {
        id: "vr-1",
        prompt: "Choose the word most similar in meaning to 'ABUNDANT':",
        options: ["Scarce", "Plentiful", "Tiny", "Rigid"],
        answer: 1,
      },
      {
        id: "vr-2",
        prompt: "Choose the opposite of 'CANDID':",
        options: ["Frank", "Honest", "Evasive", "Direct"],
        answer: 2,
      },
      {
        id: "vr-3",
        prompt: "Book is to Reading as Fork is to:",
        options: ["Drawing", "Eating", "Writing", "Stirring"],
        answer: 1,
      },
      {
        id: "vr-4",
        prompt: "Find the odd one out:",
        options: ["Rose", "Lily", "Tulip", "Oak"],
        answer: 3,
      },
      {
        id: "vr-5",
        prompt: "If all Bloops are Razzies and all Razzies are Lazzies, then:",
        options: [
          "All Bloops are Lazzies",
          "All Lazzies are Bloops",
          "No Bloops are Lazzies",
          "Cannot be determined",
        ],
        answer: 0,
      },
      {
        id: "vr-6",
        prompt: "Complete the sentence: She was so tired ___ she fell asleep instantly.",
        options: ["than", "that", "then", "though"],
        answer: 1,
      },
      {
        id: "vr-7",
        prompt: "Doctor is to Hospital as Teacher is to:",
        options: ["Student", "School", "Book", "Lesson"],
        answer: 1,
      },
      {
        id: "vr-8",
        prompt: "Choose the correctly spelt word:",
        options: ["Occurence", "Occurrence", "Ocurrence", "Occurrance"],
        answer: 1,
      },
    ],
  },
];

export const ALL_QUESTIONS = SECTIONS.flatMap((s) =>
  s.questions.map((q) => ({ ...q, sectionId: s.id, sectionName: s.name })),
);

export const TOTAL_QUESTIONS = ALL_QUESTIONS.length;
export const EXAM_TITLE = "KKM Placement Mock — Java · C · Aptitude · Verbal Reasoning";
export const EXAM_DURATION_SECONDS = 30 * 60;

// Scores an answer map ({ [questionId]: optionIndex }) with +1 / -0.25 marking.
export function evaluate(answers) {
  let correct = 0;
  let wrong = 0;

  const sections = SECTIONS.map((section) => {
    let sCorrect = 0;
    let sWrong = 0;
    let sAttempted = 0;
    section.questions.forEach((q) => {
      const given = answers[q.id];
      if (given === undefined || given === null) return;
      sAttempted += 1;
      if (given === q.answer) sCorrect += 1;
      else sWrong += 1;
    });
    correct += sCorrect;
    wrong += sWrong;
    return {
      id: section.id,
      name: section.name,
      total: section.questions.length,
      attempted: sAttempted,
      notAttempted: section.questions.length - sAttempted,
      correct: sCorrect,
      wrong: sWrong,
      score: sCorrect * POSITIVE_MARK + sWrong * NEGATIVE_MARK,
    };
  });

  const attempted = correct + wrong;
  const score = correct * POSITIVE_MARK + wrong * NEGATIVE_MARK;

  return {
    total: TOTAL_QUESTIONS,
    attempted,
    notAttempted: TOTAL_QUESTIONS - attempted,
    correct,
    wrong,
    negativeMarks: Number((wrong * NEGATIVE_MARK).toFixed(2)),
    score: Number(score.toFixed(2)),
    percentage: Number(((Math.max(0, score) / TOTAL_QUESTIONS) * 100).toFixed(1)),
    sections,
  };
}
