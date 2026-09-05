import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, ClipboardList, ShieldCheck, Users } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import heroExam from "@/assets/hero-exam.jpg";
import study1 from "@/assets/study-1.jpg";
import study2 from "@/assets/study-2.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KKM Classroom — Your Online Testing Partner" },
      {
        name: "description",
        content:
          "KKM Classroom is secure online classroom and exam software to create, conduct and evaluate exams for students and teachers.",
      },
      { property: "og:title", content: "KKM Classroom — Your Online Testing Partner" },
      {
        property: "og:description",
        content: "Secure online classroom and exam software for students and teachers.",
      },
    ],
  }),
  component: Home,
});

const features = [
  { icon: ClipboardList, title: "Create Exams", text: "Build question banks, set timers and publish exams in minutes." },
  { icon: ShieldCheck, title: "Secure Testing", text: "Locked attempts, randomised questions and honest evaluation." },
  { icon: BarChart3, title: "Deep Analysis", text: "Track scores, accuracy and subject-wise progress over time." },
  { icon: Users, title: "Teacher & Student", text: "Separate spaces for classroom teachers and their students." },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="bg-surface">
        <div className="kkm-container grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
              Your Online
              <br />
              <span className="text-primary">Classroom Partner</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
              Secure, easy-to-use classroom software to create, conduct and evaluate online exams from
              anywhere — for schools, colleges and training institutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/exams" className="btn-primary">
                VIEW EXAMS
              </Link>
              <Link to="/login" className="btn-ghost">
                STUDENT / TEACHER LOGIN
              </Link>
            </div>
          </div>
          <img
            src={heroExam}
            alt="Online exam interface with question list and timer"
            width={1280}
            height={960}
            className="w-full rounded-2xl"
          />
        </div>
      </section>

      <section className="kkm-container py-16">
        <h2 className="text-2xl font-bold text-ink">Everything a classroom needs</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="card-soft p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="kkm-container grid gap-6 pb-16 md:grid-cols-2">
        <figure className="card-soft overflow-hidden">
          <img src={study1} alt="Students studying with laptops in a classroom" width={1024} height={683} loading="lazy" className="h-64 w-full object-cover" />
          <figcaption className="p-5 text-sm text-muted-foreground">
            Students attend classes and practice tests from any device.
          </figcaption>
        </figure>
        <figure className="card-soft overflow-hidden">
          <img src={study2} alt="Teacher reviewing exam results on a computer" width={1024} height={683} loading="lazy" className="h-64 w-full object-cover" />
          <figcaption className="p-5 text-sm text-muted-foreground">
            Teachers evaluate results and share feedback instantly.
          </figcaption>
        </figure>
      </section>

      <SiteFooter />
    </div>
  );
}
