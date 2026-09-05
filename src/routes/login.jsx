import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import logo from "@/assets/kkm-logo.png";
import { useLogin } from "@/hooks/use-session";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — KKM Classroom" },
      {
        name: "description",
        content: "Students and teachers sign in to KKM Classroom with a registration number and date of birth.",
      },
      { property: "og:title", content: "Login — KKM Classroom" },
      { property: "og:description", content: "Sign in with your registration number and date of birth." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [role, setRole] = useState("student");
  const [regNo, setRegNo] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setNotice("");
    setError("");
    if (!regNo.trim()) {
      setError("Please enter your registration number.");
      return;
    }
    if (!/^\d{8}$/.test(dob)) {
      setError("Date of birth must be 8 digits in DDMMYYYY format.");
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({
        role,
        regNo: regNo.trim().toUpperCase(),
        dob,
      });
      if (!result?.ok) {
        setError(result?.error || "Could not sign you in. Check your details and try again.");
        return;
      }
      const destination = result.user.role === "teacher" ? "/teacher" : "/exams";
      setNotice(`Signed in as ${result.user.role} ${result.user.regNo}. Redirecting…`);
      setTimeout(() => navigate({ to: destination }), 400);
    } catch {
      setError("Could not sign you in. Check your connection and try again.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="kkm-container flex flex-1 items-center justify-center py-16">
        <div className="card-soft w-full max-w-md p-8">
          <div className="flex flex-col items-center text-center">
            <img src={logo} alt="KKM Classroom logo" width={64} height={64} className="h-16 w-16 object-contain" />
            <h1 className="mt-3 text-2xl font-bold text-ink">Sign in to KKM Classroom</h1>
            <p className="mt-1 text-sm text-muted-foreground">Use your registration number and date of birth.</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-surface p-1">
            {["student", "teacher"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={
                  "rounded-full py-2 text-sm font-semibold capitalize transition-colors " +
                  (role === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary")
                }
              >
                {r}
              </button>
            ))}
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="regNo" className="text-sm font-medium text-ink">
                Registration number
              </label>
              <input
                id="regNo"
                value={regNo}
                maxLength={32}
                onChange={(e) => setRegNo(e.target.value)}
                placeholder="e.g. KKM2026001"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div>
              <label htmlFor="dob" className="text-sm font-medium text-ink">
                Date of birth (password)
              </label>
              <input
                id="dob"
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={dob}
                onChange={(e) => setDob(e.target.value.replace(/\D/g, ""))}
                placeholder="DDMMYYYY"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm tracking-widest outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
              <p className="mt-1 text-xs text-muted-foreground">8 digits, e.g. 05041999 for 5 April 1999.</p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {notice && <p className="text-sm text-primary">{notice}</p>}

            <button type="submit" className="btn-primary w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "SIGNING IN…" : "LOGIN"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
