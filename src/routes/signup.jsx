import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import logo from "@/assets/kkm-logo.png";
import { useSignup } from "@/hooks/use-session";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — KKM Classroom" },
      {
        name: "description",
        content: "Create a student or teacher account for KKM Classroom.",
      },
      { property: "og:title", content: "Sign up — KKM Classroom" },
      { property: "og:description", content: "Create your KKM Classroom account." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const signupMutation = useSignup();
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [dob, setDob] = useState("");
  const [confirmDob, setConfirmDob] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setNotice("");
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!regNo.trim()) {
      setError("Please choose a registration number.");
      return;
    }
    if (!/^\d{8}$/.test(dob)) {
      setError("Date of birth must be 8 digits in DDMMYYYY format.");
      return;
    }
    if (dob !== confirmDob) {
      setError("Date of birth entries do not match.");
      return;
    }

    try {
      const result = await signupMutation.mutateAsync({
        role,
        name: name.trim(),
        regNo: regNo.trim().toUpperCase(),
        dob,
      });
      if (!result?.ok) {
        setError(result?.error || "Could not create your account. Try again.");
        return;
      }
      const destination = result.user.role === "teacher" ? "/teacher" : "/exams";
      setNotice(`Account created for ${result.user.role} ${result.user.regNo}. Redirecting…`);
      setTimeout(() => navigate({ to: destination }), 400);
    } catch {
      setError("Could not create your account. Check your connection and try again.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="kkm-container flex flex-1 items-center justify-center py-16">
        <div className="card-soft w-full max-w-md p-8">
          <div className="flex flex-col items-center text-center">
            <img src={logo} alt="KKM Classroom logo" width={64} height={64} className="h-16 w-16 object-contain" />
            <h1 className="mt-3 text-2xl font-bold text-ink">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your date of birth doubles as your password — keep it memorable.
            </p>
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
              <label htmlFor="name" className="text-sm font-medium text-ink">
                Full name
              </label>
              <input
                id="name"
                value={name}
                maxLength={80}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Asha Rao"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </div>

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
              <p className="mt-1 text-xs text-muted-foreground">Choose one that isn't already taken for this role.</p>
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

            <div>
              <label htmlFor="confirmDob" className="text-sm font-medium text-ink">
                Confirm date of birth
              </label>
              <input
                id="confirmDob"
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={confirmDob}
                onChange={(e) => setConfirmDob(e.target.value.replace(/\D/g, ""))}
                placeholder="DDMMYYYY"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm tracking-widest outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {notice && <p className="text-sm text-primary">{notice}</p>}

            <button type="submit" className="btn-primary w-full" disabled={signupMutation.isPending}>
              {signupMutation.isPending ? "CREATING ACCOUNT…" : "SIGN UP"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
