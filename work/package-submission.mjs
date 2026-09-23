import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const files = [
  '.gitignore',
  'ANTIGRAVITY-HANDOFF.md',
  'backend/README.md',
  'database/README.md',
  'database/schema.sql',
  'DEMO-WALKTHROUGH.md',
  'n8n/docker-compose.yml',
  'n8n/nowshera-cloud-ready-automation.json',
  'n8n/nowshera-complete-automation.json',
  'n8n/README.md',
  'PRIVATE-CREDENTIALS.env',
  'PROJECT-FILE-MANIFEST.md',
  'public/app.js',
  'public/favicon.svg',
  'public/file.svg',
  'public/globe.svg',
  'public/index.html',
  'public/style.css',
  'public/theme.css',
  'public/window.svg',
  'README.md',
  'server.mjs',
  'TEST-REPORT.md',
  'work/demo-seed.mjs',
  'work/submission-check.mjs',
  'work/test.mjs'
];

const lines = files.map(file => {
  const content = readFileSync(file);
  const hash = createHash('sha256').update(content).digest('hex').toUpperCase();
  const normalizedPath = file.replace(/\//g, '\\');
  return `${hash}  ${normalizedPath}`;
});

writeFileSync('SHA256SUMS.txt', lines.join('\n') + '\n');
console.log('Updated SHA256SUMS.txt with 26 files.');

// Create clean zip
const zipFiles = [...files, 'SHA256SUMS.txt'];
const zipTarget = '../Nowshera-Digital-Hiring-Antigravity-Handoff.zip';
try {
  // Use PowerShell Compress-Archive
  execSync(`powershell -Command "Compress-Archive -Path ${zipFiles.map(f => `'${f}'`).join(',')} -DestinationPath '${zipTarget}' -Force"`);
  console.log('Created updated submission zip at:', zipTarget);
} catch (e) {
  console.error('Failed to create zip:', e.message);
}
