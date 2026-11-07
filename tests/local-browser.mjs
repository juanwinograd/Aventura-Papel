import {readFile} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

// Serve the real static files through Playwright routing, without network access.
export const localURL='https://chatgpt.com/aventura-local/';
const root=fileURLToPath(new URL('../',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf'};
export async function routeLocalGame(context){
  await context.route(localURL+'**',async route=>{
    const relative=decodeURIComponent(new URL(route.request().url()).pathname.slice('/aventura-local/'.length))||'index.html';
    const path=resolve(root,relative);
    if(!path.startsWith(root.endsWith(sep)?root:root+sep))return route.abort();
    try{await route.fulfill({body:await readFile(path),contentType:mime[extname(path)]||'application/octet-stream'});}
    catch{await route.fulfill({status:404,body:'Archivo no encontrado'});}
  });
}
