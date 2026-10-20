import test from 'node:test';
import assert from 'node:assert/strict';
import {Adventure} from '../src/engine.js';
import {SCENES,ROCK_BRIDGE,MAX_CLONES} from '../src/content.js';

function tick(g,seconds,move={x:0,y:0}){for(let t=0;t<seconds;t+=.05)g.update(.05,move);}
function at(g,x,y,hero,face={x:1,y:0}){g.player.x=x;g.player.y=y;if(hero!==undefined)g.select(hero);g.player.face=face;}
function dismiss(g){while(g.dialog.length)g.interact();}
function quarry(){
  const g=new Adventure(null,()=>.36);g.marks=[1,2,3];
  for(const f of ['secret_open','gaspar_unlocked','amaral_unlocked','time_sun','time_gear','time_wind','aaron_unlocked','time_bubble'])g.flag(f);
  g.enter(8,false);g.running=true;g.invulnerable=100;return g;
}
function openQuarry(g){
  g.select(5);const first=g.objects.find(o=>o.id==='quarry-guard1');
  at(g,first.x-75,first.y);assert.equal(g.use(0),true);
  tick(g,5.05);const second=g.objects.find(o=>o.id==='quarry-guard2');
  at(g,second.x-75,second.y);assert.equal(g.use(0),true);
  at(g,550,390);g.interact();assert.equal(g.flags.quarry_open,true);
}
function bridge(){
  const g=quarry();openQuarry(g);at(g,760,390);g.interact();dismiss(g);
  at(g,885,455);g.interact();dismiss(g);assert.equal(g.scene,9);g.select(6);return g;
}
function benicio(){
  const g=bridge();at(g,350,390,6);g.use(0);
  tick(g,1.7,{x:1,y:0});assert.equal(g.flags.bridge_crossed,true);
  at(g,760,390);g.interact();dismiss(g);g.select(7);return g;
}

test('las viñetas 9 y 10 exigen los rescates previos y no adelantan la aventura principal',()=>{
  const locked=new Adventure();assert.equal(SCENES.length,10);
  for(const i of [8,9])assert.equal(locked.enter(i),false);
  for(const i of [6,7])assert.equal(locked.select(i),false);
  const g=quarry();assert.equal(g.canEnter(9),false);assert.equal(g.next(),false);
  assert.equal(new Adventure(g.serialize()).maxScene,0);
  g.enter(7,false);assert.equal(g.complete,true);at(g,885,455);g.interact();assert.equal(g.scene,8);
});

test('el cerrojo exige dos burbujas simultáneas: una, prismas o regalos no alcanzan',()=>{
  const g=quarry(),guards=g.objects.filter(o=>o.temporalGuardian);
  at(g,550,390);g.interact();assert.equal(g.flags.quarry_open,undefined);
  guards[0].bubble=1;g.interact();assert.equal(g.flags.quarry_open,undefined);
  guards[1].prism=6;guards[1].stun=6;g.interact();assert.equal(g.flags.quarry_open,undefined);
  guards[1].bubble=7;guards[1].inGift=true;g.interact();assert.equal(g.flags.quarry_open,undefined);
  guards[1].inGift=false;tick(g,1.1);g.interact();assert.equal(g.flags.quarry_open,undefined,'la primera burbuja se agotó');
});

test('Aarón abre el cerrojo con su recarga real y Sebástian se suma al hablar',()=>{
  const g=quarry();openQuarry(g);assert.equal(g.flags.sebastian_unlocked,undefined);
  assert.equal(g.safe(610,390),true);at(g,760,390);g.interact();
  assert.equal(g.flags.sebastian_unlocked,true);dismiss(g);assert.equal(g.select(6),true);
  const saved=new Adventure(g.serialize());assert.equal(saved.flags.sebastian_unlocked,true);
  assert.equal(saved.player.hero,6);assert.equal(saved.canEnter(9),true);assert.equal(saved.maxScene,0);
});

test('no se puede saltar el cerrojo ni el barranco con teletransporte, invisibilidad o tamaño mini',()=>{
  const g=quarry();at(g,550,390,0);g.invisible=5;g.small=true;
  assert.equal(g.safe(610,390),false);assert.equal(g.use(2),true);assert.ok(g.player.x<590);
  const b=bridge();at(b,440,390,3);assert.equal(b.use(2),true);assert.ok(b.player.x<ROCK_BRIDGE.left);
  assert.equal(b.flags.rock_bridge,undefined);assert.equal(b.safe(550,390),false);
});

test('el puente necesita a Sebástian cerca, mirando las rocas, y solo se cruza por el centro',()=>{
  const g=bridge();at(g,350,390,0);g.use(0);assert.equal(g.flags.rock_bridge,undefined);
  at(g,350,390,6,{x:-1,y:0});g.use(0);assert.equal(g.flags.rock_bridge,undefined);
  g.cooldowns[6][0]=0;at(g,350,390,6);assert.equal(g.use(0),true);assert.equal(g.flags.rock_bridge,true);
  assert.equal(g.safe(550,390),true);assert.equal(g.safe(550,300),false);assert.equal(g.safe(550,450),false);
  g.select(0);g.use(2);assert.ok(g.player.x<ROCK_BRIDGE.left,'hay que cruzarlo caminando antes de saltarlo');
  at(g,760,390);g.interact();assert.equal(g.flags.benicio_unlocked,undefined,'hablar desde el otro lado sin cruzar no alcanza');
  at(g,350,390);tick(g,1.7,{x:1,y:0});assert.equal(g.flags.bridge_crossed,true);
  at(g,760,390);g.interact();assert.equal(g.flags.benicio_unlocked,true);assert.equal(g.complete,true);
});

test('los muros de Sebástian frenan tres disparos y se agotan; el puente persiste',()=>{
  const g=benicio();g.enter(0,false);g.cooldowns[6][0]=0;at(g,300,400,6);assert.equal(g.use(0),true);
  const rock=g.constructions[0];assert.equal(rock.hits,3);
  for(let i=0;i<3;i++){g.bullets.push({x:rock.x,y:rock.y,vx:0,vy:0,life:1,source:'launcher'});g.update(.05);}
  g.update(.05);assert.equal(g.constructions.length,0);
  g.cooldowns[6][0]=0;g.use(0);tick(g,10.1);assert.equal(g.constructions.length,0);
  assert.equal(g.flags.rock_bridge,true);g.enter(9,false);assert.equal(g.safe(550,390),true);
});

test('Benicio crea siete clones consecutivos sin recarga y rechaza el octavo',()=>{
  const g=benicio();for(let i=0;i<MAX_CLONES;i++){assert.equal(g.use(0),true);assert.equal(g.cooldowns[7][0],0);}
  assert.equal(g.clones.length,7);assert.equal(g.use(0),false);assert.equal(g.clones.length,7);
  assert.ok(g.clones.every(c=>g.safe(c.x,c.y,false)&&!g.hazard(c.x,c.y)));
});

test('los clones caminan y atacan solos, siguen activos al cambiar de personaje y protegen a los NPC',()=>{
  const g=benicio();g.enter(9,false);at(g,710,280,7);g.use(0);const clone=g.clones[0],before={x:clone.x,y:clone.y};
  g.select(0);tick(g,.5);assert.notDeepEqual({x:clone.x,y:clone.y},before);
  assert.equal(g.objects.find(o=>o.id==='clone-guard1').defeated,true);
  assert.equal(g.objects.find(o=>o.id==='benicio').defeated,false);
  assert.equal(g.player.hero,0);assert.equal(g.clones.length,1);
});

test('un disparo mata al clon y se puede reponer inmediatamente aunque haya siete',()=>{
  const g=benicio();g.enter(0,false);at(g,300,440,7);
  for(let i=0;i<7;i++)g.use(0);
  g.objects=[];g.bullets.push({x:g.clones[0].x,y:g.clones[0].y,vx:0,vy:0,life:1,source:'test'});
  const health=g.player.health;g.update(.05);assert.equal(g.clones.length,6);assert.equal(g.player.health,health);
  assert.equal(g.use(0),true);assert.equal(g.clones.length,7);assert.equal(g.cooldowns[7][0],0);
});

test('los clones aparecen separados y el campo de Luca también los protege',()=>{
  const g=benicio();g.enter(0,false);at(g,300,440,7);g.use(0);g.use(0);
  assert.notDeepEqual({x:g.clones[0].x,y:g.clones[0].y},{x:g.clones[1].x,y:g.clones[1].y});
  g.objects=[];g.select(2);g.use(2);const c=g.clones[0];
  g.bullets.push({x:c.x,y:c.y,vx:0,vy:0,life:1,source:'test'});g.update(.05);
  assert.equal(g.clones.length,2);assert.equal(g.bullets.length,0);
});

test('los enemigos apuntan al clon más cercano y la masa también puede eliminar clones',()=>{
  const g=benicio();g.maxScene=5;g.enter(1,false);at(g,200,340,7);g.use(0);const clone=g.clones[0];clone.x=280;clone.y=340;
  const guard=g.objects.find(o=>o.id==='guard');guard.shot=0;g.update(.05);
  assert.ok(g.bullets[0].vx<0);assert.ok(Math.abs(g.bullets[0].vy)<5);
  g.enter(3,false);g.select(7);g.use(0);const c=g.clones[0];c.x=740;c.y=400;g.update(.05);assert.equal(g.clones.length,0);
});

test('los clones respetan paredes y pausa, no caducan y se limpian al salir o perder',()=>{
  const g=benicio();g.enter(2,false);at(g,480,300,7);g.use(0);g.objects=[];
  tick(g,12);assert.equal(g.clones.length,1);assert.ok(g.clones[0].x<493);
  const before={...g.clones[0]};g.dialog=[['Benicio','¡Pausa!']];tick(g,3);assert.deepEqual(g.clones[0],before);
  dismiss(g);g.enter(0,false);assert.equal(g.clones.length,0);g.use(0);assert.equal(g.clones.length,1);
  for(let i=0;i<3;i++){g.invulnerable=0;g.hurt();}assert.equal(g.clones.length,0);assert.equal(g.flags.benicio_unlocked,true);
});

test('el guardado conserva los nuevos héroes y poderes, pero reconstruye clones y muros',()=>{
  const g=benicio();g.use(0);g.select(6);g.cooldowns[6][0]=0;g.use(0);g.select(7);
  const restored=new Adventure(g.serialize());assert.equal(restored.flags.benicio_unlocked,true);
  assert.equal(restored.flags.bridge_crossed,true);assert.equal(restored.scene,9);assert.equal(restored.player.hero,7);
  assert.ok(restored.used.includes('6-0'));assert.ok(restored.used.includes('7-0'));
  assert.deepEqual(restored.clones,[]);assert.deepEqual(restored.constructions,[]);
  const forged=new Adventure({version:5,scene:9,hero:7,flags:{sebastian_unlocked:true,rock_bridge:true,bridge_crossed:true,benicio_unlocked:true}});
  assert.equal(forged.flags.benicio_unlocked,undefined);assert.equal(forged.player.hero,0);assert.equal(forged.scene,0);
});

test('los guardados de versión 4 con Aarón descubren la cantera sin reiniciar',()=>{
  const g=quarry();g.enter(7,false);const saved=g.serialize();saved.version=4;const restored=new Adventure(saved);
  assert.equal(restored.scene,7);assert.equal(restored.canEnter(8),true);assert.equal(restored.canEnter(9),false);
  assert.equal(restored.flags.aaron_unlocked,true);assert.equal(restored.marks.length,3);
});
