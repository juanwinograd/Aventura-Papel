import { Adventure, distance } from './engine.js';
import { HEROES, SCENES, SAVE_KEY, COMIC_PAGES, MAX_CLONES } from './content.js';
import { Illustrator } from './art.js';
import { Soundtrack } from './audio.js';
import { illustrationsReady } from './illustrations.js';

const $=s=>document.querySelector(s);
const world=$('#world'), modal=$('#modal'), audio=new Soundtrack();
let saved=null,storageAvailable=true;
try{const raw=localStorage.getItem(SAVE_KEY);if(raw){saved=JSON.parse(raw);if(![1,2,3,4,5].includes(saved?.version))saved=null;}}catch{storageAvailable=false;}
export let game=new Adventure(saved);
const art=new Illustrator(world);
let started=false,keys=new Set(),last=0,toastTimer=0,lastHero=-1,lastScene=-1,uiTick=0,lastDialog='';
const powerKeys=['Z','X','C','V'];
function save(){
  if(!started)return;
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(game.serialize()));storageAvailable=true;$('#save-status').textContent='Guardado en este navegador ✓';}
  catch{storageAvailable=false;$('#save-status').textContent='Guardado no disponible: mantené abierta esta pestaña';}
}
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4200);}
function processEvents(){
  const events=game.events.splice(0);
  for(const event of events){
    if(event.type==='toast')toast(event.detail);
    if(event.type==='sound')audio.play(event.detail);
    if(event.type==='solved'){audio.play('secret');if(game.complete)toast(game.scene===6?'¡Completaron la viñeta secreta!':'¡Acertijo resuelto! Ya pueden avanzar.');}
    if(event.type==='save')save();
    if(event.type==='scene'){$('#scene-flash').classList.remove('turn');void $('#scene-flash').offsetWidth;$('#scene-flash').classList.add('turn');}
  }
}
function start(fresh=false){
  if(fresh)game=new Adventure();
  started=true;$('#home').hidden=true;game.start();audio.unlock();lastHero=-1;lastScene=-1;save();sync();world.focus();
}
function selectHero(index){if(modal.open)return;game.select(index);lastHero=-1;sync();if(started)world.focus();}
function powers(){
  const h=HEROES[game.player.hero];$('#power-owner').textContent=h.name.toUpperCase();
  const el=$('#powers');el.style.setProperty('--hero-color',h.color);el.style.setProperty('--hero-dark',h.dark);
  el.replaceChildren(...h.powers.map((p,i)=>{
    const button=document.createElement('button');button.className='power';button.dataset.power=i;
    button.innerHTML=`<span class="power-icon" aria-hidden="true">${p[3]}</span><span class="power-copy"><strong>${p[0]}</strong><small>${p[1]}</small></span><span class="power-key">${powerKeys[i]}</span>`;
    button.title=`${p[0]} (${powerKeys[i]}): ${p[1]}`;
    button.addEventListener('click',()=>{if(started&&!modal.open){game.use(i);sync();world.focus();}else if(!started)toast('Entrá en la historieta para probar los poderes.');});return button;
  }));
}
function makeCards(){
  const el=$('#characters');HEROES.forEach((h,i)=>{
    const button=document.createElement('button');button.className='hero-card';button.dataset.hero=i;button.style.setProperty('--hero-color',h.color);button.style.setProperty('--hero-bg',h.color+'0d');
    button.setAttribute('aria-label',`Elegir a ${h.name} (${i+1})`);
    button.innerHTML=`<canvas width="110" height="120" aria-hidden="true"></canvas><div><h3>${h.name}</h3><p>${h.trait}</p></div><span class="hero-key">${i+1}</span><span class="selected-dot" aria-hidden="true">●</span>`;
    const portrait=new Illustrator(button.querySelector('canvas'));portrait.hero(i,55,110,.9,0);
    button.addEventListener('click',()=>selectHero(i));el.append(button);
  });
}
function sync(){
  document.querySelectorAll('.hero-card').forEach((b,i)=>b.hidden=Boolean(HEROES[i].unlock&&!game.flags[HEROES[i].unlock]));
  $('#team-shortcuts').textContent='CAMBIÁ CON '+HEROES.map((h,i)=>!h.unlock||game.flags[h.unlock]?i+1:null).filter(Boolean).join(' · ');
  if(lastHero!==game.player.hero){
    lastHero=game.player.hero;powers();document.querySelectorAll('.hero-card').forEach((b,i)=>{b.classList.toggle('selected',i===lastHero);b.setAttribute('aria-pressed',String(i===lastHero));b.querySelector('.selected-dot').hidden=i!==lastHero;});
  }
  if(lastScene!==game.scene){lastScene=game.scene;$('#chapter-number').textContent=String(game.scene+1).padStart(2,'0');$('#chapter-name').textContent=game.definition.title;}
  const all=game.definition.requires,remaining=all.filter(f=>!game.flags[f]);
  const objective=started?(game.scene===7?(game.complete?'¡Aarón se sumó al equipo! Podés elegirlo con 6 en toda la aventura.':game.flags.aaron_unlocked?'Elegí a Aarón con 6 y probá Z mirando a un asistente que camina.':game.flags.time_wind?'El reloj se abrió. Acercate y hablá con Aarón.':game.flags.time_gear?'El engranaje está instalado. Amaral puede mover el molino con viento.':game.flags.time_sun?'Gaspar puede alcanzar el engranaje detrás de la cerca.':game.definition.objective):game.cinematic?(game.cinematic.kind==='fusion'?'Sebástian camina hacia la masa… ¡Fusión!':'El Ancianito los separa y reúne a Vicente con su cuerpo…'):game.scene===4?(game.flags.victory?'¡Vicente volvió! Podés explorar y ayudar a quienes quedaron en el cuartel.':game.flags.heart_fusion?'La fusión volvió. Hablá con el Ancianito para separar a Sebástian y Vicente.':game.flags.heart_power&&game.flags.heart_piece?'Las esencias están listas. Hablá con Sebástian para iniciar la fusión.':game.definition.objective):game.scene<4&&remaining.length===0?'¡Todo listo! Rodeá los peligros y andá a la salida de la derecha.':game.scene===6&&game.complete?'¡Gaspar completó su viñeta! Ya podés elegirlo en toda la aventura.':game.definition.objective):'Detener el apocalipsis… y que todo termine en una fiesta.';
  const expansionObjective=!started?null:game.scene===7&&game.complete?'¡Aarón se sumó al equipo! Seguí a la derecha para ayudar a Sebástian en la viñeta 9.':game.scene===8?(game.complete?'¡Sebástian se sumó al equipo! Seguí a la derecha hacia el barranco.':game.flags.quarry_open?'El paso está abierto. Cruzá y hablá con Sebástian.':game.definition.objective):game.scene===9?(game.complete?`¡Benicio se sumó al equipo! 8 para elegirlo · Z para crear clones: ${game.clones.length}/${MAX_CLONES}.`:game.flags.rock_bridge?'Cruzá el puente por el centro y hablá con Benicio.':game.definition.objective):null;
  $('#objective').textContent=expansionObjective||objective;$('#objective').classList.toggle('hud-complete',started&&game.complete);
  $('#marks').textContent=[1,2,3].map(n=>game.marks.includes(n)?'★':'○').join(' ');
  $('#health').textContent=Array.from({length:3},(_,i)=>i<game.player.health?'♡':'·').join(' ');$('#health').setAttribute('aria-label',`${game.player.health} oportunidades`);
  const context=started?game.context():null;
  $('#interaction').hidden=!context||game.dialog.length>0;
  if(context)$('#interaction span').textContent=context.text;
  $('#interact-button').disabled=!started||modal.open;
  $('#interact-button').innerHTML=`<kbd>E</kbd> ${context?.text||'Interactuar'} <span>↵</span>`;
  document.querySelectorAll('.power').forEach((button,i)=>{
    const cd=game.cooldowns[game.player.hero][i];const active=game.player.hero===2&&((i===2&&game.shield>0)||(i===3&&game.small));
    button.querySelector('.power-key').textContent=active?'↩':cd>0?Math.ceil(cd)+'s':powerKeys[i];
    button.setAttribute('aria-disabled',String(!started||cd>0&&!active));button.style.setProperty('--charge',cd>0?((1-cd/HEROES[game.player.hero].powers[i][2])*100)+'%':'0%');
    button.setAttribute('aria-label',`${HEROES[game.player.hero].powers[i][0]}: ${active?'activo, pulsar para cancelar':cd>0?'recargando '+Math.ceil(cd)+' segundos':'listo, tecla '+powerKeys[i]}`);
    if(game.player.hero===7){
      const full=game.clones.length>=MAX_CLONES;
      button.querySelector('.power-key').textContent=`${game.clones.length}/${MAX_CLONES}`;
      button.setAttribute('aria-disabled',String(!started||full));
      button.setAttribute('aria-label',`Clonarse: ${game.clones.length} de ${MAX_CLONES} clones vivos. ${full?'Esperá a que caiga uno.':'Listo, tecla Z, sin recarga.'}`);
    }
  });
  const dialogue=game.dialog[0];$('#bubble').hidden=!started||!dialogue;
  const key=dialogue?dialogue.join('|'):'';
  if(key!==lastDialog){lastDialog=key;if(dialogue){$('#speaker').textContent=dialogue[0];$('#speech').textContent=dialogue[1];}}
}
function showModal(html,eyebrow='CUADERNO DE AVENTURA'){
  keys.clear();game.target=null;game.running=false;$('#modal-content').innerHTML=html;$('#modal-eyebrow').textContent=eyebrow;if(!modal.open)modal.showModal();sync();
}
function closeModal(){modal.close();game.running=started;keys.clear();if(started)world.focus();}
modal.addEventListener('cancel',event=>{event.preventDefault();closeModal();});
modal.addEventListener('close',()=>{game.running=started;keys.clear();});
$('#close-modal').addEventListener('click',closeModal);
function help(){
  showModal(`<h2>${started?'Una pausa entre viñetas':'Pequeña guía de superpoderes'}</h2><p>Explorá, hablá con los personajes y combiná poderes. Cada héroe tiene una solución distinta. Las puertas se abren cuando resolvés los acertijos de la viñeta.</p><div class="controls-grid"><div><strong>Moverte</strong><p>Flechas o W A S D.<br>También podés hacer clic en el suelo.</p></div><div><strong>Cambiar de personaje</strong><p>1 Vicente · 2 Fabrizio · 3 Luca${game.flags.gaspar_unlocked?' · 4 Gaspar':''}${game.flags.amaral_unlocked?' · 5 Amaral':''}${game.flags.aaron_unlocked?' · 6 Aarón Mamani':''}.<br>O elegí su tarjeta.</p></div><div><strong>Poderes</strong><p>Z · X · C · V, o sus botones.<br>Mirá al objetivo antes de lanzar.</p></div><div><strong>Interactuar</strong><p>E o Espacio para hablar, recoger regalos y avanzar. Los regalos se abren con E al llevarlos; junto a un mecanismo, E los coloca.</p></div></div><p>Al recibir tres golpes volvés al punto de control. <b>La masa rosa te absorbe de inmediato, incluso con un escudo.</b> Crece al avanzar de viñeta, sin reloj. En el borde, Vicente debe teletransportarse al otro lado cuando la placa y el robot estén resueltos. El láser de la calle solo deja pasar a Fabrizio invisible. Lo que resolviste queda resuelto. Pedí <b>Una pista</b> cuando quieras. Los poderes se recargan solos, también al cambiar de héroe.</p><label class="volume-control">Volumen <input id="volume" type="range" min="0" max="1" step="0.05" value="${audio.volume}"></label><label class="volume-control"><input id="reduced" type="checkbox" ${art.reduced?'checked':''}> Reducir movimiento</label>${started?'<button id="resume" class="primary-button">Volver a la aventura →</button><button id="restart-screen" class="danger-button">Volver al punto de control</button>':''}<p class="credit-note">Una aventura nacida en una historieta de verdad.</p>`);
  $('#modal-content .controls-grid>div:nth-child(2) p').textContent=HEROES.map((h,i)=>!h.unlock||game.flags[h.unlock]?`${i+1} ${h.name}`:null).filter(Boolean).join(' · ')+'. O elegí su tarjeta.';
  if(game.flags.sebastian_unlocked||game.flags.benicio_unlocked){const p=document.createElement('p');p.textContent='Z de Sebástian construye el puente junto a las rocas o muros que frenan disparos. Z de Benicio crea hasta siete clones autónomos, sin recarga: si cae uno podés reemplazarlo de inmediato.';$('#modal-content').append(p);}
  $('#volume').addEventListener('input',e=>audio.volume=Number(e.target.value));$('#reduced').addEventListener('change',e=>art.reduced=e.target.checked);
  $('#resume')?.addEventListener('click',closeModal);$('#restart-screen')?.addEventListener('click',()=>{closeModal();game.enter(game.scene,false);toast('Punto de control restaurado. Lo resuelto sigue resuelto.');});
}
function chapters(){
  showModal(`<h2>Un mundo entre viñetas</h2><p>Volvé a las páginas que ya exploraste. Los acertijos resueltos y las marcas se conservan.</p><div class="chapter-list">${SCENES.map((s,i)=>{
    const locked=Boolean(s.unlock&&!game.flags[s.unlock]);
    return `<button data-scene="${i}" class="${game.scene===i?'current':''}" ${!started||!game.canEnter(i)?'disabled':''}><span>${String(i+1).padStart(2,'0')} · ${locked?'Una viñeta por descubrir':s.title}</span><span>${locked?'?':i===game.scene?'← Estás acá':game.canEnter(i)?'↗':'○'}</span></button>`;
  }).join('')}</div>${started?'<button id="new-adventure" class="danger-button">Empezar una nueva aventura</button>':''}`);
  document.querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>{const scene=Number(b.dataset.scene);closeModal();game.enter(scene);sync();}));
  $('#new-adventure')?.addEventListener('click',confirmNew);
}
function confirmNew(){
  showModal('<h2>¿Una nueva hoja en blanco?</h2><p>Se borrará el progreso guardado de esta aventura, incluidas las marcas secretas. Podés seguir explorando sin empezar de nuevo.</p><button id="confirm-new" class="primary-button">Sí, empezar de nuevo →</button><button id="keep-playing" class="text-button">Conservar mi aventura</button>');
  $('#confirm-new').addEventListener('click',()=>{closeModal();start(true);});$('#keep-playing').addEventListener('click',closeModal);
}
let page=0;
function sketchbook(){
  const current=COMIC_PAGES[page];
  showModal(`<h2>La historieta original</h2><p>De acá salió todo. Tapa y páginas originales, con las imágenes actualizadas.</p><div class="gallery-nav"><button id="prev-page" ${page===0?'disabled':''}>← Anterior</button><span>${current.label} · ${page+1} de ${COMIC_PAGES.length}</span><button id="next-page" ${page===COMIC_PAGES.length-1?'disabled':''}>Siguiente →</button></div><img class="gallery-image" src="historieta/${current.file}" alt="${current.label} de la historieta original El apocalipsis Vicente">`,'EL CUADERNO DONDE EMPEZÓ LA AVENTURA');
  $('#prev-page').addEventListener('click',()=>{page--;sketchbook();});$('#next-page').addEventListener('click',()=>{page++;sketchbook();});
}
$('#begin').addEventListener('click',()=>saved?confirmNew():start(true));
$('#continue').hidden=!saved;$('#continue').addEventListener('click',()=>start(false));
$('#help').addEventListener('click',help);$('#chapters').addEventListener('click',chapters);$('#sketchbook').addEventListener('click',sketchbook);
$('#hint').addEventListener('click',()=>{if(!started){toast('Entrá en la historieta. Las pistas te acompañan en cada viñeta.');return;}showModal(`<h2>Una idea para seguir…</h2><p>${game.definition.hint}</p><p>Acertijos resueltos: ${game.definition.requires.filter(f=>game.flags[f]).length} de ${game.definition.requires.length}.</p><button id="got-it" class="primary-button">¡Vamos a probar! →</button>`,'UNA PISTA DEL ANCIANITO');$('#got-it').addEventListener('click',closeModal);});
$('#advance').addEventListener('click',()=>{game.interact();sync();world.focus();});
$('#interact-button').addEventListener('click',()=>{if(!modal.open)game.interact();sync();world.focus();});
$('#sound').addEventListener('click',()=>{audio.enabled=!audio.enabled;audio.unlock();$('#sound').setAttribute('aria-pressed',String(audio.enabled));$('#sound').setAttribute('aria-label',audio.enabled?'Desactivar sonido':'Activar sonido');$('#sound span').textContent=audio.enabled?'Sonido activado':'Sonido apagado';if(audio.enabled)audio.play('secret');});
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!modal.open&&started){e.preventDefault();help();return;}
  if(modal.open||!started||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;
  const key=e.key.toLowerCase();
  if(['arrowup','arrowdown','arrowleft','arrowright',' ','w','a','s','d','e','z','x','c','v','1','2','3','4','5','6','7','8'].includes(key))e.preventDefault();
  keys.add(key);if(e.repeat)return;audio.unlock();
  if(['1','2','3','4','5','6','7','8'].includes(key))selectHero(Number(key)-1);
  if(key==='e'||key===' '){game.interact();sync();}
  if(['z','x','c','v'].includes(key)){game.use(['z','x','c','v'].indexOf(key));sync();}
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>keys.clear());
document.addEventListener('visibilitychange',()=>{keys.clear();if(document.hidden&&started&&!modal.open)help();});
world.addEventListener('pointerdown',e=>{
  if(!started||modal.open)return;world.focus();
  if(game.dialog.length){game.interact();sync();return;}
  const rect=world.getBoundingClientRect(),point={x:(e.clientX-rect.left)/rect.width*960,y:(e.clientY-rect.top)/rect.height*540};
  if(!game.safe(point.x,point.y))return;
  const context=game.context();if(context&&distance(point,game.player)<42){game.interact();sync();return;}
  game.target=point;
});
function frame(now){
  const dt=Math.min(.05,(now-last)/1000||0);last=now;
  if(!started)game.time+=dt;
  else if(!modal.open){const x=Number(keys.has('arrowright')||keys.has('d'))-Number(keys.has('arrowleft')||keys.has('a')),y=Number(keys.has('arrowdown')||keys.has('s'))-Number(keys.has('arrowup')||keys.has('w'));game.update(dt,{x,y});}
  processEvents();uiTick+=dt;if(uiTick>.09){sync();uiTick=0;}
  art.draw(game,!started);requestAnimationFrame(frame);
}
makeCards();sync();
if(!storageAvailable)$('#save-status').textContent='Guardado no disponible en este navegador';
export const artworkReady=Promise.all([document.fonts.ready,illustrationsReady]);
artworkReady.then(()=>requestAnimationFrame(frame));
