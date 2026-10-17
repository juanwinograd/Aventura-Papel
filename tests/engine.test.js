import test from 'node:test';
import assert from 'node:assert/strict';
import { Adventure, distance } from '../src/engine.js';
import { HEROES, SCENES, MASS_AREAS, COMIC_PAGES } from '../src/content.js';
import { access } from 'node:fs/promises';

function ready(scene=0){const g=new Adventure(null,()=>.36);g.maxScene=5;g.enter(scene,false);g.running=true;g.events=[];return g;}
function tick(g,seconds){for(let t=0;t<seconds;t+=.05)g.update(.05);}
function at(g,x,y,hero,face={x:1,y:0}){g.player.x=x;g.player.y=y;if(hero!==undefined)g.select(hero);g.player.face=face;}
function useOn(g,hero,power,id,dx=-75){const o=g.objects.find(o=>o.id===id);assert.ok(o,id);at(g,o.x+dx,o.y,hero,{x:dx>0?-1:1,y:0});return g.use(power);}
function giftTo(g,id,destination){assert.equal(useOn(g,0,1,id),true);const o=g.objects.find(o=>o.id===id);at(g,o.x,o.y);g.interact();assert.equal(g.gift.carried,true);const slot=g.objects.find(o=>o.id===destination);at(g,slot.x-40,slot.y);g.interact();}
function reflect(g,id){assert.equal(useOn(g,1,0,id),true);const enemy=g.objects.find(o=>o.id===id);enemy.shot=0;tick(g,.8);assert.equal(g.flags[enemy.flag],true);}

test('las quince habilidades existen y cada héroe tiene sus recargas',()=>{const g=ready();assert.equal(HEROES.reduce((s,h)=>s+h.powers.length,0),15);assert.deepEqual(g.cooldowns.map(a=>a.length),[3,4,4,4]);});
test('el prisma contiene un enemigo, se agota y no se aplica a NPC',()=>{const g=ready(1);useOn(g,0,0,'guard');assert.equal(g.flags.street_prism,true);assert.equal(g.objects.find(o=>o.id==='guard').prism,6);tick(g,6.1);assert.equal(g.objects.find(o=>o.id==='guard').prism,0);const base=ready();at(base,120,355,0);assert.equal(base.use(0),false);assert.equal(base.cooldowns[0][0],0);});
test('el regalo conserva la pieza, viaja entre personajes y completa un mecanismo',()=>{const g=ready(1);assert.equal(useOn(g,0,1,'piece'),true);const id=g.gift.content;assert.equal(g.use(1),false);at(g,210,435);g.interact();g.select(1);assert.equal(g.gift.content,id);assert.equal(g.gift.carried,true);at(g,770,415);g.interact();assert.equal(g.flags.street_piece,true);assert.equal(g.gift,null);});
test('abrir un regalo fuera de su destino devuelve el objeto sin perderlo',()=>{const g=ready(1);useOn(g,0,1,'piece');at(g,210,435);g.interact();at(g,100,455);g.interact();assert.equal(g.gift,null);const piece=g.objects.find(o=>o.id==='piece');assert.equal(piece.inGift,false);assert.equal(piece.x,155);tick(g,4.1);assert.equal(useOn(g,0,1,'piece'),true);});
test('un enemigo equivocado no se consume en un mecanismo de piezas',()=>{const g=ready(1);useOn(g,0,1,'guard');at(g,365,340);g.interact();at(g,770,415);g.interact();assert.equal(g.flags.street_piece,undefined);assert.equal(g.gift.content,'guard');});
test('un enemigo-regalo activa la placa, persiste resuelta tras perder y no se duplica',()=>{const g=ready(3);giftTo(g,'guard','plate');assert.equal(g.flags.edge_plate,true);assert.equal(g.gift.placed,true);g.enter(3,false);assert.equal(g.flags.edge_plate,true);assert.equal(g.complete,false);assert.equal(g.gift,null);});
test('el cubo devuelve un proyectil real al lanzador',()=>{const g=ready();reflect(g,'launcher');assert.equal(g.flags.base_reflect,true);assert.ok(g.used.includes('1-0'));});
test('la invisibilidad impide detectar a Fabrizio pero permite atacar',()=>{const g=ready(1);at(g,490,400,1);g.use(1);g.objects.find(o=>o.id==='guard').shot=0;g.update(.05);assert.equal(g.bullets.length,0);assert.equal(g.flags.street_sneak,true);at(g,620,270);assert.equal(g.use(2),true);assert.equal(g.flags.street_target,true);assert.ok(g.invisible>0);tick(g,5.1);assert.equal(g.invisible,0);assert.ok(g.cooldowns[1][1]>7);});
test('los picos activan blancos, aturden enemigos y respetan la orientación',()=>{const g=ready(1);at(g,620,270,1,{x:-1,y:0});g.use(2);assert.equal(g.flags.street_target,undefined);tick(g,2.1);at(g,620,270,1);g.use(2);assert.equal(g.flags.street_target,true);tick(g,2.1);useOn(g,1,2,'guard');assert.equal(g.objects.find(o=>o.id==='guard').stun,5);});
test('la tormenta necesita energía para desplegar la antena y no pierde la consola',()=>{const g=ready(2);g.select(2);g.use(1);assert.equal(g.flags.lab_storm,undefined);g.cooldowns[2][1]=0;useOn(g,2,0,'switch');g.use(1);assert.equal(g.flags.lab_power,true);assert.equal(g.flags.lab_storm,true);});
test('el conducto exige tamaño pequeño; no se puede crecer ni cambiar adentro',()=>{const g=ready(2);at(g,490,350,2);g.move(1,0,.05);assert.equal(g.player.x,490);g.use(3);g.move(1,0,.05);assert.ok(g.player.x>493);assert.equal(g.select(0),false);assert.equal(g.use(3),false);assert.equal(g.small,true);at(g,570,350);assert.equal(g.use(3),true);assert.equal(g.small,false);});
test('el campo inmoviliza a Luca y protege a un NPC durante el cruce',()=>{const g=ready(2);g.flag('lab_power');g.flag('lab_storm');at(g,720,440,2);g.use(2);const{x,y}=g.player;g.move(1,0,.05);assert.deepEqual({x:g.player.x,y:g.player.y},{x,y});g.invulnerable=0;tick(g,3.2);assert.equal(g.player.health,3);assert.equal(g.flags.lab_escort,true);assert.ok(g.objects.find(o=>o.id==='escort').x>780);});
test('el teletransporte evita riesgos y no cruza la pared del laboratorio',()=>{for(let r=0;r<1;r+=.1){const g=ready(2);g.random=()=>r;at(g,300,440,0);g.use(2);assert.ok(g.player.x<493);assert.ok(g.safe(g.player.x,g.player.y,false));assert.equal(g.hazard(g.player.x,g.player.y),false);}const edge=ready(3);at(edge,610,440,0);edge.use(2);assert.equal(edge.hazard(edge.player.x,edge.player.y),false);assert.equal(edge.flags.edge_teleport,true);});
test('las recargas no se reinician al cambiar de héroe o de pantalla',()=>{const g=ready(1);useOn(g,0,0,'guard');g.select(1);tick(g,1);g.select(0);assert.ok(g.cooldowns[0][0]>3.9);g.enter(0,false);assert.ok(g.cooldowns[0][0]>3.9);});
test('perder restaura el punto de control, suelta regalos y conserva lo resuelto',()=>{const g=ready(1);useOn(g,0,0,'guard');useOn(g,0,1,'piece');for(let i=0;i<3;i++){g.invulnerable=0;g.hurt();}assert.equal(g.player.health,3);assert.equal(g.player.x,110);assert.equal(g.gift,null);assert.equal(g.flags.street_prism,true);assert.equal(g.objects.find(o=>o.id==='piece').inGift,false);});
test('diálogos y pausa detienen el tiempo, las recargas y los ataques',()=>{const g=ready(1);useOn(g,0,0,'guard');g.dialog=[['Ancianito','Hola']];tick(g,10);assert.equal(g.cooldowns[0][0],5);g.dialog=[];g.running=false;tick(g,10);assert.equal(g.cooldowns[0][0],5);});
test('las marcas se encuentran por proximidad, solo una vez, y abren el secreto',()=>{const g=ready();g.interact();assert.equal(g.marks.length,0);for(const scene of [1,2,3]){g.enter(scene,false);const m=SCENES[scene].mark;at(g,m.x,m.y);g.interact();g.interact();g.dialog=[];}assert.deepEqual(g.marks,[1,2,3]);g.enter(0,false);at(g,450,250);g.interact();assert.equal(g.scene,6);assert.equal(g.flags.secret_open,true);});
test('no se puede acceder a pantallas cerradas ni al secreto sin descubrirlo',()=>{const g=new Adventure();assert.equal(g.enter(2),false);assert.equal(g.enter(6),false);assert.equal(g.scene,0);});
test('el guardado valida datos, restaura el progreso y reconstruye el estado transitorio',()=>{const g=ready(1);g.flag('street_prism');g.marks=[1];g.used=['0-0'];g.gift={content:'piece',carried:true};const restored=new Adventure(g.serialize());assert.equal(restored.flags.street_prism,true);assert.deepEqual(restored.marks,[1]);assert.equal(restored.gift,null);assert.equal(restored.scene,0);const invalid=new Adventure({version:1,scene:999,hero:Infinity,marks:[1,1,3,'2',99],flags:{evil:true,secret_open:true}});assert.equal(invalid.scene,0);assert.equal(invalid.player.hero,0);assert.equal(invalid.flags.evil,undefined);assert.equal(invalid.flags.secret_open,undefined);assert.deepEqual(invalid.marks,[1,3]);});
test('la fiesta dura seis segundos y Fabrizio sale del sótano antes de que termine',()=>{const g=ready(5);g.select(1);assert.equal(g.use(3),true);assert.equal(g.party,6);assert.equal(g.partyBuried,1.4);tick(g,1.5);assert.equal(g.partyBuried,0);assert.ok(g.party>4);tick(g,4.6);assert.equal(g.party,0);});

function finishStory(g){
  const sebastian=g.objects.find(o=>o.id==='sebastian');at(g,sebastian.x-30,sebastian.y);g.interact();g.interact();assert.equal(g.cinematic.kind,'fusion');tick(g,5.3);assert.equal(g.flags.heart_fusion,true);assert.equal(g.flags.victory,undefined);g.dialog=[];
  at(g,175,435);g.interact();g.interact();assert.equal(g.cinematic.kind,'separate');tick(g,2.6);assert.equal(g.scene,5);
}
function secret(){const g=ready();g.marks=[1,2,3];g.flags.secret_open=true;g.enter(6,false);return g;}

test('la masa crece entre viñetas, sin reloj, y absorbe incluso con escudo e invulnerabilidad',()=>{
  const g=ready(3);const initial={...g.mass};tick(g,20);assert.deepEqual(g.mass,initial);
  assert.ok(MASS_AREAS[4].rx>MASS_AREAS[3].rx);assert.ok(MASS_AREAS[4].ry>MASS_AREAS[3].ry);
  for(const scene of [3,4]){g.enter(scene,false);g.flag(scene===3?'edge_plate':'heart_power');at(g,850,300,2);g.shield=5;g.invulnerable=10;g.update(.05);assert.equal(g.lastDeath,'mass');assert.equal(g.player.x,110);assert.equal(g.player.health,3);assert.equal(g.flags[scene===3?'edge_plate':'heart_power'],true);}
  for(const r of [0,.2,.5,.8,.99]){g.enter(4,false);g.random=()=>r;g.cooldowns[0][2]=0;g.select(0);g.use(2);assert.equal(g.massContact(g.player.x,g.player.y),false);}
});
test('Gaspar requiere las tres estrellas y queda disponible en toda la aventura y al recargar',()=>{
  const locked=ready();assert.equal(locked.select(3),false);
  const g=secret();assert.equal(g.player.hero,3);assert.equal(g.flags.gaspar_unlocked,true);g.enter(0,false);g.select(0);assert.equal(g.select(3),true);
  const restored=new Adventure(g.serialize());assert.equal(restored.player.hero,3);assert.equal(restored.select(1),true);assert.equal(restored.select(3),true);
});
test('el brazo elástico alcanza la llave lejana y el teletransporte respeta el puente cerrado',()=>{
  const g=secret();for(const r of [0,.4,.8,.99]){g.random=()=>r;g.cooldowns[3][2]=0;g.use(2);assert.ok(g.player.x<=540);}
  at(g,535,350);g.move(1,0,.05);assert.ok(g.player.x<=540);
  at(g,400,265,3,{x:-1,y:0});assert.equal(g.use(0),false);g.player.face={x:1,y:0};assert.equal(g.use(0),true);assert.equal(g.flags.secret_reach,true);assert.equal(g.safe(800,265),true);
});
test('superpuño y papapumba vencen asistentes; la papa vuela antes de explotar',()=>{
  const g=secret();g.flag('secret_reach');assert.equal(useOn(g,3,1,'guard1'),true);assert.equal(g.flags.secret_guard1,true);
  at(g,600,435,3);g.use(3);assert.equal(g.bombs.length,1);assert.equal(g.flags.secret_guard2,undefined);tick(g,.4);assert.equal(g.flags.secret_guard2,undefined);tick(g,.5);assert.equal(g.bombs.length,0);assert.equal(g.flags.secret_guard2,true);assert.equal(g.complete,true);g.enter(6,false);assert.equal(g.disabled(g.objects.find(o=>o.id==='guard2')),true);
});
test('Gaspar aturde a los guardias de acertijos para que sigan pudiendo convertirse en regalos',()=>{
  const g=secret();g.enter(3,false);useOn(g,3,1,'guard');const guard=g.objects.find(o=>o.id==='guard');assert.equal(guard.defeated,false);assert.equal(guard.stun,5);assert.equal(useOn(g,0,1,'guard'),true);
});
test('el final exige preparar las esencias, ver la fusión y hablar después con el Ancianito',()=>{
  const g=ready(4);at(g,430,365);g.interact();g.interact();assert.equal(g.cinematic,null);g.flag('heart_power');g.flag('heart_piece');
  at(g,175,435);g.interact();g.interact();assert.equal(g.cinematic,null);assert.equal(g.next(),false);
  at(g,430,365);g.interact();g.interact();tick(g,1);assert.ok(g.objects.find(o=>o.id==='sebastian').x>455);const t=g.cinematic.time;g.running=false;tick(g,2);assert.equal(g.cinematic.time,t);g.running=true;tick(g,4.4);
  assert.equal(g.flags.heart_fusion,true);assert.equal(g.mass,null);assert.equal(g.flags.victory,undefined);assert.equal(g.next(),false);
  for(const scene of SCENES.slice(0,4))for(const f of scene.requires)g.flag(f);const restored=new Adventure(g.serialize());restored.running=true;assert.equal(restored.scene,4);assert.equal(restored.objects.find(o=>o.id==='sebastian').character,'fusion');assert.equal(restored.mass,null);at(restored,175,435);restored.interact();restored.interact();tick(restored,2.6);assert.equal(restored.flags.heart_restored,true);assert.equal(restored.flags.victory,true);assert.equal(restored.scene,5);
});
test('las victorias y el secreto de la versión anterior conservan el progreso',()=>{
  const flags=Object.fromEntries(SCENES.slice(0,5).flatMap(s=>s.requires).filter(f=>!['heart_fusion','heart_restored'].includes(f)).map(f=>[f,true]));flags.victory=true;flags.secret_open=true;
  const g=new Adventure({version:1,scene:5,hero:2,flags,marks:[1,2,3]});assert.equal(g.scene,5);assert.equal(g.maxScene,5);assert.equal(g.flags.heart_restored,true);assert.equal(g.flags.gaspar_unlocked,true);assert.equal(g.select(3),true);
});
test('el lector contiene la tapa y las doce páginas nuevas, con archivos existentes',async()=>{
  assert.equal(COMIC_PAGES.length,13);assert.equal(COMIC_PAGES[0].file,'00_Tapa.jpg');for(const page of COMIC_PAGES)await access(new URL('../historieta/'+page.file,import.meta.url));
});

test('recorrido completo: seis pantallas, rescate, guardado y viñeta secreta',()=>{
  const g=ready();g.maxScene=0;
  assert.equal(g.next(),false);useOn(g,2,0,'console');reflect(g,'launcher');assert.equal(g.next(),true);g.dialog=[];
  useOn(g,0,0,'guard');at(g,530,400,1);g.use(1);g.update(.05);useOn(g,1,2,'target');giftTo(g,'piece','slot');assert.equal(g.complete,true);
  at(g,865,245);g.interact();g.next();g.dialog=[];
  tick(g,14);at(g,95,245);g.interact();useOn(g,2,0,'switch');g.use(1);at(g,720,440,2);g.use(2);tick(g,3.2);assert.equal(g.complete,true);g.next();g.dialog=[];
  tick(g,14);at(g,105,245);g.interact();giftTo(g,'guard','plate');g.select(0);g.use(2);reflect(g,'robot');assert.equal(g.complete,true);g.next();g.dialog=[];
  tick(g,14);useOn(g,2,0,'console');giftTo(g,'piece','slot');assert.equal(g.complete,false);assert.equal(g.next(),false);finishStory(g);g.dialog=[];
  assert.equal(g.flags.victory,true);assert.equal(g.scene,5);const saved=g.serialize();const restored=new Adventure(saved);assert.equal(restored.scene,5);assert.equal(restored.maxScene,5);assert.equal(restored.flags.victory,true);
  g.select(1);g.use(3);at(g,450,250);g.interact();g.dialog=[];assert.equal(g.scene,6);tick(g,11);
  at(g,400,265,3);g.use(0);useOn(g,3,1,'guard1');at(g,600,435,3);g.use(3);tick(g,.9);g.use(2);assert.equal(g.complete,true);
  tick(g,4);g.select(2);g.use(3);assert.equal(new Set(g.used).size,15);
});
