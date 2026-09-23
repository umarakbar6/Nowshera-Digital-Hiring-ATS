# Judge walkthrough

This five-minute path demonstrates every major role without exposing real candidate data.

## Prepare the demo

Start the application with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. In another terminal, set the same two values plus a `DEMO_PASSWORD` of at least 10 characters and run:

```powershell
node work/demo-seed.mjs
```

The script is safe to rerun. It creates one recruiter, two candidates, an open frontend role, CV snapshots, an interview, an offer, a rejection, and delivered messages. All demo accounts use the password supplied through `DEMO_PASSWORD`; the password is never saved in the project.

## Present the system

1. Sign in as the admin. Show the colorful dashboard, per-stage totals, job status, recruiter management, email outbox, and n8n + Gmail Automation screen.
2. Open Recruiters. Edit the demo recruiter, then explain that an active recruiter with open jobs cannot be deactivated until those jobs are reassigned or closed.
3. Open the demo job. Explain Draft/Open/Closed visibility and the automatic deadline/capacity checks.
4. Sign in as `recruiter.demo@nowsheradigital.local`. Show only the assigned job and its applicants, private notes, the strict next-stage action, and the scheduled interview.
5. Sign in as `hamza.demo@nowsheradigital.local`. Show the application, its retained CV, interview details, and My Messages.
6. Explain that candidate data and CVs are stored under the ignored runtime `data/` directory and are never included in the submission archive.

For a clean demonstration, use a fresh copy of the project or remove the local `data/` directory before starting. Removing runtime data permanently deletes the local demo database and uploaded demo CVs.
