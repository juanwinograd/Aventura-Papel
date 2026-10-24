import {chromium,devices} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {SCENES,SAVE_KEY} from '../src/content.js';
import {localURL,routeLocalGame} from './local-browser.mjs';

const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe')?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined),headless:true});
await mkdir('test-results',{recursive:true});
let page;
try{
  const context=await browser.newContext({...devices['Pixel 7'],deviceScaleFactor:1,viewport:{width:390,height:844}});
  await routeLocalGame(context);page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(localURL);await page.evaluate(async()=>{window.app=await import('./src/app.js');await app.artworkReady;});
  assert.equal(await page.locator('#touch-controls').isVisible(),false,'sin controles antes de empezar');
  await page.screenshot({path:'test-results/tactil-inicio.png',fullPage:true});
  await page.getByRole('button',{name:/Entrar en la historieta/}).tap();
  assert.equal(await page.locator('#touch-controls').isVisible(),true);
  const state=()=>page.evaluate(()=>({player:{...app.game.player},dialog:app.game.dialog,flags:app.game.flags,cube:app.game.cube,shield:app.game.shield,small:app.game.small,clones:app.game.clones,time:app.game.time}));
  const session=await context.newCDPSession(page);
  const box=async selector=>{const b=await page.locator(selector).boundingBox();assert.ok(b,selector);return {x:b.x+b.width/2,y:b.y+b.height/2};};
  const dispatch=(type,touchPoints)=>session.send('Input.dispatchTouchEvent',{type,touchPoints});
  const point=(id,p)=>({id,x:p.x,y:p.y,radiusX:3,radiusY:3,force:1});
  async function move(dx,dy,ms){const center=await box('#touch-stick');await dispatch('touchStart',[point(1,{x:center.x+dx*32,y:center.y+dy*32})]);await page.waitForTimeout(ms);await dispatch('touchEnd',[]);}
  async function hero(name){await page.locator('#touch-heroes').tap();await page.getByRole('button',{name:new RegExp(name)}).tap();}
  const paused=(await state()).player.x;await move(1,0,200);assert.equal((await state()).player.x,paused,'el diálogo impide moverse');
  for(let i=0;i<2;i++)await page.locator('#touch-interact').tap();
  assert.match(await page.locator('#speech').textContent(),/toquen su nombre junto a los controles/);
  assert.doesNotMatch(await page.locator('#speech').textContent(),/1, 2 y 3/);
  await page.locator('#touch-interact').tap();assert.equal((await state()).dialog.length,0);
  await hero('Fabrizio');assert.equal((await state()).player.hero,1);
  const stick=await box('#touch-stick'),thumb=point(1,{x:stick.x+32,y:stick.y});
  await dispatch('touchStart',[thumb]);await page.waitForTimeout(160);const before=(await state()).player.x;
  const power=point(2,await box('[data-touch-power="0"]'));
  await dispatch('touchStart',[thumb,power]);await page.waitForTimeout(220);
  assert.ok((await state()).cube,'un segundo dedo activa un poder');assert.ok((await state()).player.x>before+12,'el joystick sigue funcionando con dos dedos');
  await dispatch('touchMove',[thumb]);assert.equal(await page.locator('#touch-stick').evaluate(el=>el.classList.contains('moving')),true,'soltar el poder no suelta el joystick');
  await dispatch('touchEnd',[]);const stopped=(await state()).player.x;await page.waitForTimeout(200);assert.equal((await state()).player.x,stopped,'soltar el joystick detiene el movimiento');
  assert.equal(await page.locator('[data-touch-power="0"]').isDisabled(),true);assert.match(await page.locator('[data-touch-power="0"] .touch-power-status').textContent(),/s/);
  await dispatch('touchStart',[thumb]);await page.waitForTimeout(80);await dispatch('touchCancel',[]);const cancelled=(await state()).player.x;await page.waitForTimeout(150);assert.equal((await state()).player.x,cancelled,'cancelar el gesto detiene el movimiento');
  await page.screenshot({path:'test-results/tactil-vertical.png',fullPage:true});
  await dispatch('touchStart',[thumb]);const pause=point(2,await box('#touch-pause'));await dispatch('touchStart',[thumb,pause]);await dispatch('touchEnd',[]);
  await page.waitForFunction(()=>document.querySelector('#modal').open);const pausedTime=(await state()).time;await page.waitForTimeout(180);assert.equal((await state()).time,pausedTime);
  await page.locator('#resume').tap();const resumed=(await state()).player.x;await page.waitForTimeout(150);assert.equal((await state()).player.x,resumed,'reanudar no deja un joystick pegado');
  await dispatch('touchStart',[thumb]);await page.setViewportSize({width:844,height:390});await dispatch('touchEnd',[]);await page.waitForTimeout(120);
  assert.equal(await page.locator('#touch-stick').evaluate(el=>el.classList.contains('moving')),false);
  const world=await page.locator('#world').boundingBox(),left=await page.locator('#touch-stick').boundingBox(),right=await page.locator('#touch-powers').boundingBox();
  assert.ok(left.x+left.width<world.x+5,'joystick al costado de la viñeta');assert.ok(right.x>world.x+world.width-5,'poderes al otro costado');
  assert.ok(Math.abs(world.width/world.height-16/9)<.03,'la viñeta conserva su proporción');
  await hero('Luca');await move(1,0,550);await move(0,-1,390);await move(1,0,60);await page.locator('[data-touch-power="0"]').tap();assert.equal((await state()).flags.base_power,true,'Luca repara la consola usando solo controles táctiles');
  await page.locator('[data-touch-power="2"]').tap();assert.ok((await state()).shield>0);assert.equal(await page.locator('[data-touch-power="2"]').isDisabled(),false);await page.locator('[data-touch-power="2"]').tap();assert.equal((await state()).shield,0,'el campo se puede cancelar durante su recarga');
  await page.locator('[data-touch-power="3"]').tap();assert.equal((await state()).small,true);await page.locator('[data-touch-power="3"]').tap();assert.equal((await state()).small,false);
  await page.screenshot({path:'test-results/tactil-horizontal.png',fullPage:true});
  await page.locator('#touch-hint').tap();assert.equal(await page.locator('#modal').evaluate(el=>el.open),true);await page.getByRole('button',{name:'¡Vamos a probar!'}).tap();
  await page.locator('#touch-chapters').tap();assert.equal(await page.locator('.chapter-list').isVisible(),true);await page.getByRole('button',{name:'Cerrar',exact:true}).tap();
  for(const viewport of [{width:320,height:740},{width:640,height:360},{width:768,height:1024},{width:1024,height:768}]){
    await page.setViewportSize(viewport);await page.waitForTimeout(100);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'sin desborde '+viewport.width);
    for(const selector of ['#touch-stick','#touch-interact','[data-touch-power="0"]','#touch-heroes']){const b=await page.locator(selector).boundingBox();assert.ok(b.x>=0&&b.x+b.width<=viewport.width+1,selector+' dentro de la pantalla');assert.ok(b.width>=44&&b.height>=44,selector+' fácil de tocar');}
  }
  await page.screenshot({path:'test-results/tactil-tablet.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.reload();await page.getByRole('button',{name:'Continuar mi aventura'}).tap();assert.equal(await page.locator('#touch-hero-name').textContent(),'Luca');
  await page.evaluate(async()=>{window.app=await import('./src/app.js');});assert.equal((await state()).flags.base_power,true);
  assert.deepEqual(errors,[]);console.log('✓ Teléfono y tablet: joystick real, dos dedos, recargas, cancelación, pausa, rotación, poderes, personajes, ayuda y guardado.');

  const desktop=await browser.newContext({viewport:{width:390,height:844},hasTouch:true});await routeLocalGame(desktop);const desktopPage=await desktop.newPage();await desktopPage.goto(localURL);await desktopPage.getByRole('button',{name:/Entrar en la historieta/}).click();assert.equal(await desktopPage.locator('#touch-controls').isVisible(),false,'una computadora con pantalla táctil y ventana angosta conserva teclado y mouse');
  for(let i=0;i<2;i++)await desktopPage.keyboard.press('e');assert.match(await desktopPage.locator('#speech').textContent(),/1, 2 y 3/);await desktopPage.keyboard.press('e');await desktopPage.keyboard.press('3');
  await desktopPage.keyboard.down('ArrowRight');await desktopPage.waitForTimeout(1030);await desktopPage.keyboard.up('ArrowRight');await desktopPage.keyboard.down('ArrowUp');await desktopPage.waitForTimeout(390);await desktopPage.keyboard.up('ArrowUp');await desktopPage.keyboard.down('ArrowRight');await desktopPage.waitForTimeout(60);await desktopPage.keyboard.up('ArrowRight');await desktopPage.keyboard.press('z');
  assert.equal(await desktopPage.evaluate(async()=>(await import('./src/app.js')).game.flags.base_power),true,'en computadora siguen funcionando teclado y poderes');await desktop.close();
  const ipad=await browser.newContext({...devices['iPad Pro 11'],deviceScaleFactor:1});await routeLocalGame(ipad);const ipadPage=await ipad.newPage();await ipadPage.goto(localURL);await ipadPage.getByRole('button',{name:/Entrar en la historieta/}).tap();assert.equal(await ipadPage.locator('#touch-controls').isVisible(),true);await ipad.close();

  const flags=Object.fromEntries([...SCENES.flatMap(s=>s.requires),'secret_open','gaspar_unlocked','amaral_unlocked','victory'].map(key=>[key,true]));
  await page.evaluate(({key,flags})=>localStorage.setItem(key,JSON.stringify({version:5,scene:9,hero:7,marks:[1,2,3],flags,seen:[0,1,2,3,4,5,6,7,8,9],used:[]})),{key:SAVE_KEY,flags});
  await page.reload();await page.getByRole('button',{name:'Continuar mi aventura'}).tap();await page.evaluate(async()=>{window.app=await import('./src/app.js');});
  for(let i=0;i<7;i++)await page.locator('[data-touch-power="0"]').tap();assert.equal((await state()).clones.length,7);assert.equal(await page.locator('[data-touch-power="0"]').isDisabled(),true);
  await page.evaluate(()=>{const g=app.game,c=g.clones[0];g.bullets.push({x:c.x,y:c.y,vx:0,vy:0,life:1,source:'test'});});await page.waitForTimeout(150);assert.equal((await state()).clones.length,6);assert.equal(await page.locator('[data-touch-power="0"]').isDisabled(),false);await page.locator('[data-touch-power="0"]').tap();assert.equal((await state()).clones.length,7);
  await page.locator('#touch-heroes').tap();assert.equal(await page.locator('[data-touch-hero]').count(),8);await page.screenshot({path:'test-results/tactil-equipo.png',fullPage:true});await page.getByRole('button',{name:/Sebástian/}).tap();assert.equal((await state()).player.hero,6);
  await page.goto(localURL+'dist/El-apocalipsis-Vicente.html');await page.getByRole('button',{name:'Continuar mi aventura'}).tap();assert.equal(await page.locator('#touch-controls').isVisible(),true);await page.locator('[data-touch-power="0"]').tap();await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).used.includes('6-0'),SAVE_KEY);
  assert.deepEqual(errors,[]);console.log('✓ Activación exclusiva en móviles y tablets, ocho personajes, siete clones reemplazables y controles dentro del HTML descargable.');
}catch(error){await page?.screenshot({path:'test-results/tactil-fallo.png',fullPage:true}).catch(()=>{});throw error;}
finally{await browser.close();}
