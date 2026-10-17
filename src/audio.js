export class Soundtrack {
  constructor(){this.context=null;this.enabled=false;this.volume=.2;}
  unlock(){try{this.context??=new (window.AudioContext||window.webkitAudioContext)();if(this.context.state==='suspended')this.context.resume().catch(()=>{});}catch{this.enabled=false;}}
  play(kind='puf') {
    if(!this.enabled)return;this.unlock();if(!this.context)return;
    const patterns={electric:[330,660,880],puf:[440,240],party:[392,494,587,784],secret:[523,659,784,1047],bounce:[180,480],ouch:[180,120]};
    const notes=patterns[kind]||patterns.puf;
    notes.forEach((f,i)=>{const ctx=this.context,o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+i*.09;o.type=kind==='electric'?'triangle':'sine';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(this.volume*.22,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+.18);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.2);});
  }
}
