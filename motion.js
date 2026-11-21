'use strict';
(() => {
  const root=document.documentElement, media=matchMedia('(prefers-reduced-motion: reduce)'), fine=matchMedia('(hover:hover) and (pointer:fine)');
  const thread=document.querySelector('#page-thread path'), btn=document.querySelector('#motion-toggle'), hero=document.querySelector('.hero');
  let context, lenis, tick, userOff=false, heroLoaded=false;
  try{userOff=localStorage.getItem('lynette-motion')==='off';}catch{}
  function sync(){
    context?.revert();context=null;
    if(tick && window.gsap)gsap.ticker.remove(tick);lenis?.destroy();window.__lenis=lenis=null;
    const reduced=userOff||media.matches;root.classList.toggle('reduced',reduced);
    btn.textContent=media.matches?'System reduced motion':userOff?'Resume motion':'Pause motion';btn.disabled=media.matches;btn.setAttribute('aria-pressed',String(reduced));
    window.dispatchEvent(new Event('lynette-motion-change'));
    if(reduced || !window.gsap || !window.ScrollTrigger)return;
    gsap.registerPlugin(ScrollTrigger);ScrollTrigger.config({ignoreMobileResize:true});
    if(fine.matches && window.Lenis){lenis=new Lenis({smoothWheel:true,syncTouch:false,anchors:true});window.__lenis=lenis;lenis.on('scroll',ScrollTrigger.update);tick=time=>lenis.raf(time*1000);gsap.ticker.add(tick);}
    context=gsap.context(()=>{
      if(fine.matches&&innerWidth>960){
        document.querySelectorAll('.rail').forEach(rail=>{const track=rail.querySelector('.rail-track');const travel=()=>track.scrollWidth-track.clientWidth;if(travel()<100)return;
          gsap.to(track,{scrollLeft:travel,ease:'none',scrollTrigger:{trigger:rail,start:'center center',end:()=>'+='+Math.min(travel(),900),pin:true,scrub:.4,invalidateOnRefresh:true}});});
      }
      const length=thread.getTotalLength();gsap.fromTo(thread,{strokeDasharray:length,strokeDashoffset:length},{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:'.journey',start:'top 90%',end:'bottom 80%',scrub:true}});
      gsap.to('.ticker>div',{xPercent:-23,ease:'none',scrollTrigger:{trigger:'.ticker',start:'top bottom',end:'bottom top',scrub:1}});
      document.querySelectorAll('.section h2').forEach(heading=>gsap.from(heading,{y:22,clipPath:'inset(0 0 16% 0)',duration:.75,ease:'power2.out',scrollTrigger:{trigger:heading,start:'top 96%',once:true}}));
      gsap.from('.range-row',{x:15,stagger:.06,duration:.6,scrollTrigger:{trigger:'.range-column',start:'top 94%',once:true}});
      document.querySelectorAll('.rail').forEach(rail=>ScrollTrigger.create({trigger:rail,start:'top 90%',once:true,onEnter:()=>rail.classList.add('woven-in')}));
      gsap.from('.order li',{y:18,stagger:.12,duration:.6,scrollTrigger:{trigger:'.order ol',start:'top 94%',once:true}});
      if(!document.querySelector('#details').hidden)gsap.fromTo('#detail-photo',{scale:1.62,yPercent:-4},{scale:1.83,yPercent:4,ease:'none',scrollTrigger:{trigger:'#details',start:'top bottom',end:'bottom top',scrub:true}});
    });
    if(!heroLoaded){heroLoaded=true;const later=window.requestIdleCallback||((fn)=>setTimeout(fn,300));later(()=>{if(!root.classList.contains('reduced'))import('./hero.js').catch(()=>{});else heroLoaded=false;},{timeout:1600});}
  }
  sync();media.addEventListener('change',sync);btn.onclick=()=>{userOff=!userOff;try{localStorage.setItem('lynette-motion',userOff?'off':'on');}catch{}sync();};
  document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a||!lenis)return;const target=document.getElementById(a.hash.slice(1));if(target){e.preventDefault();lenis.scrollTo(target,{duration:.85,onComplete:()=>{history.replaceState(null,'',a.hash);target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}});}});
  if(!root.classList.contains('reduced')&&window.gsap){
    const line=document.createElement('i');line.className='intro-thread';line.setAttribute('aria-hidden','true');document.querySelector('.mast').append(line);
    const skip=document.createElement('button');skip.className='intro-skip';skip.textContent='Skip intro';hero.append(skip);
    const title=document.querySelector('#title>span'),letters=[...title.textContent].map(c=>{const span=document.createElement('span');span.textContent=c;span.style.display='inline-block';span.setAttribute('aria-hidden','true');return span;});title.replaceChildren(...letters);
    const intro=gsap.timeline({onComplete:()=>{line.remove();skip.remove();}});intro.from(line,{scaleX:0,duration:.6}).from(letters,{yPercent:12,opacity:.3,stagger:.035,duration:.4},.08).from('#title em',{x:-12,duration:.6},.18);skip.onclick=()=>intro.progress(1);
  }
  if(fine.matches)document.querySelectorAll('.hero .button,.navcta').forEach(a=>{a.onpointermove=e=>{if(root.classList.contains('reduced'))return;const r=a.getBoundingClientRect();a.style.transform='translate('+((e.clientX-r.left-r.width/2)*.05)+'px,'+((e.clientY-r.top-r.height/2)*.12)+'px)';};a.onpointerleave=()=>a.style.transform='';});
  document.fonts.ready.then(()=>window.ScrollTrigger?.refresh());
  const brush=target=>{if(target&&!root.classList.contains('reduced'))import('./sheen.js').then(m=>m.sweep(target)).catch(()=>{});};
  document.querySelector('#grid').addEventListener('pointerover',e=>{const image=e.target.closest('.picture');if(e.pointerType==='mouse'&&image&&!image.contains(e.relatedTarget))brush(image);});
  if('IntersectionObserver' in window){const glimpse=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){brush(document.querySelector('.piece .picture'));glimpse.disconnect();}},{threshold:.6});const first=document.querySelector('.piece');if(first)glimpse.observe(first);}
})();
