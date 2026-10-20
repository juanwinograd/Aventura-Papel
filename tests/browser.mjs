import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

const port=Number(process.env.TEST_PORT||3107),url=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,['scripts/server.mjs'],{env:{...process.env,PORT:String(port)},stdio:'pipe'});
let serverLog='';server.stdout.on('data',b=>serverLog+=b);server.stderr.on('data',b=>serverLog+=b);
await mkdir('test-results',{recursive:true});
let browser,page;
try {
  for(let i=0;i<70;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),headless:true,args:['--no-sandbox']});
  page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  const errors=[],failedResources=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('response',response=>{if(response.status()>=400)failedResources.push(`${response.status()} ${response.url()}`);});
  await page.goto(url);await page.evaluate(async()=>{window.adventureModule=await import('/src/app.js');await window.adventureModule.artworkReady;});
  assert.equal(await page.evaluate(async()=>(await import('/src/illustrations.js')).illustrations.size),10,'las diez ilustraciones están disponibles');
  assert.equal(await page.evaluate(async()=>{
    const {Illustrator}=await import('/src/art.js');const canvas=document.createElement('canvas');canvas.width=960;canvas.height=540;
    const illustrator=new Illustrator(canvas);illustrator.reduced=true;const game=window.adventureModule.game;
    illustrator.draw(game,true);const first=canvas.toDataURL();illustrator.draw(game,true);return first===canvas.toDataURL();
  }),true,'el lápiz mantiene los mismos trazos entre fotogramas idénticos');
  await page.screenshot({path:'test-results/inicio.png',fullPage:true});
  assert.match(await page.title(),/El apocalipsis Vicente/);
  await page.getByRole('button',{name:'¡Entrar en la historieta!'}).click();
  const state=()=>page.evaluate(async()=>{const{game:g}=await import('/src/app.js');return{scene:g.scene,flags:g.flags,player:g.player,dialog:g.dialog,marks:g.marks,used:g.used,gift:g.gift,small:g.small,shield:g.shield,cooldowns:g.cooldowns,objects:g.objects,complete:g.complete,time:g.time,party:g.party,cinematic:g.cinematic,weather:g.weather,clones:g.clones};});
  async function dismiss(){for(let i=0;i<6&&(await state()).dialog.length;i++)await page.keyboard.press('e');}
  async function walk(x,y){
    await dismiss();const box=await page.locator('#world').boundingBox();await page.mouse.click(box.x+x/960*box.width,box.y+y/540*box.height);
    await page.waitForFunction(({x,y})=>{const g=window.adventureModule.game;return Math.hypot(g.player.x-x,g.player.y-y)<9;},{x,y},{timeout:13000});
  }
  async function faceRight(){await page.keyboard.down('ArrowRight');await page.waitForTimeout(60);await page.keyboard.up('ArrowRight');}
  async function select(h){await page.keyboard.press(String(h+1));assert.equal((await state()).player.hero,h);}
  async function use(key){await page.keyboard.press(key);}
  async function flag(name){await page.waitForFunction(n=>window.adventureModule.game.flags[n]===true,name,{timeout:12000});}
  async function next(scene){if(Math.hypot((await state()).player.x-885,(await state()).player.y-455)>15)await walk(885,455);await use('e');await page.waitForFunction(n=>window.adventureModule.game.scene===n,scene,{timeout:4000});await dismiss();}
  async function mark(x,y){await walk(x,y);await use('e');}
  async function ready(hero,power){await page.waitForFunction(({hero,power})=>window.adventureModule.game.cooldowns[hero][power]===0,{hero,power},{timeout:15000});}
  async function carryPiece(x,y,slotX,slotY){await ready(0,1);await select(0);await walk(x-70,y);await faceRight();await use('x');assert.ok((await state()).gift,'se creó un regalo; estado: '+JSON.stringify(await state()));await walk(x,y);await use('e');assert.equal((await state()).gift.carried,true);await walk(slotX-50,slotY);await use('e');}

  await dismiss();await select(2);await walk(305,345);await use('z');await flag('base_power');
  await select(1);await walk(610,325);await use('z');await flag('base_reflect');
  await next(1);console.log('✓ Cuartel: electricidad, cubo y salida mediante controles reales.');

  await select(0);await walk(295,340);await use('z');await flag('street_prism');
  await walk(510,400);await page.keyboard.down('ArrowRight');await page.waitForTimeout(180);await page.keyboard.up('ArrowRight');assert.ok((await state()).player.x<522,'el láser impide cruzar visible');
  await walk(140,435);await faceRight();await use('x');assert.ok((await state()).gift);await walk(210,435);await use('e');
  await select(1);await walk(470,400);await use('x');await walk(560,400);await flag('street_sneak');assert.equal((await state()).gift.carried,true);
  await walk(750,415);await use('e');await flag('street_piece');
  await walk(610,285);await faceRight();await use('c');await flag('street_target');
  await mark(865,245);assert.deepEqual((await state()).marks,[1]);
  await next(2);console.log('✓ Calle: prisma, regalo transportado, invisibilidad, picos y primera marca.');

  await mark(95,245);await select(2);await walk(460,350);await use('v');await walk(565,350);assert.equal((await state()).small,true);
  await use('v');assert.equal((await state()).small,false);await use('z');await flag('lab_power');await use('x');await flag('lab_storm');
  await walk(720,425);await use('c');await flag('lab_escort');await use('c');
  await next(3);console.log('✓ Laboratorio: conducto pequeño, tormenta y protección del Ancianito.');

  await mark(105,245);await carryPiece(270,335,480,440);await flag('edge_plate');
  await select(1);await walk(520,315);await faceRight();await use('z');await flag('edge_reflect');
  await page.screenshot({path:'test-results/borde.png',fullPage:true});
  await select(0);await ready(0,2);await use('c');await flag('edge_teleport');assert.ok((await state()).player.x>848);await next(4);console.log('✓ Borde: placa y robot, masa bloqueando el paso y salto obligatorio de Vicente a la salida.');

  assert.equal((await state()).flags.victory,undefined);
  await select(2);await walk(225,325);await faceRight();await use('z');await flag('heart_power');
  await carryPiece(430,270,475,455);await flag('heart_piece');
  await page.screenshot({path:'test-results/corazon.png',fullPage:true});
  await walk(430,365);await use('e');await dismiss();await flag('heart_fusion');await dismiss();
  assert.equal((await state()).flags.victory,undefined,'la fusión todavía requiere al Ancianito');
  await page.screenshot({path:'test-results/fusion.png',fullPage:true});
  await walk(175,435);await use('e');await dismiss();await flag('victory');await dismiss();
  assert.equal((await state()).scene,5);await select(1);await use('v');
  await page.screenshot({path:'test-results/final.png',fullPage:true});
  assert.ok((await state()).party>4);console.log('✓ Final: Sebástian camina y se fusiona, el Ancianito separa y devuelve a Vicente; fiesta para todos.');

  await walk(450,250);await use('e');await dismiss();assert.equal((await state()).scene,6);assert.equal((await state()).player.hero,3);
  assert.equal((await state()).flags.gaspar_unlocked,true);
  await walk(400,265);await faceRight();await use('z');await flag('secret_reach');
  await walk(620,350);await faceRight();await use('x');await flag('secret_guard1');
  await walk(600,435);await faceRight();await use('v');await flag('secret_guard2');await use('c');
  assert.equal((await state()).complete,true);assert.equal(new Set((await state()).used).size,15);
  await page.screenshot({path:'test-results/secreto.png',fullPage:true});console.log('✓ Secreto: tres marcas, Gaspar, brazo elástico, superpuño, papa explosiva y teletransporte; quince poderes usados.');

  await page.reload();await page.evaluate(async()=>{window.adventureModule=await import('/src/app.js');});await page.getByRole('button',{name:'Continuar mi aventura'}).click();assert.equal((await state()).scene,6);assert.equal((await state()).flags.secret_guard2,true);assert.equal((await state()).marks.length,3);
  await page.getByRole('button',{name:'Ver viñetas'}).click();await page.getByRole('button',{name:/01 · El cuartel/}).click();assert.equal((await state()).scene,0);assert.equal((await state()).flags.base_power,true);await select(3);assert.equal(await page.locator('#power-owner').textContent(),'GASPAR');
  await walk(300,272);await faceRight();await ready(3,0);await use('z');await flag('amaral_unlocked');await dismiss();await select(4);
  assert.equal(await page.locator('#power-owner').textContent(),'AMARAL');
  for(const [key,kind] of [['z','fog'],['x','sun'],['c','wind']]){
    await use(key);assert.equal((await state()).weather.kind,kind);await page.screenshot({path:`test-results/amaral-${kind}.png`,fullPage:true});
  }
  assert.equal(new Set((await state()).used).size,18);await page.reload();await page.evaluate(async()=>{window.adventureModule=await import('/src/app.js');await window.adventureModule.artworkReady;});await page.getByRole('button',{name:'Continuar mi aventura'}).click();
  assert.equal((await state()).flags.amaral_unlocked,true);assert.equal((await state()).player.hero,4);console.log('✓ Amaral: cofre abierto con Gaspar, tres climas, dieciocho poderes y desbloqueo permanente al recargar.');
  await walk(760,250);await use('e');await dismiss();assert.equal((await state()).scene,7);
  await select(4);await ready(4,1);await use('x');await flag('time_sun');
  await select(3);await walk(400,265);await faceRight();await ready(3,0);await use('z');await flag('time_gear');
  await select(4);await ready(4,2);await use('c');await flag('time_wind');
  await walk(790,365);await use('e');await dismiss();await flag('aaron_unlocked');await select(5);
  await page.screenshot({path:'test-results/jardin-aaron.png',fullPage:true});
  await walk(685,445);await faceRight();await use('z');await flag('time_bubble');
  assert.equal((await state()).complete,true);assert.equal(new Set((await state()).used).size,19);
  assert.ok((await state()).objects.some(o=>o.patrol&&o.bubble>0));await page.screenshot({path:'test-results/burbuja-temporal.png',fullPage:true});
  await page.reload();await page.evaluate(async()=>{window.adventureModule=await import('/src/app.js');await window.adventureModule.artworkReady;});await page.getByRole('button',{name:'Continuar mi aventura'}).click();
  assert.equal((await state()).scene,7);assert.equal((await state()).player.hero,5);assert.equal((await state()).flags.time_bubble,true);
  await next(8);await select(4);await ready(4,0);await use('z');await select(5);
  await walk(425,350);await faceRight();await ready(5,0);await use('z');
  await walk(425,430);await faceRight();await ready(5,0);await use('z');
  assert.equal((await state()).objects.filter(o=>o.temporalGuardian&&o.bubble>0).length,2);
  await walk(550,390);await use('e');await flag('quarry_open');
  await walk(760,390);await use('e');await dismiss();await flag('sebastian_unlocked');await select(6);
  await page.screenshot({path:'test-results/cantera-sebastian.png',fullPage:true});
  await next(9);await walk(350,390);await faceRight();await ready(6,0);await use('z');await flag('rock_bridge');
  await walk(700,390);await flag('bridge_crossed');await walk(760,390);await use('e');await dismiss();await flag('benicio_unlocked');await select(7);
  for(let i=0;i<7;i++)await use('z');
  assert.equal((await state()).clones.length,7);await use('z');assert.equal((await state()).clones.length,7);
  assert.equal((await state()).cooldowns[7][0],0);assert.equal(new Set((await state()).used).size,21);
  await page.waitForTimeout(150);assert.match(await page.locator('.power').getAttribute('aria-label'),/7 de 7/);
  await page.screenshot({path:'test-results/puente-benicio.png',fullPage:true});
  await page.reload();await page.evaluate(async()=>{window.adventureModule=await import('/src/app.js');await window.adventureModule.artworkReady;});await page.getByRole('button',{name:'Continuar mi aventura'}).click();
  assert.equal((await state()).scene,9);assert.equal((await state()).player.hero,7);assert.equal((await state()).flags.benicio_unlocked,true);assert.equal((await state()).clones.length,0);
  console.log('✓ Cantera y puente: dos burbujas simultáneas, Sebástian, construcción y cruce del puente, Benicio, siete clones sin recarga y guardado; veintiún poderes.');
  await page.getByRole('button',{name:'Ver viñetas'}).click();await page.getByRole('button',{name:/01 · El cuartel/}).click();await select(5);
  console.log('✓ Jardín: sol, engranaje con Gaspar, viento, rescate de Aarón, burbuja sobre un asistente que camina y guardado permanente; diecinueve poderes.');
  await page.keyboard.press('Escape');assert.equal(await page.locator('#modal').evaluate(el=>el.open),true);const before=(await state()).time;await page.waitForTimeout(300);assert.equal((await state()).time,before);await page.getByRole('button',{name:'Volver a la aventura'}).click();
  await page.getByRole('button',{name:'Activar sonido'}).click();assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'Abrir la historieta'}).click();
  for(let i=0;i<13;i++){
    await page.locator('.gallery-image').evaluate(img=>img.decode());
    assert.match(await page.locator('.gallery-image').getAttribute('alt'),i===0?/Tapa/:new RegExp('Página '+i+' de'));
    if(i<12)await page.getByRole('button',{name:'Siguiente'}).click();
  }
  await page.getByRole('button',{name:'Cerrar',exact:true}).click();
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/movil.png',fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'sin desborde horizontal a 390 px');
  for(const width of [320,768]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'sin desborde a '+width+' px');}
  // Model the repository prefix used by GitHub Pages without outside access.
  await page.route(`${url}/Aventura-Papel/**`,async route=>{
    const target=new URL(route.request().url());target.pathname=target.pathname.replace(/^\/Aventura-Papel/,'')||'/';
    await route.fulfill({response:await route.fetch({url:target.href})});
  });
  await page.goto(`${url}/Aventura-Papel/`);
  await page.evaluate(async()=>{const app=await import('/Aventura-Papel/src/app.js');await app.artworkReady;});
  assert.equal(await page.evaluate(async()=>(await import('/Aventura-Papel/src/illustrations.js')).illustrations.size),10,'las ilustraciones cargan con la ruta del proyecto en GitHub Pages');
  await page.getByRole('button',{name:'Continuar mi aventura'}).click();await page.keyboard.press('6');
  assert.equal(await page.locator('#power-owner').textContent(),'AARÓN MAMANI');
  assert.deepEqual(errors,[],'sin errores JavaScript');assert.deepEqual(failedResources,[],'todos los recursos cargan');
  console.log('✓ Guardado y continuación, regreso a viñetas, pausa, sonido, historieta original, pantalla angosta y recursos bajo /Aventura-Papel/.');
} catch(error) {
  if(page)await page.screenshot({path:'test-results/fallo.png',fullPage:true}).catch(()=>{});
  console.error(serverLog);throw error;
} finally {await browser?.close();server.kill();}
