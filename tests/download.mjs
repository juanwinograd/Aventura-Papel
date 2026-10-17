import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { SAVE_KEY } from '../src/content.js';
import { spawn } from 'node:child_process';

await mkdir('test-results',{recursive:true});
const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),headless:true,args:['--no-sandbox']});
const port=Number(process.env.DOWNLOAD_TEST_PORT||3108);
const server=spawn(process.execPath,['scripts/server.mjs'],{env:{...process.env,PORT:String(port)},stdio:'pipe'});
try {
  for(let i=0;i<70;i++){try{if((await fetch(`http://127.0.0.1:${port}`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  const p=await b.newPage({viewport:{width:1440,height:1100}}),errors=[],requests=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  await p.goto(`http://127.0.0.1:${port}/dist/El-apocalipsis-Vicente.html`);await p.evaluate(()=>document.fonts.ready);
  // This managed browser blocks file:// navigation. Test the exact single-file
  // artifact over HTTP, then remove connectivity to verify self-containment.
  await p.context().setOffline(true);
  await p.getByRole('button',{name:'¡Entrar en la historieta!'}).click();for(let i=0;i<3;i++)await p.keyboard.press('e');
  await p.keyboard.press('3');await p.keyboard.down('ArrowRight');await p.waitForTimeout(1000);await p.keyboard.up('ArrowRight');await p.keyboard.down('ArrowUp');await p.waitForTimeout(390);await p.keyboard.up('ArrowUp');await p.keyboard.down('ArrowRight');await p.waitForTimeout(40);await p.keyboard.up('ArrowRight');await p.keyboard.press('z');
  await p.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).flags.base_power===true,SAVE_KEY);
  assert.equal(await p.locator('#home').isVisible(),false);assert.deepEqual(errors,[]);assert.equal(requests.length,1,'solo se solicita el documento inicial');
  await p.screenshot({path:'test-results/descargable.png',fullPage:true});
  await p.context().setOffline(false);await p.reload();await p.getByRole('button',{name:'Continuar mi aventura'}).click();
  assert.equal(await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).flags.base_power,SAVE_KEY),true);
  console.log('✓ HTML autónomo: inicio, movimiento, cambio de héroe, poder y guardado sin conexión; continuación al recargar. Sin recursos externos ni errores. file:// bloqueado por la política del navegador administrado.');
} finally {await b.close();server.kill();}
