import test from 'node:test';import assert from 'node:assert/strict';
import {captureTransition,finishTransition} from '../transitions.mjs';
class El{
 constructor(doc,name=''){this.ownerDocument=doc;this.name=name;this.children=[];this.style={};this.attrs={};this.className='';this.classList={add:x=>this.className+=' '+x};}
 get firstChild(){return this.children[0]||null;}
 append(el){el.remove();el.parent=this;this.children.push(el);}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this);this.parent=null;}
 querySelector(){return this.children.find(x=>x.className==='question-content')||null;}
 querySelectorAll(){return [];}
 getBoundingClientRect(){return {width:600,height:Math.max(this.height||760,parseFloat(this.style.minHeight)||0)};}
 cloneNode(){const x=new El(this.ownerDocument);x.className=this.className;return x;}
 setAttribute(k,v){this.attrs[k]=v;}
 animate(frames,opts){animations.push({frames,opts});return {finished:Promise.resolve(),cancel(){}};}
}
let current,animations=[],scrolls=[],reduce=false;
const doc={querySelector:()=>current,createElement:()=>new El(doc),getElementById:()=>null,activeElement:null};
globalThis.document=doc;globalThis.window={scrollY:180,scrollX:0,scrollTo:x=>scrolls.push(x)};
globalThis.matchMedia=()=>({matches:reduce});
test('Troca de etapa mantém altura e posição e anima só conteúdo em 240 ms',async()=>{
 current=new El(doc);current.height=920;current.append(new El(doc));finishTransition(null,'wizard');
 const before=captureTransition('wizard');current=new El(doc);current.height=500;current.append(new El(doc));
 finishTransition(before,'wizard');assert.equal(current.style.minHeight,'920px');assert.equal(scrolls.at(-1).top,180);
 assert.equal(animations.length,2);assert.equal(animations[0].opts.duration,240);assert.equal(animations[0].opts.easing,'ease-in-out');
 assert.equal(current.children[1].attrs['aria-hidden'],'true');assert.ok('inert' in current.children[1].attrs);
 await new Promise(resolve=>setTimeout(resolve,0));assert.equal(current.children.length,1);
});
test('Preferência por movimento reduzido desativa os fades',()=>{
 reduce=true;animations=[];const before=captureTransition('wizard');current=new El(doc);finishTransition(before,'wizard');assert.equal(animations.length,0);reduce=false;
});
test('Troca de módulo não restaura rolagem do módulo anterior',()=>{
 scrolls=[];const before=captureTransition('wizard');current=new El(doc);finishTransition(before,'analysis');assert.equal(scrolls.length,0);
});
test('Ambiente sem medições DOM não interfere no renderizador',()=>{
 current={};assert.equal(captureTransition('wizard'),null);assert.doesNotThrow(()=>finishTransition(null,'wizard'));
});
