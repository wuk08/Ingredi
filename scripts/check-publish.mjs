// Inspect the files Git would upload without printing credential values.
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
const paths=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const patterns=[/\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}/,/\bsb_secret_[A-Za-z0-9_-]{16,}/,/\bgh[pousr]_[A-Za-z0-9]{20,}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/];
const problems=[];
for(const path of paths){
  if(/(^|\/)(node_modules|artifacts|dist|\.tools|xcuserdata)\//.test(path)||/(^|\/)\.env(?:\..+)?$/.test(path)&&!path.endsWith('.env.example'))problems.push({path,reason:'Private or generated path'});
  if(/\.(png|jpe?g|gif|zip)$/i.test(path))continue;
  const content=await readFile(path,'utf8');
  if(patterns.some(pattern=>pattern.test(content)))problems.push({path,reason:'Possible secret; review locally'});
}
if(problems.length){console.error(JSON.stringify(problems,null,2));process.exitCode=1;}
else console.log(`Checked ${paths.length} publishable files. No private paths or known secret patterns found. Publishable Supabase keys are intentionally public.`);
