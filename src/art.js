import { HEROES, WIDTH, HEIGHT } from './content.js';
const INK='#35362f', PAPER='#faf7ee';
const tau=Math.PI*2;
export class Illustrator {
  constructor(canvas) {this.canvas=canvas;this.c=canvas.getContext('2d');this.reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}
  path(points,color=INK,width=2,fill=null,close=false) {
    const c=this.c;c.beginPath();c.moveTo(...points[0]);
    points.slice(1).forEach(p=>c.lineTo(...p));if(close)c.closePath();
    c.lineCap='round';c.lineJoin='round';c.lineWidth=width;c.strokeStyle=color;
    if(fill){c.fillStyle=fill;c.fill();}c.stroke();
  }
  line(x,y,x2,y2,color=INK,width=2){this.path([[x,y],[(x+x2)/2+.6,(y+y2)/2-.6],[x2,y2]],color,width);}
  box(x,y,w,h,fill=PAPER,color=INK,width=2) {this.path([[x,y+1],[x+w-2,y],[x+w,y+h-1],[x+1,y+h]],color,width,fill,true);}
  circle(x,y,r,color=INK,width=2,fill=null) {
    const c=this.c;c.beginPath();c.ellipse(x,y,r,r*.97,.04,0,tau);c.strokeStyle=color;c.lineWidth=width;
    if(fill){c.fillStyle=fill;c.fill();}c.stroke();
  }
  text(text,x,y,size=22,color=INK,align='left') {const c=this.c;c.font=`${size}px 'Patrick Hand', cursive`;c.fillStyle=color;c.textAlign=align;c.fillText(text,x,y);}
  spring(ax,ay,bx,by,color,width=5,amp=6,turns=3) {
    const len=Math.hypot(bx-ax,by-ay),ux=(bx-ax)/len,uy=(by-ay)/len;
    const points=[];
    for(let i=0;i<=72;i++){const t=i/72,angle=t*turns*tau,edge=Math.sin(Math.PI*t)**.35;const across=Math.sin(angle)*amp*edge,along=t*len+Math.sin(angle+Math.PI/2)*amp*.42*edge;points.push([ax+ux*along-uy*across,ay+uy*along+ux*across]);}
    this.path(points,color,width);
  }
  hero(id,x,y,scale=1,time=0,opts={}) {
    const c=this.c,color=HEROES[id]?.color||id;
    c.save();c.translate(x,y);c.scale(scale,scale);
    const bob=this.reduced?0:Math.sin(time*3)*3;
    c.globalAlpha=opts.invisible?.28:1;
    c.fillStyle='#66604417';c.beginPath();c.ellipse(0,3,22,4,0,0,tau);c.fill();
    c.translate(0,bob-(id===1?0:8));
    if(id===1) {
      const compression=this.reduced?0:Math.sin(time*5)*4;
      c.translate(0,compression);
      this.circle(0,-48,18,color,5,PAPER);
      this.spring(0,-68,0,-98,color,5,6);
      this.spring(-17,-47,-40,-35,color,5,6);
      this.spring(17,-47,40,-35,color,5,6);
      this.spring(0,-28,0,-4-compression,color,5,6);
      this.circle(-6,-51,1.8,color,2,color);this.circle(6,-51,1.8,color,2,color);
      c.beginPath();c.arc(0,-47,9,.3,Math.PI-.3);c.strokeStyle=color;c.lineWidth=3;c.stroke();
    } else {
      this.circle(0,-48,16,color,5);
      this.line(0,-31,0,-5,color,5);this.line(0,-29,-17,-15,color,5);this.line(0,-29,17,-17,color,5);
      if(id===0) this.spring(0,-66,0,-101,color,4,4,2.4);
      else this.path([[0,-65],[6,-87],[13,-83]],color,5);
    }
    if(opts.selected){this.circle(0,12,5,color,1,color);}
    c.restore();
  }
  npc(id,x,y,t=0) {
    const colors={anciano:'#22b8d4',reportero:'#efbc4c',fusi:'#7c5cb5',sebastian:'#625144'};
    const color=colors[id]||'#df7e4f';
    if(id==='anciano') {this.hero(2,x,y,.7,t);this.line(x+22,y-20,x+22,y+6,INK,4);this.circle(x+22,y-24,5,INK,3);return;}
    this.circle(x,y-42,13,color,5,id==='reportero'?PAPER:color);
    this.line(x,y-28,x,y-7,color,5);this.line(x,y-24,x-14,y-13,color,5);this.line(x,y-24,x+15,y-18,color,5);
    this.line(x,y-7,x-10,y+6,color,5);this.line(x,y-7,x+11,y+4,color,5);
    if(id==='reportero'){this.line(x+16,y-18,x+20,y-32,INK,4);this.circle(x+20,y-35,4,INK,3,INK);}
    if(id==='fusi') for(let a=0;a<5;a++){const v=a/5*tau;this.line(x+Math.cos(v)*11,y-42+Math.sin(v)*11,x+Math.cos(v)*22,y-42+Math.sin(v)*22,color,4);}
    if(id==='sebastian')this.spring(x,y-56,x+10,y-76,color,4,4,2);
  }
  gift(x,y,s=1) {const c=this.c;c.save();c.translate(x,y);c.scale(s,s);this.box(-16,-30,32,28,'#ffe4a3','#ca9549',2);this.line(0,-30,0,-2,'#ec6896',5);this.line(-16,-16,16,-16,'#ec6896',4);this.path([[0,-30],[-10,-41],[-17,-34],[0,-30],[12,-41],[17,-34],[0,-30]],'#ec6896',3);c.restore();}
  star(x,y,r=12,color='#e8b74f',fill='#fce4a0') {
    const pts=[];for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;pts.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr]);}this.path(pts,color,2,fill,true);
  }
  cat(x,y) {this.circle(x,y-13,9,INK,3,INK);this.path([[x-8,y-17],[x-8,y-29],[x-1,y-21],[x+6,y-28],[x+7,y-17]],INK,2,INK);this.line(x+8,y-8,x+35,y-5,INK,9);this.line(x+17,y-3,x+17,y+8,INK,4);this.line(x+30,y-3,x+30,y+8,INK,4);this.path([[x+34,y-6],[x+44,y-10],[x+43,y-25]],INK,4);this.circle(x-3,y-15,1,'#c9d487',1,'#c9d487');}
  plant(x,y) {this.path([[x-12,y-25],[x+12,y-25],[x+9,y],[x-8,y]],'#b28259',2,'#cda576',true);this.line(x,y-27,x,y-65,'#96b863',4);this.path([[x,y-40],[x-13,y-53],[x-19,y-53]],'#96b863',4);this.path([[x,y-50],[x+13,y-63],[x+18,y-63]],'#96b863',4);}
  pinkMass(x,y,r,time) {
    const c=this.c;c.save();c.globalAlpha=.65;
    const pts=[];for(let i=0;i<110;i++){const a=i/110*tau,rr=r*(1+.1*Math.sin(a*7+(this.reduced?0:time*.3)));pts.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr*.8]);}
    this.path(pts,'#f474ab',6,'#fac9dd',true);
    for(let i=0;i<13;i++){c.beginPath();c.ellipse(x+Math.sin(i*11)*r*.2,y+Math.cos(i*3)*r*.2,r*(.5+i*.028),r*.45,i*.4,0,tau);c.strokeStyle='#f05b9a';c.lineWidth=2;c.stroke();}
    c.restore();
  }
  scenery(game,home=false) {
    const c=this.c,theme=game.definition.theme,t=game.time;
    c.fillStyle=PAPER;c.fillRect(0,0,WIDTH,HEIGHT);
    // Quiet ruled lines and hand-made perspective establish the paper stage.
    for(let i=0;i<8;i++)this.line(34,310+i*28,926,307+i*28,'#ddd5c5',.8);
    for(let i=0;i<9;i++)this.line(480,235,60+i*108,498,'#e6dfcf',.8);
    this.box(27,28,906,470,null,INK,2.5);
    this.box(43,43,600,41,'#fffdf5','#d4cbbb',1);
    this.text(game.definition.caption,57,71,20);
    if(theme==='base'||theme==='party') {
      this.box(48,100,865,142,'#f4efdf','#c6bdac',1.5);
      this.box(425,124,128,112,PAPER,INK,2);
      this.box(401,95,180,30,'#fff9e8',INK,1.5);this.text('e.c.u.c.p.a.e.a.p.s.a',491,118,19,INK,'center');
      this.circle(535,191,3,INK,2);
      this.box(85,120,204,98,'#fffdf4','#b4a58d',1.5);
      this.text('PLAN: ¡SALVAR A VICENTE!',102,145,16);
      this.pinkMass(240,181,24,t);this.path([[112,192],[145,175],[178,194],[205,176]],'#b4a58d',1.5);
      this.line(131,208,208,207,'#f279a5',2);
      this.box(624,108,121,130,'#e3c79b','#a78052',2);
      for(let k=0;k<3;k++){this.line(628,148+k*39,742,148+k*39,'#a78052',2);for(let j=0;j<5;j++)this.box(634+j*19,122+k*39,10,25,['#a3b970','#6fc1cf','#f398b8','#e5bd59'][j%4],'#a78052',1);}
      this.box(799,113,80,91,'#fff2f7','#b8a390',2);this.pinkMass(840,151,24,t);
      this.plant(855,465);this.cat(585,453);
      if(theme==='party'){this.bunting(t);this.text('¡APOCALIPSIS CANCELADO!',485,292,29,'#d94683','center');for(let i=0;i<5;i++)this.npc(['fusi','sebastian','reportero'][i%3],150+i*140,465,t);}
    } else if(theme==='street') {
      for(let i=0;i<5;i++){
        const x=61+i*172,h=85+(i%3)*22;
        this.box(x,230-h,130,h,['#ede7da','#f2e4dc','#e4e9d5'][i%3],'#aaa18f',2);
        for(let w=0;w<3;w++)this.box(x+16+w*36,249-h,19,27,'#c8e8e7','#a4b8ad',1);
        this.box(x+48,198,28,32,'#d5be95','#a29076',1);
      }
      this.pinkMass(898,170,65,t);this.path([[470,239],[440,284],[460,325],[435,367],[451,419],[430,479]],'#b8ac99',2);
      this.text('CALLE DOBLADA',170,278,20,'#8c8271');this.plant(88,460);
    } else if(theme==='lab') {
      this.box(66,112,384,108,'#eaf0e6','#9ea99b',2);this.text('LABORATORIO DE TORMENTAS',257,145,26,'#5b786b','center');
      for(let k=0;k<6;k++){this.circle(105+k*58,180,13,'#99b0a2',2,'#f8f9ed');this.line(105+k*58,180,109+k*58,170,'#e1b74c',2);}
      this.box(500,200,40,280,'#d9d9cc','#a6ab9b',2);this.box(499,326,42,49,PAPER,'#a6ab9b',1.5);
      this.text('solo tamaño mini →',350,315,19,'#7b8573');this.text('PELIGRO ELÉCTRICO',755,478,17,'#b48532','center');
      if(game.flags.lab_storm&&!game.flags.lab_escort){c.fillStyle='#f8cc6533';c.fillRect(690,392,140,65);for(let i=0;i<4;i++)this.path([[700+i*35,399],[713+i*35,421],[703+i*35,435]],'#d5a448',2);}
    } else if(theme==='edge') {
      this.pinkMass(820,176,150,t);this.text('EL BORDE',100,155,30,'#796c77');this.text('No tocar lo rosa.',100,186,23,'#b9678c');
      c.fillStyle='#f9d2e3aa';c.fillRect(560,390,135,86);for(let k=0;k<6;k++)this.path([[562+k*24,398],[580+k*20,434],[564+k*23,470]],'#f39abf',3);
      this.path([[45,496],[230,485],[395,496],[550,484],[730,496]],'#a78a96',2);
    } else if(theme==='heart') {
      c.fillStyle='#fff0f5';c.fillRect(30,90,900,406);this.pinkMass(470,185,120,t);this.text('Acá adentro todavía estoy yo.',470,187,26,'#ad4774','center');
      for(let i=0;i<9;i++)this.circle(95+i*94,270+Math.sin(i*4)*45,7,['#77c1d1','#b9ce7a','#ec92b1'][i%3],2);
      if(!game.flags.heart_escort){c.fillStyle='#f9b7d33a';c.fillRect(490,390,170,85);}
    } else if(theme==='secret') {
      this.bunting(t);this.text('ESTA VIÑETA NO ESTABA EN EL GUION',480,150,30,'#927737','center');
      this.text('Ahora es nuestra.',480,185,25,'#a28a5b','center');for(let i=0;i<7;i++)this.star(90+i*125,230+(i%2)*15,8,'#d8b558','#fae9b5');
      if(game.complete)this.text('¡LOS TRES DEJARON SU MARCA!',480,485,28,'#a27c27','center');
    }
    if(!home){this.text('←',55,462,29,'#aaa18f');if(game.scene<5)this.exit(game);}
    this.text('PÁG. '+String(game.scene+1).padStart(2,'0'),892,523,16,'#9b927f','right');
  }
  bunting(t) {
    this.path([[55,103],[260,126],[480,132],[720,123],[905,101]],'#9a9181',1.5);
    for(let i=0;i<15;i++){const x=75+i*57,y=104+Math.sin(i/14*Math.PI)*26;this.path([[x,y],[x+24,y+1],[x+12,y+24]],'#aaa18f',1,['#f1a0be','#9ecfbd','#efcf72'][i%3],true);}
  }
  exit(game) {
    const color=game.complete?'#739a49':'#a49b8f';this.box(860,354,50,94,game.complete?'#eaf0da':'#e9e4d8',color,2);
    this.text(game.scene===4?'♡':'→',885,404,34,color,'center');this.text(game.complete?'¡Adelante!':'Resolver',885,470,17,color,'center');
  }
  object(o,game) {
    const c=this.c,{x,y}=o,done=Boolean(o.flag&&game.flags[o.flag]),t=game.time;
    if(o.inGift||game.disabled(o)&&o.type==='piece')return;
    if(o.type==='npc'||o.type==='escort') {this.npc(o.character,x,y,t);if(o.type==='escort'&&!done){this.text('¡Ayuda!',x,y-87,18,'#9b7e46','center');} }
    else if(o.type==='electric') {
      this.box(x-34,y-66,68,61,done?'#dceac7':'#e1e2d6','#737e72',2);
      this.box(x-23,y-54,46,27,done?'#96ce9b':'#b5c7bd','#859a87',1);
      this.text('ϟ',x,y-32,25,done?'#fffdea':'#819b89','center');
      this.circle(x-14,y-16,3,'#cd9676',2,done?'#a2c879':'#dcaa82');this.circle(x+12,y-16,3,'#b6a06f',2,'#ead39a');
      if(done)this.text('✓',x+47,y-30,28,'#6c993d','center');
    } else if(o.type==='enemy'||o.type==='turret') {
      if(o.type==='enemy')this.npc('fusi',x,y,t);
      else {this.box(x-25,y-55,50,42,done?'#ddd8ca':'#f4d271','#b59c55',2);this.box(x-16,y-77,32,23,'#f3d88d','#b59c55',2);this.circle(x-7,y-66,3,INK,1,INK);this.circle(x+7,y-66,3,INK,1,INK);this.line(x+27,y-40,x+42,y-35,'#b59c55',5);this.line(x-13,y-12,x-16,y,'#b59c55',4);this.line(x+13,y-12,x+16,y,'#b59c55',4);}
      if(o.prism>0){this.path([[x,y-108],[x-39,y+10],[x+40,y+10],[x,y-108]],'#ee80ae',3,'#ffd2e344');this.line(x,y-108,x+14,y-5,'#ee80ae',1);this.text(Math.ceil(o.prism)+' s',x,y-118,16,'#ba507d','center');}
      if(o.stun>0)this.text('✧  ✧',x,y-85,24,'#c5a043','center');
      if(done)this.text('✓',x,y-95,30,'#7d9b50','center');
    } else if(o.type==='piece') {
      if(game.scene===4){this.circle(x,y-25,20,'#f37eae',3,'#fbc4db');this.text('♡',x,y-17,27,'#c85987','center');}
      else {this.box(x-16,y-39,32,31,'#b5cddb','#7797a3',2);this.box(x-8,y-47,16,11,'#b5cddb','#7797a3',2);this.text('✧',x,y-16,21,'#7797a3','center');}
    } else if(o.type==='scanner') {
      this.line(x,y-10,x,y-50,'#b9a38a',3);this.path([[x-30,y-52],[x-10,y-68],[x+10,y-68],[x+30,y-52],[x+10,y-40],[x-10,y-40]],'#9f8878',2,done?'#e1eccd':'#f5ebd9',true);this.circle(x,y-54,8,done?'#92b169':'#a78b6c',2,done?'#a4c37d':'#b79c79');if(done)this.text('✓',x,y-85,26,'#81a04f','center');
    } else if(o.type==='target') {this.circle(x,y-28,24,'#b6a282',2,'#fff6dc');this.circle(x,y-28,15,'#d78988',3);this.circle(x,y-28,5,'#d78988',2,'#d78988');if(done)this.text('✓',x,y-63,26,'#7f9e4d','center');}
    else if(o.type==='slot') {this.box(x-34,y-52,68,50,done?'#e3edcc':'#eee0ca','#a89373',2);this.box(x-16,y-38,32,17,done?'#b0c985':'#bcaa8c','#a89373',2);this.text(done?'✓':'◇',x,y-66,24,done?'#7f9e4d':'#a89373','center');}
    else if(o.type==='plate') {this.path([[x-36,y-8],[x+24,y-14],[x+37,y],[x-24,y+7]],'#9a927f',2,done?'#b9d189':'#ddd6c5',true);if(done)this.gift(x,y-6,.8);}
    else if(o.type==='antenna') {this.line(x,y,x,y-70,'#8d9e9a',4);this.path(done?[[x-42,y-82],[x,y-50],[x+42,y-82]]:[[x-9,y-84],[x,y-50],[x+9,y-84]],done?'#79aba5':'#adb5ac',4);this.circle(x,y-54,4,'#91bab0',2,'#f0d078');this.text(done?'¡Desplegada!':'☂',x,y-100,done?19:29,'#869b8c','center');}
    else if(o.type==='secret-door') {this.box(x-22,y-43,44,33,'#fff6d9','#beaf86',1);this.star(x,y-27,11,'#c2a05a','#f5e1a3');if(game.marks.length===3)this.text('✧',x+34,y-48,32,'#c9a04d','center');}
    if(distanceTo(o,game.player)<100&&!game.dialog.length){this.box(x-64,y+15,128,25,'#fffdf3','#d2c6ae',1);this.text(o.name,x,y+33,15,'#726952','center');}
  }
  draw(game,home=false) {
    const c=this.c;c.clearRect(0,0,WIDTH,HEIGHT);this.scenery(game,home);
    if(home) {
      this.hero(0,605,420,1.3,game.time);this.hero(1,724,437,1.25,game.time+.7);this.hero(2,837,420,1.3,game.time+.5);
      this.text('¡PODEMOS CON ESTO!',735,288,26,'#8b7464','center');return;
    }
    const mark=game.definition.mark;
    if(mark&&!game.marks.includes(game.scene)){this.star(mark.x,mark.y-10,10,'#b8a478','#fff1c6');this.text('?',mark.x+16,mark.y-20,14,'#b8a478');}
    for(const o of [...game.objects].sort((a,b)=>a.y-b.y))this.object(o,game);
    const p=game.player,t=game.time;
    if(game.shield>0){this.circle(p.x,p.y-28,115,'#55c0d3',3,'#b8e9ef33');this.text('PROTEGIDOS',p.x,p.y-152,18,'#269eb2','center');}
    if(game.cube){const {x,y}=game.cube;this.box(x-31,y-52,62,58,'#d1eaa433','#8fbf4a',3);this.path([[x-31,y-52],[x-16,y-67],[x+45,y-65],[x+31,y-52],[x+45,y-65],[x+45,y-8],[x+31,y+6]],'#8fbf4a',2);}
    if(game.party>0) {
      this.circle(p.x,p.y,27,'#a18e74',2,'#bbaa8b');this.text('¡FIESTA!',p.x,p.y-85,31,'#c9a14b','center');
      for(let i=0;i<7;i++){const a=i/7*tau;this.star(p.x+Math.cos(a)*65,p.y-35+Math.sin(a)*39,5,['#f2a2c3','#a2c578','#88c7ce'][i%3]);}
    } else {
      c.save();if(game.invulnerable>0)c.globalAlpha=.65;
      this.hero(p.hero,p.x,p.y,game.small?.42:1,t,{invisible:game.invisible>0,selected:true});c.restore();
    }
    if(game.gift&&!game.gift.placed)this.gift(game.gift.x,game.gift.y);
    for(const b of game.bullets){this.circle(b.x,b.y-18,6,b.reflected?'#91b34e':'#ca9c6b',2,b.reflected?'#c6dd8e':'#ecd3a7');this.line(b.x-b.vx*.07,b.y-18-b.vy*.07,b.x,b.y-18,b.reflected?'#bfd184':'#debd91',2);}
    for(const e of game.effects) {
      const a=e.time/e.total;c.save();c.globalAlpha=a;
      if(e.type==='ray'){const pts=[[p.x,p.y-40]];for(let i=1;i<8;i++)pts.push([p.x+(e.x-p.x)*i/8+(i%2?8:-8),p.y-40+(e.y-p.y)*i/8]);pts.push([e.x,e.y-30]);this.path(pts,'#dfb63b',4);}
      if(e.type==='spikes'){for(let i=0;i<3;i++)this.path([[e.x-20+i*15,e.y],[e.x-13+i*15,e.y-30],[e.x-5+i*15,e.y]],'#8dbd4c',3,'#dcebb9',true);}
      if(['puf','ouch','bounce'].includes(e.type))this.text(({puf:'¡PUF!',ouch:'¡PLOP!',bounce:'¡BOING!'})[e.type],e.x,e.y-65-(1-a)*25,30,e.type==='ouch'?'#ce7092':'#ae9356','center');
      if(e.type==='star')this.star(e.x,e.y-40-(1-a)*35,20,'#caa84a','#f9df83');c.restore();
    }
    if(game.storm>0){c.save();c.fillStyle='#a4c4cb18';c.fillRect(30,90,900,406);for(let i=0;i<25;i++){const x=40+(i*73)%880,y=115+((i*41+t*90)%350);this.line(x,y,x-6,y+12,'#8fb6c3',1.5);}this.text('BRRRRUM…',480,111,27,'#87a1a7','center');c.restore();}
    if(game.scene===6&&game.complete)this.text('✧  VIÑETA SECRETA COMPLETADA  ✧',480,217,24,'#b38c3c','center');
  }
}
function distanceTo(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
