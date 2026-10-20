import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { ILLUSTRATION_FILES } from '../src/illustration-files.js';

const root=new URL('../',import.meta.url);
const illustrationData={};
for(const [theme,file] of Object.entries(ILLUSTRATION_FILES)){
  illustrationData[theme]='data:image/webp;base64,'+(await readFile(new URL(file,root))).toString('base64');
}
const { outputFiles }=await build({entryPoints:[fileURLToPath(new URL('src/app.js',root))],bundle:true,write:false,format:'iife',target:['es2022'],minify:true,legalComments:'inline',define:{__PAPER_ASSETS__:JSON.stringify(illustrationData)}});
const font=(await readFile(new URL('assets/PatrickHand-Regular.ttf',root))).toString('base64');
const css=(await readFile(new URL('src/style.css',root),'utf8')).replace("../assets/PatrickHand-Regular.ttf",`data:font/ttf;base64,${font}`);
const icon=encodeURIComponent(await readFile(new URL('assets/favicon.svg',root),'utf8'));
const js=outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const license=await readFile(new URL('assets/FONT-LICENSE.txt',root),'utf8');
let html=await readFile(new URL('index.html',root),'utf8');
html=html.replace('<link rel="stylesheet" href="src/style.css">',()=>`<style>${css}</style>`)
  .replace('href="assets/favicon.svg"',`href="data:image/svg+xml,${icon}"`)
  .replace('<script type="module" src="src/app.js"></script>',()=>`<script>${js}</script>`)
  .replace('id="sketchbook"','id="sketchbook" hidden')
  .replace('href="./" aria-label="El apocalipsis Vicente, inicio"','href="#" aria-label="El apocalipsis Vicente"');
await mkdir(new URL('dist/',root),{recursive:true});
html=html.replace('<!doctype html>',`<!doctype html>\n<!-- Tipografía Patrick Hand: ${license.replace(/--/g,'—')} -->`);
await writeFile(new URL('dist/El-apocalipsis-Vicente.html',root),html);
await writeFile(new URL('dist/FONT-LICENSE.txt',root),await readFile(new URL('assets/FONT-LICENSE.txt',root)));
console.log(`Juego descargable creado: dist/El-apocalipsis-Vicente.html (${Math.round(Buffer.byteLength(html)/1024)} KB). Sin dependencias de red.`);
