import test from 'node:test';import assert from 'node:assert/strict';
import {headerOffset,syncHeaderScroll} from '../header-scroll.mjs';
test('Rolagem desloca somente a altura sólida e mantém a cauda do degradê',()=>{assert.equal(headerOffset(0,88),0);assert.equal(headerOffset(40,88),40);assert.equal(headerOffset(200,88),88);assert.equal(headerOffset(-10,88),0);});
test('Altura móvel determina o limite do cabeçalho',()=>{const header={style:{}};globalThis.document={querySelector:()=>header};globalThis.window={scrollY:180};globalThis.getComputedStyle=()=>({getPropertyValue:()=> '76px'});syncHeaderScroll();assert.equal(header.style.transform,'translateY(-76px)');delete globalThis.getComputedStyle;});
test('Ausência de elementos visuais não interrompe o renderizador',()=>{globalThis.document={querySelector:()=>null};assert.doesNotThrow(syncHeaderScroll);});
