import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import './build.mjs';

await build({entryPoints:['public/app.js'],outfile:'dist/app.js',bundle:true,format:'esm',platform:'browser',target:'safari16',minify:false,logLevel:'info'});
const csp="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob: data:; connect-src 'self' https://*.supabase.co; object-src 'none'; base-uri 'self'; form-action 'self'";
const html=await readFile('dist/index.html','utf8');
await writeFile('dist/index.html',html.replace('<head>',`<head>\n  <meta http-equiv="Content-Security-Policy" content="${csp}">`));
console.log('Built the bundled iOS frontend. Calls use the hosted Supabase backend; no local server is needed.');
