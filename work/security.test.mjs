import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

test('cloud exports require stored credentials and never serialize runtime secrets', () => {
  const folder = mkdtempSync(path.join(tmpdir(), 'ats-export-security-'));
  try {
    mkdirSync(path.join(folder, 'n8n'));
    copyFileSync(new URL('../n8n/nowshera-complete-automation.json', import.meta.url), path.join(folder, 'n8n/nowshera-complete-automation.json'));
    const secret = randomBytes(32).toString('hex');
    execFileSync(process.execPath, [new URL('./build-cloud-workflow.mjs', import.meta.url).pathname], { cwd: folder, env: { ...process.env, APP_BASE_URL: 'https://example.com', N8N_SHARED_SECRET: secret } });
    const text = readFileSync(path.join(folder, 'n8n/nowshera-cloud-ready-automation.json'), 'utf8');
    assert.ok(!text.includes(secret));
    const exported = JSON.parse(text);
    assert.equal(exported.active, false);
    for (const name of ['Hiring Email Webhook', 'AI Summary Webhook']) assert.equal(exported.nodes.find(node => node.name === name).parameters.authentication, 'headerAuth');
    for (const name of ['Confirm Hiring Email', 'Claim Due Reminders', 'Confirm Reminder Delivery', 'Get Private CV Context', 'Save AI Result or Failure']) {
      const node = exported.nodes.find(node => node.name === name);
      assert.equal(node.parameters.authentication, 'genericCredentialType');
      assert.equal(node.parameters.genericAuthType, 'httpHeaderAuth');
      assert.equal(node.parameters.headerParameters, undefined);
    }
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

test('self-hosted validators reject missing or incorrect secrets', () => {
  const workflow = JSON.parse(readFileSync(new URL('../n8n/nowshera-complete-automation.json', import.meta.url), 'utf8'));
  const secret = randomBytes(32).toString('hex');
  for (const name of ['Validate Hiring Email', 'Validate AI Request']) {
    const run = new Function('$input', '$env', workflow.nodes.find(node => node.name === name).parameters.jsCode);
    const input = value => ({ first: () => ({ json: { headers: { 'x-automation-secret': value }, body: { email_id: 1, recipient: 'person@example.com', subject: 'Test', application_id: 1, attempt_id: 'test-attempt' } } }) });
    assert.throws(() => run(input(''), {}), /Invalid automation secret/);
    assert.throws(() => run(input('incorrect'), { N8N_SHARED_SECRET: secret }), /Invalid automation secret/);
    assert.equal(run(input(secret), { N8N_SHARED_SECRET: secret }).length, 1);
  }
});
