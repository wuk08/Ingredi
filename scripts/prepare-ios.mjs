import { spawnSync } from 'node:child_process';
import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { ensurePhotoPermissions } from './lib/ios-config.mjs';

function run(args) {
  const result=spawnSync(process.execPath,args,{stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status || 1);
}
const cli=fileURLToPath(new URL('../node_modules/@capacitor/cli/bin/capacitor',import.meta.url));
run(['scripts/build-ios.mjs']);
try {await access('ios/App/App/Info.plist');}
catch {run([cli,'add','ios','--packagemanager','SPM']);}

const path='ios/App/App/Info.plist';
await writeFile(path,ensurePhotoPermissions(await readFile(path,'utf8')));

if(process.platform==='darwin') {
  run([cli,'sync','ios']);
  console.log('iOS demo prepared. Run pnpm ios:open, choose a Simulator or your iPhone, and press Run in Xcode.');
} else {
  console.log('Generated iOS sources. On your Mac, install dependencies and run pnpm ios:prepare before opening Xcode.');
}
