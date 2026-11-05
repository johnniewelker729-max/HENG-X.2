(()=>{
 'use strict';
 const section=document.getElementById('reviews');
 section.classList.add('callball-reviews');
 section.replaceChildren();
 const el=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n};
 const header=el('div',undefined,'cb-heading'),copy=el('div');
 const title=el('h3','รีวิวจากผู้ใช้งาน');title.id='reviews-title';section.setAttribute('aria-labelledby',title.id);
 copy.append(title,el('p','ความคิดเห็นที่เผยแพร่ผ่าน Callball Reviews'));
 const controls=el('div',undefined,'cb-controls');
 const prev=el('button','‹'),next=el('button','›');prev.type=next.type='button';prev.setAttribute('aria-label','รีวิวก่อนหน้า');next.setAttribute('aria-label','รีวิวถัดไป');
 controls.append(prev,next);header.append(copy,controls);
 const status=el('p',undefined,'cb-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const retry=el('button','ลองใหม่','cb-retry');retry.type='button';
 const viewport=el('div',undefined,'cb-viewport'),track=el('div',undefined,'cb-track');viewport.tabIndex=0;viewport.setAttribute('aria-label','สไลด์รีวิว ใช้ปุ่มลูกศรเพื่อเลื่อน');viewport.append(track);
 const position=el('p',undefined,'cb-position');section.append(header,status,retry,viewport,position);
 const mobile=matchMedia('(max-width: 767px)');let data=[],index=0,busy=false,signature='';
 const count=()=>mobile.matches?3:5;
 function update(){const visible=count(),max=Math.max(0,data.length-visible);index=Math.min(index,max);track.style.transform=`translateX(calc(-${index} * (100% + 12px) / ${visible}))`;prev.disabled=index===0;next.disabled=index===max;position.textContent=data.length?`${index+1}–${Math.min(index+visible,data.length)} / ${data.length}`:'';Array.from(track.children).forEach((card,i)=>{const hidden=i<index||i>=index+visible;card.inert=hidden;card.setAttribute('aria-hidden',String(hidden))})}
 function move(dir){index=Math.max(0,Math.min(index+dir,Math.max(0,data.length-count())));update()}
 prev.onclick=()=>move(-1);next.onclick=()=>move(1);
 viewport.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
 let touch=null;
 viewport.addEventListener('touchstart',e=>{if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY};else touch=null},{passive:true});
 viewport.addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy))move(dx<0?1:-1);touch=null},{passive:true});
 viewport.addEventListener('touchcancel',()=>touch=null,{passive:true});mobile.addEventListener('change',update);
 function message(text,canRetry=false){status.textContent=text;retry.hidden=!canRetry;viewport.hidden=true;position.hidden=true;prev.disabled=next.disabled=true;track.replaceChildren();data=[];signature=''}
 async function load(){
  if(busy)return;busy=true;section.setAttribute('aria-busy','true');retry.disabled=true;
  if(!data.length)message('กำลังโหลดรีวิว…');
  try{
   const r=await fetch('/api/reviews',{cache:'no-store',signal:AbortSignal.timeout(12000)});const body=await r.json();
   if(!r.ok||body.status==='error')throw Error();
   if(body.status==='unconfigured'){message('รอตั้งค่าบริการสำหรับแสดงรีวิว');return}
   if(!Array.isArray(body.data))throw Error();
   if(!body.data.length){message('ยังไม่มีรีวิวที่เผยแพร่สำหรับบริการนี้');return}
   const nextSignature=JSON.stringify(body.data);
   if(nextSignature!==signature){data=body.data;signature=nextSignature;index=0;track.replaceChildren();
    for(const r of data){
     const card=el('article',undefined,'cb-card'),name=el('h4',r.display_name),rating=el('p',`${r.rating} / 5`, 'cb-rating');rating.setAttribute('aria-label',`คะแนน ${r.rating} จาก 5`);
     const quote=el('p',r.content,'cb-content'),link=el('a','อ่านรีวิวเต็ม');const url=new URL(r.permalink);if(url.protocol!=='https:')throw Error();link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';card.append(rating,name,quote,link);track.append(card);
    }
   }
   status.textContent='';retry.hidden=true;viewport.hidden=false;position.hidden=false;update();
  }catch{message('โหลดรีวิวไม่ได้ กรุณาลองใหม่',true)}finally{busy=false;retry.disabled=false;section.setAttribute('aria-busy','false')}
 }
 retry.onclick=load;load();setInterval(load,30000);
})();
