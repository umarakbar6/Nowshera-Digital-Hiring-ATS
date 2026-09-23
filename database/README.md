# Database

`schema.sql` documents the complete final SQLite structure: nine tables, their authorization relationships, indexes, constraints, and AI-summary fields.

The application creates the operational database automatically at `data/recruitment.sqlite` when `node server.mjs` starts. Runtime records are deliberately excluded from the submission ZIP because they can contain CVs, email bodies, password hashes, sessions, and invitation tokens.

SQLite runs in WAL mode. While the server is active, recent records may be stored in `recruitment.sqlite-wal`; therefore, the main `.sqlite` file can appear small even though the database contains records. SQLite reads the main database and WAL together. Stop the server cleanly to allow SQLite to checkpoint changes into the main file.

The schema file contains definitions only—not real candidate data or credentials. Use `work/demo-seed.mjs` to create fictional demonstration records after starting the application.
