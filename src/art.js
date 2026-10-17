import { HEROES, WIDTH, HEIGHT, STREET_LASER } from './content.js';
import { Pencil, paperGrain } from './sketch.js';
import { illustrations } from './illustrations.js';
const INK='#393832', PAPER='#fffdf7';
const tau=Math.PI*2;
export class Illustrator {
  constructor(canvas) {this.canvas=canvas;this.c=canvas.getContext('2d');this.pencil=new Pencil(this.c);this.reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}
  path(points,color=INK,width=2,fill=null,close=false) {
    this.pencil.path(points,color,width,fill,close);
  }
  line(x,y,x2,y2,color=INK,width=2){this.path([[x,y],[(x+x2)/2+.6,(y+y2)/2-.6],[x2,y2]],color,width);}
  box(x,y,w,h,fill=PAPER,color=INK,width=2) {this.path([[x,y+1],[x+w-2,y],[x+w,y+h-1],[x+1,y+h]],color,width,fill,true);}
  circle(x,y,r,color=INK,width=2,fill=null) {
    const points=[];
    for(let i=0;i<40;i++){const a=i/40*tau;points.push([x+Math.cos(a)*r*(1+.022*Math.sin(a*3)),y+Math.sin(a)*r*.97*(1+.018*Math.cos(a*5))]);}
    this.path(points,color,width,fill,true);
  }
  text(text,x,y,size=22,color=INK,align='left') {const c=this.c;c.save();c.translate(x,y);c.rotate(Math.sin(x*.19+y*.31)*.005);c.font=`${size}px 'Patrick Hand', cursive`;c.fillStyle=color;c.textAlign=align;c.fillText(text,0,0);c.restore();}
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
    c.globalAlpha*=opts.invisible?.28:1;
    this.path([[-20,3],[-11,5],[5,6],[21,3],[8,1],[-9,1],[-20,3]],'#b9b3a9',.6);
    c.translate(0,bob-(id===1?0:8));
    if(this.dancing&&!this.reduced)c.rotate(Math.sin(time*7+x*.02)*.12);
    if(id===4){
      this.girl('amaral',0,0);
    } else if(id===3){
      this.circle(0,-44,23,color,5,PAPER);
      for(let i=0;i<13;i++){const a=-Math.PI/2+i/13*tau,len=Math.sin(a)>.7?24:11+(i%3)*3;this.line(Math.cos(a)*23,-44+Math.sin(a)*23,Math.cos(a)*(23+len),-44+Math.sin(a)*(23+len),color,5);}
      this.circle(-7,-49,2.6,color,2,color);this.circle(7,-49,2.6,color,2,color);
      this.path([[-11,-40],[-7,-34],[0,-31],[8,-34],[12,-41]],color,4);
    } else if(id===1) {
      const compression=this.reduced?0:Math.sin(time*5)*4;
      c.translate(0,compression);
      this.circle(0,-48,18,color,5,PAPER);
      this.spring(0,-68,0,-98,color,5,6);
      this.spring(-17,-47,-40,-35,color,5,6);
      this.spring(17,-47,40,-35,color,5,6);
      this.spring(0,-28,0,-4-compression,color,5,6);
      this.circle(-6,-51,1.8,color,2,color);this.circle(6,-51,1.8,color,2,color);
      const smile=[];for(let i=0;i<=12;i++){const a=.3+i/12*(Math.PI-.6);smile.push([Math.cos(a)*9,-47+Math.sin(a)*9]);}this.path(smile,color,3);
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
    const c=this.c;c.save();
    if(this.dancing&&!this.reduced){c.translate(x,y+Math.sin(t*8+x*.03)*5);c.rotate(Math.sin(t*6+x*.02)*.12);x=0;y=0;}
    if(['alma-face','fusi','cata'].includes(id)&&!this.reduced)y+=Math.sin(t*3)*3;
    const colors={anciano:'#22b8d4',reportero:'#efbc4c',fusi:'#7c5cb5',assistant:'#7c5cb5',sebastian:'#625144',fusion:'#13b3ae'};
    const color=colors[id]||'#df7e4f';
    if(['alma-face','alma-purple','cata','sofia','seshia'].includes(id)){this.girl(id,x,y);c.restore();return;}
    if(id==='fusi'){
      this.circle(x,y-53,15,color,5,PAPER);
      this.path([[x-6,y-68],[x-12,y-82],[x,y-71],[x+10,y-83]],color,5);
      for(const side of [-1,1]){
        this.path([[x+side*13,y-53],[x+side*23,y-41],[x+side*29,y-46]],color,5);
        this.path([[x+side*12,y-45],[x+side*21,y-33],[x+side*29,y-37]],color,5);
      }
      this.line(x,y-37,x,y-7,color,5);this.line(x-15,y-23,x+15,y-23,color,5);
      c.restore();return;
    }
    if(id==='anciano') {
      this.circle(x-4,y-48,12,color,4,PAPER);
      this.path([[x-4,y-61],[x-2,y-70],[x+5,y-73],[x+9,y-70]],color,3);
      this.path([[x-14,y-38],[x+4,y-37],[x-5,y-25]],color,2,PAPER,true);
      this.line(x-1,y-28,x+1,y-3,color,4);
      this.path([[x-1,y-26],[x-16,y-24],[x-17,y-38]],color,4);
      this.path([[x+1,y-26],[x+13,y-18],[x+24,y-26]],color,4);
      this.path([[x+13,y-25],[x+14,y-33],[x+22,y-35],[x+27,y-30],[x+27,y+5]],'#252522',5);
      this.circle(x+24,y-26,2.4,color,2,color);
      c.restore();return;
    }
    this.circle(x,y-42,13,color,5,id==='reportero'?PAPER:color);
    this.line(x,y-28,x,y-7,color,5);this.line(x,y-24,x-14,y-13,color,5);this.line(x,y-24,x+15,y-18,color,5);
    this.line(x,y-7,x-10,y+6,color,5);this.line(x,y-7,x+11,y+4,color,5);
    if(id==='reportero'){this.line(x+16,y-18,x+20,y-32,INK,4);this.circle(x+20,y-35,4,INK,3,INK);}
    if(id==='assistant') for(let a=0;a<5;a++){const v=a/5*tau;this.line(x+Math.cos(v)*11,y-42+Math.sin(v)*11,x+Math.cos(v)*22,y-42+Math.sin(v)*22,color,4);}
    if(id==='sebastian')this.spring(x,y-56,x+10,y-76,color,4,4,2);
    c.restore();
  }
  girl(id,x,y){
    const c=this.c,small=id==='cata'||id==='seshia',color=({amaral:'#ef3b50','alma-face':'#b9bacb','alma-purple':'#6841b4',cata:'#7045b7',sofia:'#08b1d0',seshia:'#f29b43'})[id];
    c.save();c.translate(x,y);if(small)c.scale(.77,.77);
    if(id==='alma-face'){
      this.circle(0,-39,25,color,3.5);
      this.circle(-8,-45,4,color,2.5,color);this.circle(8,-45,4,color,2.5,color);
      this.path([[-12,-29],[-6,-24],[2,-23],[10,-27],[13,-32]],color,3);
      for(const side of [-1,1]){
        this.path([[side*11,-62],[side*25,-71],[side*33,-65],[side*38,-48],[side*51,-45]],color,3);
        this.path([[side*22,-48],[side*33,-30],[side*48,-29]],color,3);
      }
      c.restore();return;
    }
    this.circle(0,-52,14,color,6,id==='sofia'?color:PAPER);
    this.line(0,-36,0,-7,color,6);this.line(0,-26,-17,-21,color,6);this.line(0,-26,17,-21,color,6);
    if(!['seshia','cata'].includes(id)){this.line(0,-7,-12,13,color,6);this.line(0,-7,12,13,color,6);}
    if(['alma-purple','cata','seshia'].includes(id))for(const side of [-1,1]){
      this.path([[side*12,-61],[side*22,-45],[side*33,-47],[side*36,-53]],color,6);
      if(id==='alma-purple')this.path([[side*14,-48],[side*24,-36],[side*35,-39]],color,5);
    }
    if(id==='amaral'){this.line(-27,-19,-27,-76,color,5);this.path([[-40,-48],[-27,-81],[-15,-48],[-40,-48]],color,5);}
    if(id==='cata')this.circle(0,-8,8,color,4,color);
    if(id==='sofia'){this.circle(4,-57,3,'#82d8e2',2,'#82d8e2');}
    c.restore();
  }
  gift(x,y,s=1) {const c=this.c;c.save();c.translate(x,y);c.scale(s,s);this.box(-16,-30,32,28,'#ffe4a3','#ca9549',2);this.line(0,-30,0,-2,'#ec6896',5);this.line(-16,-16,16,-16,'#ec6896',4);this.path([[0,-30],[-10,-41],[-17,-34],[0,-30],[12,-41],[17,-34],[0,-30]],'#ec6896',3);c.restore();}
  star(x,y,r=12,color='#e8b74f',fill='#fce4a0') {
    const pts=[];for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;pts.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr]);}this.path(pts,color,2,fill,true);
  }
  cat(x,y) {this.circle(x,y-13,9,INK,3,INK);this.path([[x-8,y-17],[x-8,y-29],[x-1,y-21],[x+6,y-28],[x+7,y-17]],INK,2,INK);this.line(x+8,y-8,x+35,y-5,INK,9);this.line(x+17,y-3,x+17,y+8,INK,4);this.line(x+30,y-3,x+30,y+8,INK,4);this.path([[x+34,y-6],[x+44,y-10],[x+43,y-25]],INK,4);this.circle(x-3,y-15,1,'#c9d487',1,'#c9d487');}
  plant(x,y) {this.path([[x-12,y-25],[x+12,y-25],[x+9,y],[x-8,y]],'#b28259',2,'#cda576',true);this.line(x,y-27,x,y-65,'#96b863',4);this.path([[x,y-40],[x-13,y-53],[x-19,y-53]],'#96b863',4);this.path([[x,y-50],[x+13,y-63],[x+18,y-63]],'#96b863',4);}
  pinkMass(x,y,r,time,ry=r*.8) {
    const c=this.c;c.save();c.translate(x,y);
    if(!this.reduced)c.scale(1+Math.sin(time*.6)*.008,1+Math.cos(time*.7)*.008);
    const drawing=illustrations.get('mass');
    if(drawing){c.drawImage(drawing,-r,-ry,r*2,ry*2);c.restore();return;}
    const pts=[];for(let i=0;i<80;i++){const a=i/80*tau,rr=r*(1+.08*Math.sin(a*7));pts.push([Math.cos(a)*rr,Math.sin(a)*rr*.8]);}
    this.path(pts,'#f75baf',4,'#ffb2d9',true);
    for(let i=0;i<15;i++){
      const scribble=[];for(let j=0;j<=48;j++){const a=j/48*tau,rx=r*(.28+i*.037)*(1+.12*Math.sin(a*5+i)),ry=r*.32;const angle=i*.4;const xx=Math.cos(a)*rx,yy=Math.sin(a)*ry;scribble.push([Math.cos(angle)*xx-Math.sin(angle)*yy+Math.sin(i*11)*r*.11,Math.sin(angle)*xx+Math.cos(angle)*yy+Math.cos(i*3)*r*.11]);}
      this.path(scribble,i%5===0?'#775f75':'#f355a5',i%3===0?2.6:1.5);
    }
    c.restore();
  }
  scenery(game,home=false) {
    const c=this.c,theme=game.definition.theme,t=game.time;
    c.fillStyle=PAPER;c.fillRect(0,0,WIDTH,HEIGHT);
    const background=theme==='party'?'base':theme;
    const calm=(theme==='party'||game.flags.victory)&&['base','street'].includes(background);
    const drawing=illustrations.get(calm?background+'Calm':background);
    if(drawing)c.drawImage(drawing,30,30,900,467);
    else {
      // A few loose pencil marks, rather than a computer-perfect floor grid.
      for(let i=0;i<5;i++)this.path([[62+i*173,477],[155+i*155,447],[210+i*145,440]],'#e1ddd4',.7);
      this.path([[456,31],[459,160],[455,277],[460,401],[457,496]],'#e2ded5',.6);
    }
    this.box(27,28,906,470,null,INK,2.5);
    this.path([[29,29],[270,26],[558,30],[932,27]],INK,.8);
    this.box(43,43,855,38,'#fffdf7','#878172',1);
    this.text(game.definition.caption,57,69,20);
    if(theme==='base'||theme==='party') {
      if(!drawing){
      this.box(48,100,865,142,'#f4efdf','#c6bdac',1.5);
      this.box(425,124,128,112,PAPER,INK,2);
      this.box(401,95,180,30,'#fff9e8',INK,1.5);this.text('e.c.u.c.p.a.e.a.p.s.a',491,118,19,INK,'center');
      this.circle(535,191,3,INK,2);
      this.box(85,120,204,98,'#fffdf4','#b4a58d',1.5);
      this.text('PLAN: ¡SALVAR A VICENTE!',102,145,16);
      if(!calm)this.pinkMass(240,181,24,t);else this.star(240,181,20);this.path([[112,192],[145,175],[178,194],[205,176]],'#b4a58d',1.5);
      this.line(131,208,208,207,'#f279a5',2);
      this.box(624,108,121,130,'#e3c79b','#a78052',2);
      for(let k=0;k<3;k++){this.line(628,148+k*39,742,148+k*39,'#a78052',2);for(let j=0;j<5;j++)this.box(634+j*19,122+k*39,10,25,['#a3b970','#6fc1cf','#f398b8','#e5bd59'][j%4],'#a78052',1);}
      this.box(799,113,80,91,'#fff2f7','#b8a390',2);if(!calm)this.pinkMass(840,151,24,t);
      }
      if(drawing){this.box(474,119,209,35,'#fffdf7','#777064',1.4);this.text('e.c.u.c.p.a.e.a.p.s.a',579,145,24,INK,'center');this.tape(474,119);this.tape(679,121);}
      this.cat(585,453);
      if(theme==='party'){
        this.text('¡APOCALIPSIS CANCELADO!',480,204,28,'#d94683','center');
        this.npc('sebastian',480,325,t);this.npc('fusi',845,270,t);
        for(let i=0;i<HEROES.length;i++)if(i!==game.player.hero&&(!HEROES[i].unlock||game.flags[HEROES[i].unlock]))this.hero(i,290+i*105,365,.78,t+i);
      }
    } else if(theme==='street') {
      if(!drawing){
      for(let i=0;i<5;i++){
        const x=61+i*172,h=85+(i%3)*22;
        this.box(x,230-h,130,h,['#ede7da','#f2e4dc','#e4e9d5'][i%3],'#aaa18f',2);
        for(let w=0;w<3;w++)this.box(x+16+w*36,249-h,19,27,'#c8e8e7','#a4b8ad',1);
        this.box(x+48,198,28,32,'#d5be95','#a29076',1);
      }
      if(!game.flags.victory)this.pinkMass(898,170,65,t);
      }
      this.text('CALLE DOBLADA',160,278,23,'#776c5c');this.plant(88,460);
      const laser=STREET_LASER,hidden=game.invisible>0;
      this.line(laser.x,laser.top-25,laser.x,laser.bottom,hidden?'#e19aa7':'#e54165',hidden?2:5);
      this.line(laser.x-4,laser.top-25,laser.x-4,laser.bottom,hidden?'#efced4':'#f2a0b0',1.5);
      for(const y of [laser.top-25,laser.bottom])this.box(laser.x-11,y-6,22,12,'#eadfcf','#766b5d',2);
      this.text(hidden?'Invisible: pasá':'Láser: X de Fabrizio',laser.x-15,489,17,hidden?'#668a42':'#b33f61','right');
    } else if(theme==='lab') {
      if(!drawing){
      this.box(66,112,384,108,'#eaf0e6','#9ea99b',2);this.text('LABORATORIO DE TORMENTAS',257,145,26,'#5b786b','center');
      for(let k=0;k<6;k++){this.circle(105+k*58,180,13,'#99b0a2',2,'#f8f9ed');this.line(105+k*58,180,109+k*58,170,'#e1b74c',2);}
      }
      // Two physical wall sections leave the tiny passage visible and empty.
      this.box(500,200,40,126,'#d9d4c3','#827b6b',2);this.box(500,375,40,105,'#d9d4c3','#827b6b',2);
      this.path([[499,326],[542,326],[542,375],[499,375]],'#827b6b',1.5);
      this.text('solo tamaño mini →',350,315,19,'#7b8573');this.text('PELIGRO ELÉCTRICO',755,478,17,'#b48532','center');
      if(game.flags.lab_storm&&!game.flags.lab_escort){
        for(let i=0;i<4;i++){const x=702+i*34;this.path([[x+12,390],[x,417],[x+16,415],[x+2,449],[x+26,410],[x+9,412]],'#e4b528',2,'#f7df4d',true);}
      }
    } else if(theme==='edge') {
      const m=game.mass;this.massPanel(m,t);
      this.box(260,108,300,60,PAPER,'#bc7196',1);this.text(m?'La masa corta el camino.':'¡Ya no hay masa rosa!',410,134,23,'#c43c81','center');this.text(m?'C de Vicente: saltá al otro lado.':'El apocalipsis terminó.',410,158,18,INK,'center');
    } else if(theme==='heart') {
      const m=game.mass,story=game.cinematic;
      let scale=1;if(story?.kind==='fusion'&&story.time>2.5)scale=Math.max(0,1-(story.time-2.5)/.9);
      if(m&&scale>0)this.massPanel({...m,rx:m.rx*scale,ry:m.ry*scale},t);
      this.box(275,112,265,45,PAPER,'#bc7196',1);this.text(game.flags.victory?'¡Vicente volvió!':game.flags.heart_fusion?'¡Hablá con el Ancianito!':'¡Lejos de la masa rosa!',407,142,23,'#b83a79','center');
    } else if(theme==='secret') {
      this.text('EL MARGEN IMPOSIBLE',535,120,26,'#927737','center');
      this.text('Gaspar llega un poquito más lejos.',535,157,21,'#a28a5b','center');
      this.path([[554,231],[545,266],[558,298],[547,333],[560,365],[548,402],[555,435],[546,477],[594,477],[586,442],[596,408],[585,370],[596,333],[587,299],[598,264],[589,232]],'#8e8170',2,'#ccc4b4',true);
      if(game.flags.secret_reach){for(let i=0;i<7;i++){const y=261+i*30;this.path([[540,y+3],[600,y],[602,y+21],[542,y+23]],'#987949',2,'#d9ba82',true);this.line(547,y+13,592,y+10,'#b39560',1);}this.line(540,256,540,469,'#967b4f',3);this.line(603,253,603,466,'#967b4f',3);}
      else {this.text('Llave →',463,263,23,'#9c8454');this.text('Z: brazo elástico',415,303,22,'#1388a0');}
      if(game.complete)this.text('¡GASPAR CONQUISTÓ EL MARGEN!',480,485,27,'#a27c27','center');
    }
    if(!home){this.text('←',55,462,29,'#aaa18f');if(game.scene<4)this.exit(game);}
    this.text('PÁG. '+String(game.scene+1).padStart(2,'0'),892,523,16,'#9b927f','right');
  }
  tape(x,y){const c=this.c;c.save();c.translate(x,y);c.rotate(-.5);this.path([[-13,-5],[13,-4],[12,4],[-12,5]],'#e8b75b',.6,'#f2d99b',true);c.restore();}
  massPanel(m,t){
    if(!m)return;const c=this.c;c.save();c.beginPath();c.rect(30,83,900,414);c.clip();
    for(const lobe of m.lobes||[]){
      const pts=[];for(let i=0;i<64;i++){const a=i/64*tau,w=1+.035*Math.sin(a*7);pts.push([lobe.x+Math.cos(a)*lobe.rx*w,lobe.y+Math.sin(a)*lobe.ry*w]);}
      this.path(pts,'#f255a9',4,'#ff9bd1',true);
      for(let i=0;i<13;i++){const f=(i-6)/7,line=[];for(let j=0;j<=32;j++){const a=j/32*Math.PI;line.push([lobe.x+f*lobe.rx*Math.sin(a)+Math.sin(j*1.7+i)*5,lobe.y-Math.cos(a)*lobe.ry]);}this.path(line,'#f35cab',3);}
    }
    this.pinkMass(m.x,m.y,m.rx,t,m.ry);c.restore();
  }
  exit(game) {
    const color=game.complete?'#739a49':'#a49b8f',top=game.scene===3?420:354;
    this.box(860,top,50,game.scene===3?50:94,game.complete?'#eaf0da':'#e9e4d8',color,2);
    this.text('→',885,game.scene===3?455:404,34,color,'center');this.text(game.complete?'¡Adelante!':'Resolver',885,game.scene===3?491:470,17,color,'center');
  }
  object(o,game) {
    const c=this.c,{x,y}=o,done=Boolean(o.flag&&game.flags[o.flag]),t=game.time;
    if(o.inGift||game.disabled(o)&&['piece','distant','enemy'].includes(o.type))return;
    if(o.type==='npc'||o.type==='escort') {this.npc(o.character,x,y,t);if(game.needsHelp(o)){this.box(x-57,y-114,114,31,PAPER,'#ac8c42',1);this.text('¡Ayuda, Luca!',x,y-91,22,'#9b7e46','center');} }
    else if(o.type==='chest'){
      this.box(x-42,y-40,84,40,'#d6ac78','#946637',2);for(let i=0;i<4;i++)this.line(x-33+i*20,y-37,x-33+i*20,y-3,'#a97842',1);
      this.path(done?[[x-42,y-40],[x-50,y-81],[x+30,y-86],[x+42,y-40]]:[[x-42,y-40],[x-32,y-61],[x+34,y-59],[x+42,y-40]],'#926437',3,done?'#edce9b':'#c5975f',true);
      if(done){this.box(x-35,y-39,70,13,'#76583a','#8c643e',1);this.text('¡Libre!',x,y-89,19,'#168fa6','center');}
      else {this.box(x-7,y-36,14,15,'#efd16f','#a9883f',2);this.circle(x,y-29,2,INK,1,INK);}
    }
    else if(o.type==='electric') {
      this.box(x-34,y-66,68,61,done?'#dceac7':'#e1e2d6','#737e72',2);
      this.box(x-23,y-54,46,27,done?'#96ce9b':'#b5c7bd','#859a87',1);
      this.text('ϟ',x,y-32,25,done?'#fffdea':'#819b89','center');
      this.circle(x-14,y-16,3,'#cd9676',2,done?'#a2c879':'#dcaa82');this.circle(x+12,y-16,3,'#b6a06f',2,'#ead39a');
      if(done)this.text('✓',x+47,y-30,28,'#6c993d','center');
    } else if(o.type==='enemy'||o.type==='turret') {
      if(o.type==='enemy')this.npc('assistant',x,y,t);
      else {this.box(x-25,y-55,50,42,done?'#ddd8ca':'#f4d271','#b59c55',2);this.box(x-16,y-77,32,23,'#f3d88d','#b59c55',2);this.circle(x-7,y-66,3,INK,1,INK);this.circle(x+7,y-66,3,INK,1,INK);this.line(x+27,y-40,x+42,y-35,'#b59c55',5);this.line(x-13,y-12,x-16,y,'#b59c55',4);this.line(x+13,y-12,x+16,y,'#b59c55',4);}
      if(o.prism>0){this.path([[x,y-108],[x-39,y+10],[x+40,y+10],[x,y-108]],'#ee80ae',3,'#ffd2e344');this.line(x,y-108,x+14,y-5,'#ee80ae',1);this.text(Math.ceil(o.prism)+' s',x,y-118,16,'#ba507d','center');}
      if(o.stun>0)this.text('✧  ✧',x,y-85,24,'#c5a043','center');
      if(done)this.text('✓',x,y-95,30,'#7d9b50','center');
    } else if(o.type==='distant') {
      this.circle(x,y-25,12,'#c09a39',3);this.path([[x,y-12],[x,y+13],[x+11,y+13],[x+11,y+5]],'#c09a39',4);this.text('LLAVE',x,y-50,18,'#9a7c32','center');
    } else if(o.type==='piece') {
      if(game.scene===4){this.circle(x,y-25,20,'#f37eae',3,'#fbc4db');this.text('♡',x,y-17,27,'#c85987','center');}
      else {this.box(x-16,y-39,32,31,'#b5cddb','#7797a3',2);this.box(x-8,y-47,16,11,'#b5cddb','#7797a3',2);this.text('✧',x,y-16,21,'#7797a3','center');}
    } else if(o.type==='scanner') {
      this.line(x,y-10,x,y-50,'#b9a38a',3);this.path([[x-30,y-52],[x-10,y-68],[x+10,y-68],[x+30,y-52],[x+10,y-40],[x-10,y-40]],'#9f8878',2,done?'#e1eccd':'#f5ebd9',true);this.circle(x,y-54,8,done?'#92b169':'#a78b6c',2,done?'#a4c37d':'#b79c79');if(done)this.text('✓',x,y-85,26,'#81a04f','center');
    } else if(o.type==='target') {this.circle(x,y-29,39,done?'#a3b786':'#955c50',2,PAPER);this.circle(x,y-28,27,'#b37758',3,'#fff6dc');this.circle(x,y-28,17,'#d35f65',4);this.circle(x,y-28,6,'#d35f65',2,'#d35f65');this.text(done?'✓':'BLANCO · C',x,y+28,done?26:18,done?'#7f9e4d':'#965349','center');}
    else if(o.type==='slot') {this.box(x-34,y-52,68,50,done?'#e3edcc':'#eee0ca','#a89373',2);this.box(x-16,y-38,32,17,done?'#b0c985':'#bcaa8c','#a89373',2);this.text(done?'✓':'◇',x,y-66,24,done?'#7f9e4d':'#a89373','center');}
    else if(o.type==='plate') {this.path([[x-36,y-8],[x+24,y-14],[x+37,y],[x-24,y+7]],'#9a927f',2,done?'#b9d189':'#ddd6c5',true);if(done)this.gift(x,y-6,.8);}
    else if(o.type==='antenna') {this.line(x,y,x,y-70,'#477b78',5);this.path(done?[[x-42,y-82],[x,y-50],[x+42,y-82]]:[[x-13,y-84],[x,y-50],[x+13,y-84]],'#3d9b9c',5);this.circle(x,y-54,5,'#558b89',2,'#f0d078');this.text(done?'¡Desplegada!':'ANTENA · X',x,y+27,19,'#417b79','center');}
    else if(o.type==='secret-door') {this.box(x-22,y-43,44,33,'#fff6d9','#beaf86',1);this.star(x,y-27,11,'#c2a05a','#f5e1a3');if(game.marks.length===3)this.text('✧',x+34,y-48,32,'#c9a04d','center');}
    if(distanceTo(o,game.player)<100&&!game.dialog.length){this.box(x-64,y+15,128,25,'#fffdf3','#d2c6ae',1);this.text(o.name,x,y+33,15,'#726952','center');}
  }
  draw(game,home=false) {
    const c=this.c;this.dancing=game.scene===5&&game.party>0;c.clearRect(0,0,WIDTH,HEIGHT);this.scenery(game,home);
    if(home) {
      this.hero(0,605,420,1.3,game.time);this.hero(1,724,437,1.25,game.time+.7);this.hero(2,837,420,1.3,game.time+.5);
      this.text('¡PODEMOS CON ESTO!',735,288,26,'#8b7464','center');paperGrain(c,WIDTH,HEIGHT);return;
    }
    for(const o of [...game.objects].sort((a,b)=>a.y-b.y))this.object(o,game);
    const p=game.player,t=game.time;
    if(game.shield>0){this.circle(p.x,p.y-28,115,'#55c0d3',3,'#b8e9ef33');this.text('PROTEGIDOS',p.x,p.y-152,18,'#269eb2','center');}
    if(game.cube){const {x,y}=game.cube;this.box(x-31,y-52,62,58,'#d1eaa433','#8fbf4a',3);this.path([[x-31,y-52],[x-16,y-67],[x+45,y-65],[x+31,y-52],[x+45,y-65],[x+45,y-8],[x+31,y+6]],'#8fbf4a',2);}
    if(game.partyBuried>0) {
      this.circle(p.x,p.y,27,'#a18e74',2,'#bbaa8b');this.text('¡FIESTA!',p.x,p.y-85,31,'#c9a14b','center');
      for(let i=0;i<7;i++){const a=i/7*tau;this.star(p.x+Math.cos(a)*65,p.y-35+Math.sin(a)*39,5,['#f2a2c3','#a2c578','#88c7ce'][i%3]);}
    } else {
      c.save();if(game.invulnerable>0)c.globalAlpha=.65;
      this.hero(p.hero,p.x,p.y,game.small?.42:1,t,{invisible:game.invisible>0,selected:true});c.restore();
    }
    if(game.gift&&!game.gift.placed)this.gift(game.gift.x,game.gift.y);
    for(const b of game.bullets){this.circle(b.x,b.y-18,6,b.reflected?'#91b34e':'#ca9c6b',2,b.reflected?'#c6dd8e':'#ecd3a7');this.line(b.x-b.vx*.07,b.y-18-b.vy*.07,b.x,b.y-18,b.reflected?'#bfd184':'#debd91',2);}
    for(const bomb of game.bombs){const lift=Math.sin(Math.PI*Math.min(1,bomb.elapsed/bomb.duration))*65;this.potato(bomb.x,bomb.y-18-lift);}
    for(const e of game.effects) {
      const a=e.time/e.total;c.save();c.globalAlpha=a;
      if(e.type==='ray'){const pts=[[p.x,p.y-40]];for(let i=1;i<8;i++)pts.push([p.x+(e.x-p.x)*i/8+(i%2?8:-8),p.y-40+(e.y-p.y)*i/8]);pts.push([e.x,e.y-30]);this.path(pts,'#dfb63b',4);}
      if(e.type==='spikes'){for(let i=0;i<3;i++)this.path([[e.x-20+i*15,e.y],[e.x-13+i*15,e.y-30],[e.x-5+i*15,e.y]],'#8dbd4c',3,'#dcebb9',true);}
      if(['puf','ouch','bounce'].includes(e.type))this.text(({puf:'¡PUF!',ouch:'¡PLOP!',bounce:'¡BOING!'})[e.type],e.x,e.y-65-(1-a)*25,30,e.type==='ouch'?'#ce7092':'#ae9356','center');
      if(e.type==='star')this.star(e.x,e.y-40-(1-a)*35,20,'#caa84a','#f9df83');c.restore();
      if(e.type==='elastic'){
        const reach=Math.sin((1-a)*Math.PI),x=p.x+(e.x-p.x)*reach,y=p.y-40+(e.y-p.y+15)*reach;
        this.path([[p.x,p.y-40],[(p.x+x)/2,(p.y-40+y)/2+7],[x,y]],'#08afce',7);this.circle(x,y,7,'#08afce',3);
        if(e.item==='distant'){const kx=a>.5?e.x:x,ky=a>.5?e.y-25:y;this.circle(kx,ky,12,'#c09a39',3);this.path([[kx,ky+12],[kx,ky+38],[kx+11,ky+38],[kx+11,ky+30]],'#c09a39',4);}
      }
      if(e.type==='punch'){c.save();c.globalAlpha=a;this.box(e.x-21,e.y-53,42,31,'#a5e1ec','#079ebc',4);for(let k=0;k<3;k++)this.line(e.x-12+k*12,e.y-53,e.x-12+k*12,e.y-40,'#079ebc',2);this.text('¡PUM!',e.x,e.y-68,25,'#079ebc','center');c.restore();}
      if(e.type==='explosion'){c.save();c.globalAlpha=a;this.star(e.x,e.y-25,95,'#d3a03b','#f7df97');this.text('¡PAPAPUMBA!',e.x,e.y-18,29,'#9e6830','center');c.restore();}
    }
    if(game.storm>0){c.save();c.fillStyle='#a4c4cb18';c.fillRect(30,90,900,406);for(let i=0;i<25;i++){const x=40+(i*73)%880,y=115+((i*41+t*90)%350);this.line(x,y,x-6,y+12,'#8fb6c3',1.5);}this.text('BRRRRUM…',480,111,27,'#87a1a7','center');c.restore();}
    if(game.cinematic?.kind==='separate'){
      const t=Math.min(1,game.cinematic.time/2.5);this.path([[202,407],[360,355],[560,330]],'#25baca',3);this.hero(0,560-105*t,365,Math.max(.1,t),game.time);this.text('¡A su cuerpo!',440,308,25,'#cc528d','center');
    }
    if(game.party>0)this.partyScene(game);
    if(game.weather)this.weatherScene(game);
    const mark=game.definition.mark;
    if(mark&&!game.marks.includes(game.scene)){
      this.star(mark.x,mark.y-15,12,'#a77c20','#f6cf5c');
    }
    if(game.scene===6&&game.complete)this.text('✧  VIÑETA SECRETA COMPLETADA  ✧',480,217,24,'#b38c3c','center');
    paperGrain(c,WIDTH,HEIGHT);
  }
  potato(x,y){const c=this.c;c.save();c.translate(x,y);c.scale(1.25,.82);this.circle(0,0,11,'#a9763e',2,'#d7b67c');this.circle(-4,-3,1,'#9d7846',1);this.circle(4,3,1,'#9d7846',1);this.path([[6,-9],[9,-16],[13,-18]],'#71614c',1.5);c.restore();}
  weatherScene(game){
    const c=this.c,kind=game.weather.kind,t=this.reduced?0:game.time;c.save();c.beginPath();c.rect(30,83,900,414);c.clip();
    if(kind==='fog'){
      c.fillStyle='#d8e4e820';c.fillRect(30,83,900,414);
      for(let i=0;i<7;i++){
        const y=130+i*52,drift=Math.sin(t*.5+i)*24;
        c.globalAlpha=.22;this.path([[32,y+20],[105+drift,y-9],[240+drift,y+8],[380+drift,y-12],[555+drift,y+10],[720+drift,y-9],[930,y+14],[930,y+42],[32,y+44]],'#b9cbd1',1,'#e3ecee',true);
      }
    } else if(kind==='sun'){
      c.fillStyle='#fff0a422';c.fillRect(30,83,900,414);this.circle(846,143,29,'#e6b637',3,'#f9df68');
      for(let i=0;i<12;i++){const a=i/12*tau;this.line(846+Math.cos(a)*39,143+Math.sin(a)*39,846+Math.cos(a)*54,143+Math.sin(a)*54,'#e8c344',3);}
      for(let i=0;i<6;i++){c.globalAlpha=.07;const x=60+i*156;this.path([[846,143],[x,497],[x+85,497]],'#f0cf6c',1,'#f4dc8f',true);}
    } else {
      for(let i=0;i<9;i++){
        const x=38+((i*123+t*96)%800),y=137+(i*47)%310;
        this.path([[x,y],[x+40,y-7],[x+90,y-8],[x+116,y-22],[x+110,y-35],[x+96,y-29]],'#8dbbc4',2);
        this.line(x-12,y+13,x+55,y+9,'#b6cfd3',1.5);
      }
    }
    c.globalAlpha=1;this.text(({fog:'SHHH… NEBLINA',sun:'¡SALÍ, SOL!',wind:'FUUU… ¡VIENTO!'})[kind],480,112,24,kind==='sun'?'#a88320':'#568997','center');c.restore();
  }
  partyScene(game){
    const c=this.c,t=this.reduced?0:game.time;c.save();c.beginPath();c.rect(30,83,900,414);c.clip();
    const colors=['#f7a4c3','#b4da76','#90d8e9','#f3d278'];
    for(let i=0;i<4;i++){c.globalAlpha=.16;this.path([[180+i*200,90],[50+i*180,493],[300+i*170,493]],colors[i],1,colors[i],true);}
    c.globalAlpha=1;this.circle(480,125,18,'#8ca1a0',1.5,'#d6e1df');this.line(480,90,480,107,INK,1.5);
    for(let i=0;i<22;i++){const x=60+(i*143)%830,y=160+(i*41+(this.reduced?0:t*18))%300;this.star(x,y,5,colors[i%4],colors[i%4]);}
    this.box(245,164,470,35,PAPER,'#dd9db7',1);this.text('¡FIESTA PARA TODA LA VIÑETA!',480,190,24,'#c14b82','center');c.restore();
  }
}
function distanceTo(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
