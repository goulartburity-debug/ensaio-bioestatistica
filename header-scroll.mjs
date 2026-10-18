export function headerOffset(scrollY,solidHeight){return Math.min(Math.max(Number(scrollY)||0,0),solidHeight);}
export function syncHeaderScroll(){
 const header=document.querySelector('.app-header');if(!header?.style)return;
 const height=parseFloat(globalThis.getComputedStyle?.(header).getPropertyValue('--app-header-height'))||88;
 header.style.transform=`translateY(-${headerOffset(window.scrollY,height)}px)`;
}
if(typeof window!=='undefined')window.addEventListener?.('scroll',syncHeaderScroll,{passive:true});

if(typeof window!=='undefined')window.addEventListener?.('resize',syncHeaderScroll,{passive:true});
