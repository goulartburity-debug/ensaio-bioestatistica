import test from 'node:test';import assert from 'node:assert/strict';
import {drawGuideTip,guideTips} from '../guide-tips.mjs';
test('Seis dicas disponíveis e sorteio alcança as extremidades',()=>{
 assert.equal(guideTips.length,6);const old=Math.random;
 try{Math.random=()=>0;assert.equal(drawGuideTip(),guideTips[0]);Math.random=()=>.99999;assert.equal(drawGuideTip(),guideTips[5]);}finally{Math.random=old;}
});
test('Retorno à home evita repetir a dica anterior',()=>{
 const old=Math.random;try{Math.random=()=>0;assert.equal(drawGuideTip(guideTips[0]),guideTips[1]);}finally{Math.random=old;}
});
test('Recarregamento recupera última dica da sessão sem tocar no planejamento',()=>{
 const store=new Map([['codel-stat-last-guide-tip',guideTips[0]]]);globalThis.sessionStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)};
 const old=Math.random;try{Math.random=()=>0;assert.equal(drawGuideTip(),guideTips[1]);assert.equal(store.size,1);assert.equal(store.get('codel-stat-last-guide-tip'),guideTips[1]);}finally{Math.random=old;delete globalThis.sessionStorage;}
});
