// Transições locais: a moldura permanece ancorada; só o conteúdo muda de opacidade.
const heights=new Map();
let running=null;
const reduced=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
const card=()=>document.querySelector('.question-card');
export function captureTransition(view){
 const el=card();
 if(!el?.getBoundingClientRect||!el.cloneNode)return null;
 running?.();
 const inner=el.querySelector('.question-content');
 const active=document.activeElement;
 return {view,top:window.scrollY,left:window.scrollX,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,old:inner?.cloneNode(true),focus:active?.id?{id:active.id,start:active.selectionStart,end:active.selectionEnd}:null};
}
export function finishTransition(before,view){
 const el=card();
 if(!el?.getBoundingClientRect||!el.ownerDocument)return;
 const same=before?.view===view;
 const doc=el.ownerDocument;
 const inner=doc.createElement('div');inner.className='question-content';
 while(el.firstChild)inner.append(el.firstChild);
 el.append(inner);
 // Máximo observado por módulo/largura; cresce para acomodar conteúdo, nunca o corta.
 const width=Math.round(el.getBoundingClientRect().width);
 const key=`${view}:${Math.round(width/40)}`;
 const height=Math.max(el.getBoundingClientRect().height,heights.get(key)||0,same&&Math.abs(before.width-width)<2?before.height:0);
 heights.set(key,height);el.style.minHeight=`${height}px`;
 const css=globalThis.getComputedStyle?.(el);
 const edges=css?['paddingTop','paddingBottom','borderTopWidth','borderBottomWidth'].reduce((n,k)=>n+(parseFloat(css[k])||0),0):56;
 inner.style.minHeight=`${Math.max(0,height-edges)}px`;
 const restore=()=>{if(same&&Number.isFinite(before.top))window.scrollTo({top:before.top,left:before.left||0,behavior:'instant'});};
 if(same&&before.focus){const target=doc.getElementById(before.focus.id);target?.focus({preventScroll:true});try{if(before.focus.start!==null)target?.setSelectionRange(before.focus.start,before.focus.end);}catch{}}
 restore();
 if(!same||!before.old||reduced()||!inner.animate)return;
 const ghost=before.old;ghost.classList.add('question-outgoing');ghost.setAttribute('aria-hidden','true');ghost.setAttribute('inert','');
 for(const node of ghost.querySelectorAll('[id]'))node.removeAttribute('id');
 el.append(ghost);
 const incoming=inner.animate([{opacity:0},{opacity:1}],{duration:240,easing:'ease-in-out'});
 const outgoing=ghost.animate([{opacity:1},{opacity:0}],{duration:240,easing:'ease-in-out'});
 let done=false;
 const cleanup=()=>{if(done)return;done=true;incoming.cancel();outgoing.cancel();ghost.remove();if(running===cleanup)running=null;};
 running=cleanup;
 Promise.allSettled([incoming.finished,outgoing.finished]).then(cleanup);
}
