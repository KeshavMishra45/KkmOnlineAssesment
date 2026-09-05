// Languages available for LeetCode-style coding questions.
// Students read from standard input and print the answer, so every language
// uses the same test-case format (stdin -> expected stdout).

export const LANGUAGES = [
  {
    id: "java",
    label: "Java",
    starter: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // read the input, print the answer
    }
}
`,
  },
  {
    id: "c",
    label: "C",
    starter: `#include <stdio.h>

int main(void) {
    /* read the input, print the answer */
    return 0;
}
`,
  },
  {
    id: "python",
    label: "Python",
    starter: `import sys

data = sys.stdin.read().split()
# read the input, print the answer
`,
  },
  {
    id: "javascript",
    label: "JavaScript",
    starter: `const data = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean);
// read the input, print the answer
`,
  },
];

export const LANGUAGE_IDS = LANGUAGES.map((l) => l.id);

export function languageLabel(id) {
  return LANGUAGES.find((l) => l.id === id)?.label || id;
}

export function starterFor(id) {
  return LANGUAGES.find((l) => l.id === id)?.starter || "";
}
