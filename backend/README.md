# Backend

The executable backend is [`../server.mjs`](../server.mjs). It is intentionally implemented as one dependency-free Node.js module so the project runs with `node server.mjs` and requires no package installation.

It contains the complete server-side implementation:

- HTTP API and static frontend delivery
- SQLite initialization and migrations
- salted scrypt password hashing and cookie sessions
- candidate, recruiter, and admin authorization
- private CV upload and access checks
- application, pipeline, job-capacity, and deadline rules
- multi-recruiter job assignments
- interview scheduling and overlap prevention
- durable email outbox and local/SMTP/n8n delivery
- recruiter invitation tokens
- safe offline CV summaries and signed n8n AI callbacks
- AI failure, retry, timeout, and stale-attempt protection

No backend logic is hidden in a cloud service. n8n and Gemini are optional integrations; the local application remains demonstrable without them.

