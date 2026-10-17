import { HEROES, SCENES, FLAG_NAMES } from './content.js';

export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export class Adventure {
  constructor(saved=null, random=Math.random) {
    this.random=random;
    this.flags={}; this.marks=[]; this.used=[]; this.seen=[]; this.maxScene=0;
    this.player={x:110,y:420,hero:0,face:{x:1,y:0},health:3};
    this.cooldowns=HEROES.map(h=>h.powers.map(()=>0));
    this.events=[]; this.time=0; this.gift=null; this.running=false; this.dialog=[];
    if(saved) this.restore(saved);
    this.enter(this.scene??0, false);
  }
  restore(saved) {
    if(!saved || saved.version!==1) return;
    const ints=(arr,allowed)=>Array.isArray(arr)?[...new Set(arr.filter(n=>Number.isInteger(n)&&allowed.includes(n)))]:[];
    for(const key of FLAG_NAMES) if(saved.flags?.[key]===true) this.flags[key]=true;
    this.marks=ints(saved.marks,[1,2,3]);
    this.seen=ints(saved.seen,[0,1,2,3,4,5,6]);
    this.used=Array.isArray(saved.used)?[...new Set(saved.used.filter(p=>typeof p==='string'&&/^[0-2]-[0-3]$/.test(p)&&HEROES[Number(p[0])].powers[Number(p[2])]))]:[];
    this.maxScene=0;
    while(this.maxScene<5&&SCENES[this.maxScene].requires.every(f=>this.flags[f])) this.maxScene++;
    if(!this.flags.victory) this.maxScene=Math.min(this.maxScene,4);
    if(this.flags.secret_open&&this.marks.length!==3) delete this.flags.secret_open;
    this.scene=Number.isInteger(saved.scene)&&saved.scene>=0&&saved.scene<=this.maxScene?saved.scene:0;
    if(saved.scene===6&&this.flags.secret_open) this.scene=6;
    this.player.hero=Number.isInteger(saved.hero)?clamp(saved.hero,0,2):0;
  }
  serialize() { return {version:1,scene:this.scene,maxScene:this.maxScene,hero:this.player.hero,flags:{...this.flags},marks:[...this.marks],used:[...this.used],seen:[...this.seen]}; }
  emit(type,detail) { this.events.push({type,detail}); }
  toast(text) { this.emit('toast',text); }
  flag(key) {
    if(!FLAG_NAMES.includes(key)||this.flags[key])return;
    this.flags[key]=true; this.emit('solved',key); this.emit('save');
  }
  get definition(){return SCENES[this.scene];}
  get complete(){return this.definition.requires.every(k=>this.flags[k]);}
  start() { this.running=true; this.intro(); }
  intro() {
    if(!this.seen.includes(this.scene)) {
      this.seen.push(this.scene);
      this.dialog=this.definition.intro?.map(d=>[...d])||[];
      if(this.scene===5) this.dialog=[['Vicente','¡Volví! Y esta vez soy del tamaño correcto. Gracias, amigos.'],['Reportero','Fin del apocalipsis. ¡Principio de la fiesta! Todavía pueden explorar las viñetas y encontrar el nivel secreto.']];
      if(this.scene===6) this.dialog=[['Los tres','¡Una página que nadie había dibujado! Hagámosla nuestra.']];
      this.emit('save');
    }
  }
  enter(scene, intro=true) {
    if(!Number.isInteger(scene)||!SCENES[scene])return false;
    if(scene===6&&!this.flags.secret_open)return false;
    if(scene!==6&&scene>this.maxScene)return false;
    this.scene=scene;
    this.objects=this.definition.objects.map(o=>({...o,prism:0,stun:0,inGift:false,shot:2.3}));
    this.player.x=110;this.player.y=420;this.player.health=3;
    this.player.face={x:1,y:0};
    this.gift=null; this.invisible=0; this.shield=0; this.small=false; this.cube=null; this.party=0;this.storm=0; this.invulnerable=1;
    this.bullets=[];this.effects=[];this.target=null;this.dialog=[];this.escortTime=0;
    if(intro&&this.running)this.intro();
    this.emit('scene',scene);this.emit('save');
    return true;
  }
  select(hero) {
    if(!Number.isInteger(hero)||!HEROES[hero]||hero===this.player.hero)return false;
    if(this.small&&!this.safe(this.player.x,this.player.y,false)){this.toast('Primero salí del pasadizo con Luca.');return false;}
    this.player.hero=hero;this.small=false;this.shield=0;this.invisible=0;
    this.emit('select',hero);this.emit('save');return true;
  }
  safe(x,y,small=this.small) {
    if(x<62||x>897||y<235||y>477)return false;
    if(this.scene===2&&x>493&&x<548&&!(small&&y>329&&y<369))return false;
    return true;
  }
  hazard(x,y) {
    if(this.scene===3)return x>560&&x<695&&y>390;
    if(this.scene===2&&!this.flags.lab_escort&&this.flags.lab_storm)return x>690&&x<830&&y>392;
    if(this.scene===4&&!this.flags.heart_escort)return x>490&&x<660&&y>390;
    return false;
  }
  move(dx,dy,dt) {
    if(this.shield>0)return;
    const n=Math.hypot(dx,dy);if(!n)return;
    dx/=n;dy/=n;this.player.face={x:dx,y:dy};
    const speed=this.small?140:190;
    const x=this.player.x+dx*speed*dt,y=this.player.y+dy*speed*dt;
    if(this.safe(x,this.player.y))this.player.x=x;
    if(this.safe(this.player.x,y))this.player.y=y;
  }
  aimTarget(types,reach, facing=false) {
    return this.objects.filter(o=>types.includes(o.type)&&!o.inGift&&!this.disabled(o)&&distance(o,this.player)<reach&&(!facing||this.inFront(o)))
      .sort((a,b)=>distance(a,this.player)-distance(b,this.player))[0];
  }
  inFront(o) {
    const d=distance(o,this.player)||1;
    return ((o.x-this.player.x)*this.player.face.x+(o.y-this.player.y)*this.player.face.y)/d>0.15;
  }
  disabled(o){return Boolean(o.flag&&this.flags[o.flag]&&['turret','piece','target'].includes(o.type)) || (o.type==='piece'&&this.flags[this.pieceFlag()]);}
  pieceFlag(){return ({1:'street_piece',4:'heart_piece',6:'secret_piece'})[this.scene];}
  use(index) {
    if(!this.running||this.dialog.length)return false;
    const h=this.player.hero,power=HEROES[h].powers[index];if(!power)return false;
    if(h===2&&index===2&&this.shield>0){this.shield=0;this.toast('Campo de fuerza desactivado.');return true;}
    if(h===2&&index===3&&this.small) {
      if(!this.safe(this.player.x,this.player.y,false)){this.toast('Acá no hay espacio para crecer. Salí del pasadizo.');return false;}
      this.small=false;this.cooldowns[h][index]=3;this.emit('sound','small');return true;
    }
    if(this.cooldowns[h][index]>0){this.toast('Ese poder está recargando. Probá otro mientras tanto.');return false;}
    let target;
    if(h===0&&index===0) {
      target=this.aimTarget(['enemy'],235,true);
      if(!target){this.toast('Acercate a un enemigo y miralo para crear el prisma.');return false;}
      for(const o of this.objects)o.prism=0;
      target.prism=6;if(target.prismFlag)this.flag(target.prismFlag);
      this.effect('prism',target,6);this.toast('¡Encerrado! Tenés seis segundos.');
    } else if(h===0&&index===1) {
      if(this.gift){this.toast('Ya hay un regalo. Recogelo con E y abrilo o llevalo a su destino.');return false;}
      target=this.aimTarget(['piece','enemy'],170,true);
      if(!target){this.toast('Mirá un objeto suelto o un enemigo cercano para envolverlo.');return false;}
      target.inGift=true;this.gift={x:target.x,y:target.y,content:target.id,carried:false,placed:false};
      this.effect('puf',target,0.8);this.toast('¡Un regalo! E para recogerlo.');
    } else if(h===0&&index===2) {
      const positions=[{x:125,y:440},{x:210,y:260},{x:415,y:450},{x:810,y:460},{x:865,y:270}].filter(p=>this.safe(p.x,p.y,false)&&!this.hazard(p.x,p.y)&&distance(p,this.player)>100);
      // A wall may never be skipped by a teleport, even if its destination is safe.
      const reachable=positions.filter(p=>this.scene!==2||((p.x<493)===(this.player.x<493)));
      if(!reachable.length){this.toast('No hay otro lugar seguro al que saltar.');return false;}
      this.effect('puf',this.player,0.7);const p=reachable[Math.floor(this.random()*reachable.length)];
      this.player.x=p.x;this.player.y=p.y;this.invulnerable=2;this.target=null;
      if(this.scene===3)this.flag('edge_teleport');this.toast('¡Puf! Fuera de peligro.');
    } else if(h===1&&index===0) {
      const p=this.player;this.cube={x:p.x+p.face.x*55,y:p.y+p.face.y*55,time:4};
      this.toast('Cubo listo. ¡Que prueben su propio disparo!');
    } else if(h===1&&index===1) {
      this.invisible=5;this.toast('Invisible por cinco segundos. Podés atacar sin aparecer.');
    } else if(h===1&&index===2) {
      target=this.aimTarget(['target','enemy'],250,true);
      if(target){if(target.type==='target')this.flag(target.flag);else target.stun=5;this.effect('spikes',{x:target.x,y:target.y},0.7);}
      else this.effect('spikes',{x:this.player.x+this.player.face.x*140,y:this.player.y+this.player.face.y*140},0.6);
    } else if(h===1&&index===3) {
      this.party=2;this.effect('party',this.player,2);
      if(this.scene===6)this.flag('secret_party');this.toast('¡Sótano abierto, fiesta encendida!');
    } else if(h===2&&index===0) {
      target=this.aimTarget(['electric'],175,true)||this.aimTarget(['enemy'],225,true);
      if(target){if(target.type==='electric'){this.flag(target.flag);this.toast('¡Energía restaurada!');}else target.stun=4;this.effect('ray',target,0.6);}
      else {this.effect('ray',{x:this.player.x+this.player.face.x*145,y:this.player.y+this.player.face.y*145},0.5);this.toast('Las máquinas con ϟ necesitan tu electricidad.');}
    } else if(h===2&&index===1) {
      this.storm=3;
      for(const o of this.objects)if(o.type==='enemy')o.stun=3;
      if(this.scene===2) {
        if(this.flags.lab_power){this.flag('lab_storm');this.toast('¡La antena se desplegó! Ahora falta ayudar al Ancianito.');}
        else this.toast('La tormenta necesita la consola encendida para desplegar la antena.');
      } else this.toast('¡Tormenta en toda la viñeta!');
    } else if(h===2&&index===2) {
      this.shield=5;this.target=null;this.toast('Campo de fuerza: quedate cerca de quien necesite protección.');
    } else if(h===2&&index===3) { this.small=true;this.toast('¡Chiquitito! V de nuevo para crecer cuando haya espacio.'); }
    this.cooldowns[h][index]=power[2];
    const key=`${h}-${index}`;if(!this.used.includes(key))this.used.push(key);
    this.emit('power',{hero:h,index});this.emit('sound',h===2?'electric':index===3?'party':'puf');this.emit('save');return true;
  }
  effect(type,point,time){this.effects.push({type,x:point.x,y:point.y,time,total:time});}
  context() {
    if(this.dialog.length)return {type:'dialog',text:'Seguir leyendo'};
    if(this.definition.mark&&!this.marks.includes(this.scene)&&distance(this.player,this.definition.mark)<75)return {type:'mark',text:'Investigar el margen'};
    if(this.gift?.carried) {
      const slot=this.aimTarget(['slot','plate'],105);
      return {type:'gift',text:slot?`Colocar en ${slot.name.toLowerCase()}`:'Abrir el regalo',object:slot};
    }
    if(this.gift&&!this.gift.placed&&distance(this.player,this.gift)<85)return {type:'pickup',text:'Recoger el regalo'};
    if(this.player.x>848&&this.scene<5)return {type:'exit',text:this.scene===4?'Reunir las esencias':'Ir a la siguiente viñeta'};
    const o=this.aimTarget(['npc','escort','secret-door','slot','plate','electric','scanner','target','piece','antenna','turret'],90);
    if(o)return {type:'object',text:o.type==='secret-door'?'Investigar el dibujo':o.type==='npc'||o.type==='escort'?`Hablar con ${o.name}`:`Examinar ${o.name.toLowerCase()}`,object:o};
    return null;
  }
  interact() {
    if(!this.running)return;
    const action=this.context();if(!action){this.toast('Acercate a un personaje, un objeto o una salida.');return;}
    if(action.type==='dialog'){this.dialog.shift();return;}
    if(action.type==='mark'){this.marks.push(this.scene);this.toast(`¡Una marca secreta! ${this.marks.length} de 3.`);this.effect('star',this.definition.mark,1.5);this.emit('sound','secret');this.emit('save');return;}
    if(action.type==='pickup'){this.gift.carried=true;this.toast('Regalo en manos. E lo coloca en su destino o lo abre.');return;}
    if(action.type==='gift') {
      const o=action.object;
      if(o) {
        if(o.type==='plate'){this.gift.carried=false;this.gift.placed=true;this.gift.x=o.x;this.gift.y=o.y;this.flag(o.flag);this.toast('¡La placa se activó con el peso del regalo!');}
        else if(this.objects.find(obj=>obj.id===this.gift.content)?.type==='piece'){this.flag(o.flag);this.gift=null;this.toast('¡La pieza está en su sitio!');}
        else {this.toast('Este mecanismo necesita una pieza, no un enemigo.');return;}
      } else {
        const content=this.objects.find(obj=>obj.id===this.gift.content);
        content.inGift=false;content.x=clamp(this.player.x+55,65,890);content.y=this.player.y;content.stun=3;this.gift=null;this.toast('¡Regalo abierto!');
      }
      this.emit('sound','puf');return;
    }
    if(action.type==='exit'){this.next();return;}
    const o=action.object;
    if(o.type==='secret-door') {
      if(this.marks.length===3){this.flag('secret_open');this.enter(6);}
      else this.dialog=[['Una nota en el dibujo',`«Buscá tres estrellas en los márgenes de las viñetas 2, 3 y 4». Encontraste ${this.marks.length} de 3. Podés volver con «Ver viñetas».`]];
    } else if(o.dialog)this.dialog=o.dialog.map(d=>[...d]);
    else {
      const tips={electric:this.flags[o.flag]?'¡Esta máquina ya está encendida!':'Tiene un símbolo eléctrico. Luca podría darle una chispa con Z.',escort:this.flags[o.flag]?'¡Gracias por ayudarme a cruzar!':'Necesito un campo de fuerza para cruzar. Luca debe acercarse, usar C y quedarse quieto.',piece:'Vicente puede convertir esto en regalo con X para transportarlo.',slot:this.flags[o.flag]?'¡La pieza está colocada!':'Acá encaja una pieza. Traela dentro de un regalo y pulsá E.',plate:this.flags[o.flag]?'¡El regalo mantiene activada la placa!':'Necesita peso. ¿Y si envolvemos a ese asistente?',scanner:this.flags[o.flag]?'Pasaste sin que el ojo te viera.':'El ojo vigila este lugar. Fabrizio puede pasar invisible con X.',target:'Un blanco que responde a los picos de Fabrizio (C).',antenna:this.flags[o.flag]?'¡La antena está desplegada!':'La consola y una tormenta de Luca pueden desplegarla.',turret:'Un cubo de Fabrizio (Z) refleja sus disparos. Ponete entre el lanzador y el cubo.'};
      this.dialog=[[o.name,tips[o.type]||'Hay algo interesante por acá.']];
    }
  }
  next() {
    if(!this.complete){this.toast('Todavía hay algo por resolver. Pedí una pista si la necesitás.');return false;}
    if(this.scene<5){this.maxScene=Math.max(this.maxScene,this.scene+1);if(this.scene===4)this.flag('victory');return this.enter(this.scene+1);}
    return false;
  }
  hurt() {
    if(this.invulnerable>0||this.shield>0)return;
    this.player.health--;this.invulnerable=2;this.effect('ouch',this.player,0.8);this.emit('sound','ouch');
    if(this.player.health<=0){this.enter(this.scene,false);this.toast('¡PLOP! Volviste al punto de control. Lo resuelto sigue resuelto.');}
    else this.toast('¡Ups! Quedan '+this.player.health+' oportunidades.');
  }
  update(dt,move={x:0,y:0}) {
    if(!this.running||this.dialog.length)return;
    dt=clamp(dt,0,0.05);this.time+=dt;
    for(const cds of this.cooldowns)for(let i=0;i<cds.length;i++)cds[i]=Math.max(0,cds[i]-dt);
    for(const key of ['invisible','shield','party','storm','invulnerable'])this[key]=Math.max(0,this[key]-dt);
    if(this.cube){this.cube.time-=dt;if(this.cube.time<=0)this.cube=null;}
    if(move.x||move.y)this.target=null;
    if(this.target&&!move.x&&!move.y) {
      const dx=this.target.x-this.player.x,dy=this.target.y-this.player.y;
      if(Math.hypot(dx,dy)<6)this.target=null;else this.move(dx,dy,dt);
    } else this.move(move.x,move.y,dt);
    if(this.gift?.carried){this.gift.x=this.player.x+22;this.gift.y=this.player.y-30;}
    for(const o of this.objects) {
      o.prism=Math.max(0,o.prism-dt);o.stun=Math.max(0,o.stun-dt);
      if(o.type==='scanner'&&this.invisible>0&&distance(this.player,o)<90)this.flag(o.flag);
      if(o.type==='escort'&&!this.flags[o.flag]) {
        const active=this.scene!==2||this.flags.lab_storm;
        if(active&&this.shield>0&&distance(this.player,o)<120){o.x+=22*dt;this.escortTime+=dt;if(this.escortTime>3){this.flag(o.flag);this.toast(`${o.name} llegó a salvo. ¡Buen trabajo!`);}}
      }
      if(!['turret','enemy'].includes(o.type)||this.disabled(o)||o.inGift||o.prism>0||o.stun>0)continue;
      o.shot-=dt;
      if(o.shot<=0&&this.invisible<=0&&distance(o,this.player)<510) {
        const d=distance(o,this.player)||1;
        this.bullets.push({x:o.x,y:o.y-10,vx:(this.player.x-o.x)/d*140,vy:(this.player.y-o.y)/d*140,source:o.id,reflected:false,life:7});o.shot=3.5;
      }
    }
    for(const b of this.bullets) {
      b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
      if(!b.reflected&&this.cube&&distance(b,this.cube)<52) {
        const source=this.objects.find(o=>o.id===b.source);const d=distance(b,source)||1;
        b.vx=(source.x-b.x)/d*240;b.vy=(source.y-b.y)/d*240;b.reflected=true;this.effect('bounce',b,0.6);this.emit('sound','bounce');
      }
      if(b.reflected) {
        const source=this.objects.find(o=>o.id===b.source);
        if(distance(b,source)<28){if(source.flag)this.flag(source.flag);else source.stun=6;b.life=0;this.toast('¡Rebotó!');}
      } else if(this.shield>0&&distance(b,this.player)<125){b.life=0;this.effect('bounce',b,0.5);}
      else if(distance(b,this.player)<22){if(!this.objects.find(o=>o.id===b.source)?.practice)this.hurt();else this.toast('Era de práctica. Probá devolverlo con un cubo.');b.life=0;}
    }
    this.bullets=this.bullets.filter(b=>b.life>0);
    for(const e of this.effects)e.time-=dt;
    this.effects=this.effects.filter(e=>e.time>0);
    if(this.hazard(this.player.x,this.player.y))this.hurt();
  }
}
