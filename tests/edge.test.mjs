import test from 'node:test';
import assert from 'node:assert/strict';
const env=new Map([['SUPABASE_URL','https://test.supabase.co'],['SUPABASE_ANON_KEY','public-test'],['SUPABASE_SERVICE_ROLE_KEY','server-test']]);
globalThis.Deno={env:{get:key=>env.get(key)}};
const {handle}=await import('../supabase/functions/scan-receipt/index.ts');
const uid='00000000-0000-0000-0000-000000000001',sid='00000000-0000-0000-0000-000000000002';
const originalFetch=globalThis.fetch;
let scans=[];let aiCalls=0;let aiResult;let lastAiRequest;
let invalidToken=false;let invalidImage=false;let aiFail=false;
let aiHttpStatus=500;let aiErrorPayload;let aiHeaders;
function json(value,status=200){return new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});}
function mockFetch(){globalThis.fetch=async(url,options={})=>{
  const path=String(url);
  if(path.endsWith('/auth/v1/user'))return invalidToken?json({error:'bad token'},401):json({id:uid,is_anonymous:false});
  if(path.includes('/storage/'))return new Response(invalidImage?'not a photo':new Uint8Array([137,80,78,71,13,10,26,10]),{headers:{'Content-Type':'image/png'}});
  if(path.includes('api.openai.com')){aiCalls++;lastAiRequest=JSON.parse(options.body);if(aiFail)return new Response(JSON.stringify(aiErrorPayload),{status:aiHttpStatus,headers:{'Content-Type':'application/json',...aiHeaders}});return json(aiResult);}
  if(path.includes('/receipt_scans')){
    if(options.method==='POST'){const row=JSON.parse(options.body);if(scans.some(s=>s.id===row.id))return json({},409);scans.push(row);return json(row,201);}
    const parsed=new URL(path);const id=parsed.searchParams.get('id')?.replace('eq.','');
    if(options.method==='PATCH'){const row=scans.find(s=>s.id===id);Object.assign(row,JSON.parse(options.body));return json([row]);}
    return json(id?scans.filter(s=>s.id===id):scans);
  }
  throw new Error('Unexpected URL');
};}
function req(body,auth=true,method='POST'){if(body?.mode==='live')body={consent_to_openai:true,...body};return new Request('https://test.supabase.co/functions/v1/scan-receipt',{method,headers:{...(auth?{Authorization:'Bearer valid-test-session'}:{}),'Content-Type':'application/json'},body:method==='POST'?JSON.stringify(body):undefined});}
test.beforeEach(()=>{scans=[];aiCalls=0;lastAiRequest=null;invalidToken=false;invalidImage=false;aiFail=false;aiHttpStatus=500;aiErrorPayload={error:{message:'contains-provider-secret'}};aiHeaders={};env.delete('OPENAI_API_KEY');mockFetch();});
test.after(()=>{globalThis.fetch=originalFetch;});
test('missing or invalid sessions are rejected before receipt data is accessed',async()=>{
  assert.equal((await handle(req({mode:'sample',scan_id:sid},false))).status,401);
  invalidToken=true;assert.equal((await handle(req({mode:'sample',scan_id:sid}))).status,401);
  assert.equal(scans.length,0);
});
test('sample extraction is explicitly labeled and repeat requests reuse one scan',async()=>{
  const first=await handle(req({mode:'sample',scan_id:sid}));assert.equal(first.status,200);
  const row=await first.json();assert.equal(row.metadata.mode,'sample');assert.equal(row.extracted_items.length,7);
  const replay=await handle(req({mode:'sample',scan_id:sid}));assert.equal(replay.status,200);assert.equal(scans.length,1);assert.equal(aiCalls,0);
});
test('cross-account scan IDs and private receipt paths are rejected',async()=>{
  scans=[{id:sid,user_id:'other',status:'processed'}];assert.equal((await handle(req({mode:'sample',scan_id:sid}))).status,404);
  scans=[];env.set('OPENAI_API_KEY','never-return-this');assert.equal((await handle(req({mode:'live',scan_id:sid,storage_path:`other/${sid}.png`}))).status,400);assert.equal(aiCalls,0);
});
test('missing AI credentials and malformed image bytes never trigger AI requests',async()=>{
  assert.equal((await handle(req({mode:'live',scan_id:sid}))).status,503);
  env.set('OPENAI_API_KEY','never-return-this');invalidImage=true;
  assert.equal((await handle(req({mode:'live',scan_id:sid,storage_path:`${uid}/${sid}.png`}))).status,400);assert.equal(aiCalls,0);
});
test('receipt-photo consent is required on the server',async()=>{
  env.set('OPENAI_API_KEY','never-return-this');
  const response=await handle(req({mode:'live',scan_id:sid,storage_path:`${uid}/${sid}.png`,consent_to_openai:false}));
  assert.equal(response.status,400);assert.equal(aiCalls,0);assert.equal(scans.length,0);
});
test('live output is validated, persisted and secrets stay out of the response',async()=>{
  env.set('OPENAI_API_KEY','never-return-this');
  aiResult={status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({merchant:'Test',warnings:[],skipped_non_food:0,items:[{name:'Eggs',quantity:12,unit:'item',confidence:'high',raw_line:'EGGS 12CT'}]})}]}]};
  const result=await handle(req({mode:'live',scan_id:sid,storage_path:`${uid}/${sid}.png`}));assert.equal(result.status,200);
  const text=await result.text();assert.ok(!text.includes('never-return-this'));assert.ok(!text.includes('server-test'));assert.equal(scans[0].status,'processed');assert.equal(aiCalls,1);
});
test('live extraction asks OpenAI to interpret register abbreviations while preserving raw lines',async()=>{
  env.set('OPENAI_API_KEY','never-return-this');
  aiResult={status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({merchant:'Test',warnings:['HB CHEESE WH is ambiguous.'],skipped_non_food:0,items:[{name:'Cheese',quantity:1,unit:'item',confidence:'low',raw_line:'HB CHEESE WH'}]})}]}]};
  const result=await handle(req({mode:'live',scan_id:sid,storage_path:`${uid}/${sid}.png`}));assert.equal(result.status,200);
  assert.match(lastAiRequest.instructions,/shopper-friendly pantry item/);
  assert.match(lastAiRequest.instructions,/BNLS CHKN THGH/);
  assert.match(lastAiRequest.instructions,/Never leave an understandable item as register shorthand/);
  assert.match(lastAiRequest.input[0].content[0].text,/interpret abbreviated item names/);
  assert.equal(scans[0].extracted_items[0].name,'Cheese');
  assert.equal(scans[0].extracted_items[0].raw_line,'HB CHEESE WH');
  assert.equal(scans[0].extracted_items[0].confidence,'low');
});
test('provider failures mark scans failed without falling back silently or leaking errors',async()=>{
  env.set('OPENAI_API_KEY','never-return-this');aiFail=true;
  const result=await handle(req({mode:'live',scan_id:sid,storage_path:`${uid}/${sid}.png`}));assert.equal(result.status,502);assert.equal(scans[0].status,'failed');assert.equal(scans[0].extracted_items,undefined);assert.ok(!(await result.text()).includes('contains-provider-secret'));
});
test('OpenAI quota errors require billing action and are never described as busy',async()=>{
  env.set('OPENAI_API_KEY','never-return-this');aiFail=true;aiHttpStatus=429;
  aiErrorPayload={error:{code:'insufficient_quota',type:'insufficient_quota',message:'Raw account details and never-return-this'}};
  const result=await handle(req({mode:'live',scan_id:sid,storage_path:`${uid}/${sid}.png`}));
  assert.equal(result.status,503);const body=await result.json();assert.equal(body.code,'ai_quota_exceeded');assert.equal(body.retryable,false);assert.match(body.error,/billing/i);assert.doesNotMatch(body.error,/busy|never-return-this|Raw account/);
  assert.equal(scans[0].metadata.provider_error.code,'insufficient_quota');assert.equal(aiCalls,1);
});
test('exhausted API credits have a specific action and no automatic retry',async()=>{
  env.set('OPENAI_API_KEY','never-return-this');aiFail=true;aiHttpStatus=429;
  aiErrorPayload={error:{code:'credit_balance_exhausted',type:'insufficient_quota',message:'contains-provider-secret'}};
  const result=await handle(req({mode:'live',scan_id:sid,storage_path:`${uid}/${sid}.png`}));const body=await result.json();
  assert.equal(result.status,503);assert.equal(body.retryable,false);assert.equal(body.code,'ai_quota_exceeded');assert.match(body.error,/credits are exhausted/);assert.equal(scans[0].metadata.provider_error.code,'credit_balance_exhausted');assert.equal(aiCalls,1);
});
test('temporary rate limits preserve a safe retry interval and request ID',async()=>{
  env.set('OPENAI_API_KEY','never-return-this');aiFail=true;aiHttpStatus=429;
  aiErrorPayload={error:{code:'rate_limit_exceeded',message:'contains-provider-secret'}};aiHeaders={'retry-after':'12','x-request-id':'req_test123','openai-organization':'org_test_invalid','openai-project':'proj_test123'};
  const result=await handle(req({mode:'live',scan_id:sid,storage_path:`${uid}/${sid}.png`}));
  assert.equal(result.status,429);const body=await result.json();assert.equal(body.retry_after,12);assert.equal(body.retryable,true);assert.equal(body.code,'ai_rate_limited');assert.match(body.error,/12 seconds/);assert.doesNotMatch(body.error,/contains-provider-secret/);
  assert.equal(scans[0].metadata.provider_error.request_id,'req_test123');
  assert.equal(scans[0].metadata.provider_error.project_id,'proj_test123');assert.equal(scans[0].metadata.provider_error.organization_id,undefined);
});
test('unknown provider codes and invalid key messages cannot leak credentials',async()=>{
  env.set('OPENAI_API_KEY','never-return-this');aiFail=true;aiHttpStatus=401;aiErrorPayload={error:{code:'never-return-this',message:'API key never-return-this'}};
  const result=await handle(req({mode:'live',scan_id:sid,storage_path:`${uid}/${sid}.png`}));const body=await result.json();
  assert.equal(body.code,'ai_auth_failed');assert.equal(scans[0].metadata.provider_error.code,'unknown');assert.ok(!JSON.stringify(body).includes('never-return-this'));assert.ok(!JSON.stringify(scans).includes('never-return-this'));
});
test('provider malformed or incomplete results never become pantry candidates',async()=>{
  env.set('OPENAI_API_KEY','never-return-this');aiResult={status:'completed',output:[{content:[{type:'output_text',text:'{"items":"bad"}'}]}]};
  assert.equal((await handle(req({mode:'live',scan_id:sid,storage_path:`${uid}/${sid}.png`}))).status,502);assert.equal(scans[0].status,'failed');
});
test('scan limits reject extra requests and anonymous capability probes require auth',async()=>{
  scans=Array.from({length:20},(_,i)=>({id:String(i),user_id:uid}));assert.equal((await handle(req({mode:'sample',scan_id:sid}))).status,429);
  const response=await handle(req(undefined,true,'GET'));assert.deepEqual(await response.json(),{live_ai_configured:false,sample_available:true});
  assert.equal((await handle(req(undefined,false,'GET'))).status,401);
});
