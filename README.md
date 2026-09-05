# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Auth setup (MongoDB Atlas)

Login now checks real accounts in MongoDB Atlas instead of just remembering
whatever you typed. To run it locally:

1. Create a free cluster at https://cloud.mongodb.com, add a database user,
   and allow your IP under Network Access.
2. Copy `.env.example` to `.env` and fill in `MONGODB_URI` (from Atlas ->
   Connect -> Drivers), `MONGODB_DB`, and a random `SESSION_SECRET`.
3. Install dependencies: `npm i`.
4. Seed a demo teacher + student so you have something to log in with:
   ```sh
   node --env-file=.env scripts/seed-users.mjs
   ```
   (On older Node, load the `.env` vars into your shell first.)
5. `npm run dev`, then sign in at `/login` with either seeded account:
   - Teacher: `KKM-TEACHER-01` / `01011990`
   - Student: `KKM2026001` / `05041999`
6. Add more accounts by editing `USERS_TO_SEED` in `scripts/seed-users.mjs`
   and re-running it (upserts, so it's safe to run again).

### What's route-protected

- `/teacher/*` — teachers only. Anyone else is redirected (to `/login` if
  signed out, to `/dashboard` if signed in as a student).
- `/dashboard/*`, `/exams`, `/exam`, `/code-exam/:examId` — signed-in
  students. A signed-in teacher is redirected to `/teacher`.
- The header only shows the "Teacher" nav link to teachers, and shows
  "Dashboard / Exams / Analysis" links only once a student is signed in.

### Teacher routes

- `/teacher` — list/manage exams.
- `/teacher/create-exam` — create a new exam (redirects into the question
  builder once created).
- `/teacher/results` — every submitted attempt across all exams.
- `/teacher/analysis` — pick an exam and see the marks of every student who
  has taken it (class average, high/low, per-student chart, pass/fail
  split).
