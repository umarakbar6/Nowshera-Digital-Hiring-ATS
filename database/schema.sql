PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('candidate', 'recruiter', 'admin')),
  password TEXT NOT NULL,
  cv_id INTEGER,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE cvs (
  id INTEGER PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES users(id),
  filename TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE jobs (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Full-time', 'Part-time', 'Internship')),
  description TEXT NOT NULL,
  requirements TEXT NOT NULL DEFAULT '',
  deadline TEXT NOT NULL,
  openings INTEGER NOT NULL CHECK (openings > 0),
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Open', 'Closed')),
  recruiter_id INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL
);

CREATE TABLE job_recruiters (
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  recruiter_id INTEGER NOT NULL REFERENCES users(id),
  PRIMARY KEY (job_id, recruiter_id)
);

CREATE TABLE applications (
  id INTEGER PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id),
  candidate_id INTEGER NOT NULL REFERENCES users(id),
  cv_id INTEGER NOT NULL REFERENCES cvs(id),
  stage TEXT NOT NULL CHECK (stage IN ('Applied', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected', 'Withdrawn')),
  notes TEXT NOT NULL DEFAULT '',
  ai_status TEXT NOT NULL DEFAULT 'pending' CHECK (ai_status IN ('pending', 'ready', 'unavailable')),
  ai_summary TEXT,
  ai_generated_at TEXT,
  ai_requested_at TEXT,
  ai_attempt_id TEXT,
  ai_attempts INTEGER NOT NULL DEFAULT 0,
  ai_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX active_application
ON applications(job_id, candidate_id)
WHERE stage NOT IN ('Rejected', 'Withdrawn');

CREATE INDEX applications_job ON applications(job_id, stage);

CREATE TABLE interviews (
  id INTEGER PRIMARY KEY,
  application_id INTEGER NOT NULL UNIQUE REFERENCES applications(id),
  recruiter_id INTEGER NOT NULL REFERENCES users(id),
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  location TEXT NOT NULL
);

CREATE INDEX interviews_recruiter_time
ON interviews(recruiter_id, start_at, end_at);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL
);

CREATE TABLE invitations (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  used_at TEXT
);

CREATE TABLE emails (
  id INTEGER PRIMARY KEY,
  application_id INTEGER REFERENCES applications(id),
  kind TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  sent_at TEXT,
  UNIQUE(application_id, kind)
);

