import { createServerFn } from "@tanstack/react-start";

type TestCase = { input: string; expected: string };

type TestResult = {
  index: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  stderr: string;
};

type RunPayload = { code: string; language?: string; tests: TestCase[] };

export const SUPPORTED_LANGUAGES = ["java", "c", "python", "javascript"] as const;

// Judge0 CE. Point JUDGE0_URL (and optionally JUDGE0_KEY) at a private
// instance for classroom-scale usage; the public instance is rate limited.
const DEFAULT_JUDGE0_URL = "https://ce.judge0.com";

const LANGUAGE_IDS: Record<string, number> = {
  java: 62,
  c: 50,
  python: 71,
  javascript: 63,
};

function normalize(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function validate(input: unknown): RunPayload {
  const data = input as RunPayload;
  if (!data || typeof data.code !== "string" || !Array.isArray(data.tests)) {
    throw new Error("Invalid run request");
  }
  if (data.code.length > 20000) throw new Error("Code is too long (20,000 character limit)");
  const language = typeof data.language === "string" ? data.language : "java";
  return {
    code: data.code,
    language: language in LANGUAGE_IDS ? language : "java",
    tests: data.tests.slice(0, 12).map((t) => ({
      input: String(t?.input ?? "").slice(0, 5000),
      expected: String(t?.expected ?? "").slice(0, 5000),
    })),
  };
}

export const runCode = createServerFn({ method: "POST" })
  .inputValidator(validate)
  .handler(async ({ data }) => {
    const baseUrl = (process.env["JUDGE0_URL"] || DEFAULT_JUDGE0_URL).replace(/\/$/, "");
    const apiKey = process.env["JUDGE0_KEY"] || "";
    const languageId = LANGUAGE_IDS[data.language ?? "java"] ?? LANGUAGE_IDS["java"]!;
    const results: TestResult[] = [];
    let compileError = "";

    for (let i = 0; i < data.tests.length; i += 1) {
      const test = data.tests[i]!;
      try {
        const headers: Record<string, string> = { "content-type": "application/json" };
        if (apiKey) headers["X-Auth-Token"] = apiKey;

        const response = await fetch(`${baseUrl}/submissions?base64_encoded=false&wait=true`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            language_id: languageId,
            source_code: data.code,
            stdin: test.input,
            cpu_time_limit: 5,
          }),
        });

        if (!response.ok) {
          return {
            ok: false as const,
            error:
              response.status === 429
                ? "The code runner is busy right now. Wait a few seconds and try again."
                : `Code runner error (${response.status}).`,
            compileError: "",
            results,
            passed: results.filter((r) => r.passed).length,
            total: data.tests.length,
          };
        }

        const payload = (await response.json()) as {
          stdout?: string | null;
          stderr?: string | null;
          compile_output?: string | null;
          message?: string | null;
          status?: { id?: number; description?: string };
        };

        const compileOutput = (payload.compile_output || "").trim();
        if (compileOutput) {
          compileError = compileOutput;
          break;
        }

        const stdout = payload.stdout ?? "";
        const stderr = (payload.stderr || payload.message || "").trim();
        results.push({
          index: i,
          input: test.input,
          expected: test.expected,
          actual: stdout,
          passed: !stderr && normalize(stdout) === normalize(test.expected),
          stderr,
        });
      } catch {
        return {
          ok: false as const,
          error: "Could not reach the code runner. Check the connection and try again.",
          compileError: "",
          results,
          passed: results.filter((r) => r.passed).length,
          total: data.tests.length,
        };
      }
    }

    return {
      ok: !compileError,
      error: "",
      compileError,
      results,
      passed: results.filter((r) => r.passed).length,
      total: data.tests.length,
    };
  });
