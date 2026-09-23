import { DatabaseSync } from 'node:sqlite';
import { randomBytes } from 'node:crypto';

const db = new DatabaseSync('data/recruitment.sqlite');
const now = new Date().toISOString();
const attempt = randomBytes(18).toString('hex');
db.exec('BEGIN IMMEDIATE');
try {
  db.prepare("INSERT INTO users(name,email,phone,role,password,active) VALUES(?,?,?,?,?,1)")
    .run('Fictional AI Candidate', `fictional.ai.${Date.now()}@example.test`, '+92 300 0000000', 'candidate', 'not-used');
  const userId = Number(db.prepare('SELECT last_insert_rowid() AS id').get().id);
  db.prepare('INSERT INTO cvs(owner_id,filename,path,created_at) VALUES(?,?,?,?)')
    .run(userId, 'fictional-ai-test.pdf', 'fictional-ai-test.pdf', now);
  const cvId = Number(db.prepare('SELECT last_insert_rowid() AS id').get().id);
  db.prepare("INSERT INTO jobs(title,department,location,type,description,requirements,deadline,openings,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)")
    .run('Frontend Developer · AI Test', 'Engineering', 'Nowshera / Hybrid', 'Full-time', 'Build accessible web applications and integrate APIs.', 'JavaScript, React, REST APIs, accessibility, teamwork', '2099-12-31', 1, 'Open', now);
  const jobId = Number(db.prepare('SELECT last_insert_rowid() AS id').get().id);
  db.prepare("INSERT INTO applications(job_id,candidate_id,cv_id,stage,notes,ai_status,ai_requested_at,ai_attempt_id,ai_attempts,created_at,updated_at) VALUES(?,?,?,'Applied','','pending',?,?,1,?,?)")
    .run(jobId, userId, cvId, now, attempt, now, now);
  const applicationId = Number(db.prepare('SELECT last_insert_rowid() AS id').get().id);
  db.exec('COMMIT');
  console.log(JSON.stringify({ applicationId, attempt }));
} catch (error) {
  db.exec('ROLLBACK');
  throw error;
}
