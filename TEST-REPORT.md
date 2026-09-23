# Verification report

## Automated checks

Run both commands from the project folder:

```powershell
node work/test.mjs
node work/submission-check.mjs
```

The isolated API test runs 88 assertions against a temporary server and database. It verifies account roles, candidate phone capture, one-use recruiter invitation activation, multiple recruiter assignment, draft visibility, job requirements, CV type/size validation and snapshots, duplicate prevention, strict stages, withdrawal/reapplication, terminal states, capacity closure, interview collisions, recruiter boundaries, private notes/CVs/AI summaries, dashboard totals, email deduplication, signed automation endpoints, reminders, Gmail completion, security headers, expired jobs, login throttling, AI three-part structure, sensitive-attribute and decision-content filtering, explicit AI failure, successful retry, stale-attempt protection, and the rule that AI never changes the stage or sends another application email.

The submission check verifies the responsive UI, major role surfaces, local invitation-message viewer, multiple-recruiter controls, AI summary/retry interface, n8n success/failure handling, secret-free browser bundle, and accessibility metadata.

## Browser checks completed

- Desktop sign-in and admin dashboard rendering
- Candidate sign-in layout at 390 × 844
- Authenticated dashboard at 390 × 844
- Narrow layout at 320 × 700 with no horizontal page overflow
- Browser console checked for warnings and errors

## Manual acceptance checklist

Use the seeded demo described in `DEMO-WALKTHROUGH.md`.

1. Candidate uploads a PDF and applies; Applied appears and a message is delivered.
2. Draft stays private; admin opens and assigns it; assigned recruiter advances in strict order.
3. Duplicate application is rejected without a second active record.
4. Hiring the final opening closes the job; another hire is blocked; rejection remains allowed.
5. Closed, expired, skipped, reversed, and terminal transitions are blocked.
6. Withdrawal permits a new application with a new CV while preserving the old snapshot.
7. Word, oversized PDF, past interview, and overlapping interview are blocked.
8. Candidate stage writes and unassigned recruiter writes are blocked by the API.
9. Candidate cannot read another CV/application and never receives private notes.
10. Dashboard totals survive refresh, each notification exists once, and mobile navigation works.
11. A made-up PDF application receives a clearly labelled three-part AI summary while remaining Applied.
12. Sensitive attributes and prompt-injection text are excluded; no score, ranking, or hire/reject advice appears.
13. With AI unavailable, applying and email still work; an authorized retry creates the summary without a second application email.
14. Candidates and unassigned recruiters cannot read summaries; AI credentials stay server-side and outside the repository.
