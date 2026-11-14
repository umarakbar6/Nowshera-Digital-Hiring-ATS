import { readFileSync, writeFileSync } from 'node:fs';
// Export structure only. Secrets belong in n8n's credential store.
const input = JSON.parse(readFileSync('n8n/nowshera-complete-automation.json', 'utf8'));
const base = new URL(process.env.APP_BASE_URL || 'http://127.0.0.1:3000');
if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new Error('APP_BASE_URL must be an HTTP(S) origin without credentials or query parameters.');
const origin = base.origin;
const byName = new Map(input.nodes.map(node => [node.name, node]));
for (const name of ['Hiring Email Webhook', 'AI Summary Webhook']) {
  const node = byName.get(name);
  node.parameters.authentication = 'headerAuth';
  delete node.credentials;
}
byName.get('Validate Hiring Email').parameters.jsCode = "const e=$input.first().json.body; if(!e?.email_id||!e?.recipient||!e?.subject) throw new Error('Invalid hiring email event'); return [{json:e}];";
byName.get('Validate AI Request').parameters.jsCode = "const r=$input.first().json; const id=Number(r.body?.application_id),attempt=String(r.body?.attempt_id||''); if(!id||!attempt) throw new Error('Missing application or attempt id'); return [{json:{application_id:id,attempt_id:attempt}}];";
for (const name of ['Confirm Hiring Email', 'Claim Due Reminders', 'Confirm Reminder Delivery', 'Get Private CV Context', 'Save AI Result or Failure']) {
  const node = byName.get(name);
  node.parameters.authentication = 'genericCredentialType';
  node.parameters.genericAuthType = 'httpHeaderAuth';
  delete node.parameters.headerParameters;
  delete node.parameters.sendHeaders;
  delete node.credentials;
}
byName.get('Confirm Hiring Email').parameters.url = `${origin}/api/automation/complete`;
byName.get('Claim Due Reminders').parameters.url = `${origin}/api/automation/reminders/claim`;
byName.get('Confirm Reminder Delivery').parameters.url = `${origin}/api/automation/complete`;
byName.get('Get Private CV Context').parameters.url = `={{ '${origin}/api/automation/ai/context/' + $json.application_id }}`;
byName.get('Save AI Result or Failure').parameters.url = `={{ '${origin}/api/automation/ai/' + $json.callback }}`;
const gemini = byName.get('Generate Summary with Gemini');
gemini.parameters.url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';
gemini.parameters.authentication = 'genericCredentialType';
gemini.parameters.genericAuthType = 'httpHeaderAuth';
delete gemini.parameters.headerParameters;
delete gemini.credentials;
input.name = 'Nowshera Digital · Complete Hiring Automation · Cloud Handoff';
input.active = false;
writeFileSync('n8n/nowshera-cloud-ready-automation.json', JSON.stringify(input, null, 2) + '\n');
