export function isMobileTouchDevice(device) {
  return Boolean(device.userAgentData?.mobile||/Android|iPhone|iPad|iPod/i.test(device.userAgent||'')||device.platform==='MacIntel'&&device.maxTouchPoints>1);
}

// Pointer capture keeps the left thumb moving while the right one uses a power.
export class TouchControls {
  constructor(root, actions) {
    this.root=root;this.actions=actions;this.axis={x:0,y:0};this.pointer=null;this.movementEnabled=false;
    this.stick=root.querySelector('#touch-stick');this.knob=root.querySelector('.touch-stick-knob');
    this.stick.addEventListener('pointerdown',event=>{
      if(!this.movementEnabled||this.pointer!==null||event.button>0)return;
      event.preventDefault();this.pointer=event.pointerId;this.stick.setPointerCapture(event.pointerId);
      this.actions.moveStart();this.position(event);
    });
    this.stick.addEventListener('pointermove',event=>{
      if(event.pointerId!==this.pointer)return;event.preventDefault();this.position(event);
    });
    for(const name of ['pointerup','pointercancel','lostpointercapture'])this.stick.addEventListener(name,event=>{
      if(event.pointerId===this.pointer)this.reset();
    });
    this.bind(root.querySelector('#touch-interact'),()=>actions.interact(),true);
    for(const name of ['heroes','hint','pause','chapters'])this.bind(root.querySelector(`#touch-${name}`),()=>actions[name]());
    this.powers=root.querySelector('#touch-powers');
    for(const name of ['blur','pagehide','resize'])window.addEventListener(name,()=>this.reset());
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.reset();});
    root.addEventListener('contextmenu',event=>event.preventDefault());
  }
  bind(button,action,onPress=false) {
    if(!onPress){
      let secondaryClick=false;
      button.addEventListener('pointerdown',()=>{secondaryClick=false;});
      // Some mobile browsers do not dispatch a click for a second finger.
      button.addEventListener('pointerup',event=>{
        if(event.pointerType==='touch'&&!event.isPrimary&&!button.disabled){secondaryClick=true;event.preventDefault();setTimeout(()=>{if(!button.disabled)action();},0);}
      });
      button.addEventListener('click',event=>{if(secondaryClick&&event.detail!==0){event.preventDefault();return;}if(!button.disabled)action();});return;
    }
    button.addEventListener('pointerdown',event=>{
      if(button.disabled||event.button>0)return;
      event.preventDefault();action();
    });
    // Keyboard and assistive-technology clicks do not have a pointer-down event.
    button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();if(event.detail===0&&!button.disabled)action();});
  }
  position(event) {
    const rect=this.stick.getBoundingClientRect(),radius=rect.width*.32;
    let x=event.clientX-rect.left-rect.width/2,y=event.clientY-rect.top-rect.height/2;
    const length=Math.hypot(x,y),scale=length>radius?radius/length:1;x*=scale;y*=scale;
    this.knob.style.transform=`translate(${x}px,${y}px)`;
    this.axis=length<radius*.18?{x:0,y:0}:{x:x/radius,y:y/radius};
    this.stick.classList.toggle('moving',Boolean(this.axis.x||this.axis.y));
  }
  reset() {
    const pointer=this.pointer;this.pointer=null;this.axis={x:0,y:0};
    this.knob.style.transform='translate(0px,0px)';this.stick.classList.remove('moving');
    if(pointer!==null&&this.stick.hasPointerCapture(pointer))this.stick.releasePointerCapture(pointer);
  }
  setMovementEnabled(enabled) {
    this.movementEnabled=enabled;this.stick.setAttribute('aria-disabled',String(!enabled));
    if(!enabled)this.reset();
  }
  setHero(hero) {
    this.powers.style.setProperty('--hero-color',hero.color);
    this.powers.style.setProperty('--hero-dark',hero.dark);
    this.powers.replaceChildren(...hero.powers.map((power,index)=>{
      const button=document.createElement('button');button.className='touch-power';button.dataset.touchPower=index;
      button.innerHTML=`<span class="touch-power-symbol" aria-hidden="true">${power[3]}</span><span class="touch-power-status" aria-hidden="true"></span><span class="touch-power-name">${power[0]}</span>`;
      button.title=power[1];this.bind(button,()=>this.actions.power(index),true);return button;
    }));
  }
  syncPower(index,{disabled,active,cooldown,duration,count,label}) {
    const button=this.powers.children[index];if(!button)return;
    button.disabled=disabled;button.classList.toggle('active',active);
    button.classList.toggle('recharging',cooldown>0&&!active);
    button.style.setProperty('--cooldown',duration>0?`${Math.min(1,cooldown/duration)*100}%`:'0%');
    button.querySelector('.touch-power-status').textContent=count??(active?'✓':cooldown>0?Math.ceil(cooldown)+'s':'');
    button.setAttribute('aria-label',label);button.setAttribute('aria-pressed',String(active));
  }
}
