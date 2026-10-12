import assert from 'node:assert/strict';
import { readFile,mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const { build }=require('esbuild');
const { Miniflare }=require('miniflare');
await mkdir('.sites-runtime/tests',{recursive:true});
await build({entryPoints:['tests/api-worker.ts'],outfile:'.sites-runtime/tests/worker.mjs',bundle:true,format:'esm',platform:'browser',target:'es2022',external:['cloudflare:workers'],alias:{'@':path.resolve('.')},conditions:['browser'],logLevel:'error'});
const mf=new Miniflare({modules:true,scriptPath:'.sites-runtime/tests/worker.mjs',compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings:{SESSION_SECRET:'test-only-session-secret-which-is-not-a-production-credential',DEMO_MODE:'true',SITE_ORIGIN:'https://test.example'},d1Databases:['DB'],r2Buckets:['BUCKET']});
try{
  const db=await mf.getD1Database('DB');const sql=await readFile('drizzle/0000_awesome_kulan_gath.sql','utf8');for(const s of sql.split('--> statement-breakpoint'))if(s.trim())await db.prepare(s.trim()).run();
  const call=async(endpoint,{method='GET',body,cookie='',origin='https://test.example',form}={})=>{const headers={...(method==='POST'?{Origin:origin}:{}),...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{})};let encoded=body?JSON.stringify(body):undefined;if(form){const upload=new Request('https://test.example'+endpoint,{method,body:form});headers['Content-Type']=upload.headers.get('content-type');encoded=await upload.arrayBuffer();}return mf.dispatchFetch('https://test.example'+endpoint,{method,headers,body:encoded});};
  assert.equal((await call('/api/app/pets',{method:'POST',body:{}})).status,401);
  assert.equal((await call('/api/app/demo',{method:'POST',body:{},origin:'https://attacker.example'})).status,403);
  const login=async()=>{const r=await call('/api/app/demo',{method:'POST',body:{}});assert.equal(r.status,200);assert.match(r.headers.get('set-cookie'),/HttpOnly/);return r.headers.get('set-cookie').split(';')[0];};
  const first=await login(),second=await login();
  assert.equal((await call('/api/app/account',{cookie:first.slice(0,-1)+'x'})).status,401);
  const image=new File([new Uint8Array([137,80,78,71,13,10,26,10])],'image.png',{type:'image/png'});
  async function upload(file,kind,cookie){const f=new FormData();f.append('file',file);f.append('kind',kind);const r=await call('/api/app/uploads',{method:'POST',form:f,cookie});assert.equal(r.status,201);return (await r.json()).id;}
  const photoId=await upload(image,'photo',first);const pedigreeId=await upload(new File(['%PDF-1.7\n%%EOF'],'pedigree.pdf',{type:'application/pdf'}),'pedigree',first);
  assert.equal((await call('/api/media/'+photoId,{cookie:second})).status,403);
  assert.match((await call('/api/media/'+photoId,{cookie:first})).headers.get('cache-control'),/private/);
  const pet={name:'Test cat',species:'cat',breed:'Test',sex:'female',born:'2022-01-01',city:'Алматы',description:'Test animal',father:'',mother:'',status:'available',consent:true,photoId,pedigreeId};
  assert.equal((await call('/api/app/pets',{method:'POST',body:pet,cookie:second})).status,403);
  assert.equal((await call('/api/app/pets',{method:'POST',body:{...pet,born:'2025-02-31'},cookie:first})).status,400);
  const create=await call('/api/app/pets',{method:'POST',body:pet,cookie:first});assert.equal(create.status,201);const petId=(await create.json()).id;
  assert.equal((await call('/api/media/'+photoId)).status,200);
  assert.equal((await call('/api/media/'+pedigreeId,{cookie:second})).status,403);
  assert.equal((await call('/api/media/'+pedigreeId,{cookie:first})).status,200);
  const publicResult=await (await call('/api/app/public/animals/'+petId)).json();assert.equal(publicResult.lineageStatus,'unknown');assert.equal('ownerId' in publicResult,false);assert.equal('pedigreeId' in publicResult,false);
  const lineage=await (await call('/api/app/public/animals/demo-iris/lineage')).json();assert.equal(lineage.evidence,'unknown');assert.equal(lineage.unknownBranches,2);
  const start=new Date(Date.now()+86400000*2).toISOString();
  const proposal={animalId:'demo-mars',startsAt:start,timezone:'Europe/Moscow',purpose:'introduction',place:'A public meeting place',note:'Test proposal'};
  const request=async(cookie)=>{const r=await call('/api/app/meetings',{method:'POST',body:proposal,cookie});assert.equal(r.status,201);return (await r.json()).id;};
  const a=await request(first),b=await request(second);
  const outcomes=await Promise.all([call('/api/app/meetings/'+a,{method:'POST',body:{action:'demo-confirm'},cookie:first}),call('/api/app/meetings/'+b,{method:'POST',body:{action:'demo-confirm'},cookie:second})]);assert.deepEqual(outcomes.map(r=>r.status).sort(),[200,409]);
  const winner=outcomes[0].status===200?a:b,winningCookie=outcomes[0].status===200?first:second,loser=winner===a?b:a,losingCookie=winner===a?second:first;
  assert.equal((await call('/api/app/meetings/'+winner,{method:'POST',body:{action:'cancel'},cookie:winningCookie})).status,200);
  assert.equal((await call('/api/app/meetings/'+loser,{method:'POST',body:{action:'demo-confirm'},cookie:losingCookie})).status,200);
  assert.equal((await call('/api/app/meetings/'+loser,{method:'POST',body:{action:'cancel'},cookie:winningCookie})).status,403);
  for(const locale of ['ru','kk','uz']){const html=await (await call('/page/'+locale)).text();assert.match(html,/<h1/);assert.ok(html.includes('demo-mars'));assert.ok(html.includes('application/ld+json'));const meta=await (await call('/meta/'+locale)).json();assert.equal(meta.robots.index,false);assert.ok(meta.alternates.canonical.endsWith('/'+locale));assert.ok(meta.alternates.languages.kk.endsWith('/kk'));}
  console.log('PASS: sessions, CSRF, file ownership/privacy, invalid birth date, public redaction, unknown lineage, concurrent reservation conflicts, cancellation authorization, and SSR/SEO in three locales.');
}finally{await mf.dispose();}
