import { Link } from "@tanstack/react-router";

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="kkm-container flex flex-col gap-2 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} KKM Classroom. Online exams made simple.</p>
        <div className="flex gap-5">
          <Link to="/exams" className="hover:text-primary">
            Exams
          </Link>
          <Link to="/dashboard" className="hover:text-primary">
            Dashboard
          </Link>
          <Link to="/login" className="hover:text-primary">
            Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
