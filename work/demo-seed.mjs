import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const origin=process.env.APP_URL||'http://127.0.0.1:3000';
const adminEmail=process.env.ADMIN_EMAIL||'admin@nowsheradigital.local';
const adminPassword=process.env.ADMIN_PASSWORD;
const demoPassword=process.env.DEMO_PASSWORD;
if(!adminPassword||!demoPassword||demoPassword.length<10) throw Error('Set ADMIN_PASSWORD and DEMO_PASSWORD (10+ characters) before seeding.');

async function request(path,method='GET',data,cookie=''){
  const res=await fetch(origin+'/api'+path,{method,headers:{'Content-Type':'application/json',cookie},body:data===undefined?undefined:JSON.stringify(data)});
  const result=await res.json().catch(()=>({}));
  return {status:res.status,body:result,cookie:res.headers.get('set-cookie')?.split(';')[0]};
}
async function login(email,password){const r=await request('/login','POST',{email,password});if(r.status!==200)throw Error(r.body.error||`Could not sign in as ${email}`);return r.cookie}
async function ensureCandidate(name,email){let r=await request('/register','POST',{name,phone:'+92 300 1234567',email,password:demoPassword});if(![201,400].includes(r.status))throw Error(r.body.error);return login(email,demoPassword)}

const admin=await login(adminEmail,adminPassword);
let recruiters=(await request('/recruiters','GET',undefined,admin)).body.recruiters;
let recruiter=recruiters.find(x=>x.email==='recruiter.demo@nowsheradigital.local');
if(!recruiter){const r=await request('/recruiters','POST',{name:'Ayesha Khan',email:'recruiter.demo@nowsheradigital.local'},admin);assert.equal(r.status,201);for(let i=0;i<20;i++){await new Promise(x=>setTimeout(x,50));const files=readdirSync(join(process.cwd(),'data','mailbox')).filter(x=>x.endsWith('-recruiter-invitation.eml'));if(files.length){const mail=readFileSync(join(process.cwd(),'data','mailbox',files.sort((a,b)=>Number(b.split('-')[0])-Number(a.split('-')[0]))[0]),'utf8'),token=mail.match(/[?&]invite=([a-f0-9]{64})/)?.[1];if(token){const accepted=await request('/invitations/'+token,'POST',{password:demoPassword});assert.equal(accepted.status,200);break}}}recruiters=(await request('/recruiters','GET',undefined,admin)).body.recruiters;recruiter=recruiters.find(x=>x.email==='recruiter.demo@nowsheradigital.local')}
if(!recruiter.active)await request(`/recruiters/${recruiter.id}`,'PATCH',{active:true},admin);
const recruiterCookie=await login(recruiter.email,demoPassword);
const candidates=[['Hamza Ali','hamza.demo@nowsheradigital.local'],['Sara Noor','sara.demo@nowsheradigital.local']];
const candidateCookies=[];
const pdf=Buffer.from('%PDF-1.4\n1 0 obj <</Type /Catalog>> endobj\n%%EOF').toString('base64');
for(const [name,email] of candidates){const cookie=await ensureCandidate(name,email);await request('/cv','POST',{filename:`${name.replace(' ','-')}-CV.pdf`,data:pdf},cookie);candidateCookies.push(cookie)}
let jobs=(await request('/jobs','GET',undefined,admin)).body.jobs;
let job=jobs.find(x=>x.title==='Senior Frontend Developer · Demo');
if(!job){const created=await request('/jobs','POST',{title:'Senior Frontend Developer · Demo',department:'Engineering',location:'Nowshera / Hybrid',type:'Full-time',description:'Build accessible, high-quality product experiences with React and modern web technologies. This role is seeded for the hackathon walkthrough.',requirements:'JavaScript, React, accessible interfaces, API integration, teamwork',deadline:new Date(Date.now()+30*86400000).toISOString().slice(0,10),openings:2,recruiter_id:recruiter.id},admin);assert.equal(created.status,201);await request(`/jobs/${created.body.id}`,'PATCH',{status:'Open',recruiter_id:recruiter.id},admin);job={id:created.body.id}}
const appIds=[];
for(const cookie of candidateCookies){let applications=(await request('/applications','GET',undefined,cookie)).body.applications;let app=applications.find(x=>x.job_id===job.id&&x.stage!=='Withdrawn'&&x.stage!=='Rejected');if(!app){const applied=await request('/applications','POST',{job_id:job.id},cookie);assert.equal(applied.status,201);app={id:applied.body.id,stage:'Applied'}}appIds.push(app.id)}
let apps=(await request('/applications','GET',undefined,recruiterCookie)).body.applications;
let first=apps.find(x=>x.id===appIds[0]);
if(first.stage==='Applied')await request(`/applications/${first.id}/stage`,'POST',{stage:'Shortlisted'},recruiterCookie);
first=(await request(`/applications/${first.id}`,'GET',undefined,recruiterCookie)).body.application;
if(first.stage==='Shortlisted'){const start=new Date(Date.now()+2*86400000);start.setUTCHours(6,0,0,0);await request(`/applications/${first.id}/interview`,'POST',{start_at:start.toISOString(),location:'Google Meet · Demo room'},recruiterCookie)}
first=(await request(`/applications/${first.id}`,'GET',undefined,recruiterCookie)).body.application;
if(first.stage==='Interview')await request(`/applications/${first.id}/stage`,'POST',{stage:'Offer'},recruiterCookie);
let second=apps.find(x=>x.id===appIds[1]);
if(second&&!['Rejected','Withdrawn','Hired'].includes(second.stage))await request(`/applications/${second.id}/stage`,'POST',{stage:'Rejected'},recruiterCookie);
console.log('Demo data is ready.');
console.log(`Admin: ${adminEmail}`);
console.log(`Recruiter: recruiter.demo@nowsheradigital.local`);
console.log(`Candidates: ${candidates.map(x=>x[1]).join(', ')}`);
