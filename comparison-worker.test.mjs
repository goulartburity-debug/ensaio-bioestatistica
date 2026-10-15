import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {once} from 'node:events';
import {defaults} from '../sample-size/methods.mjs';

test('Módulo do worker executa cálculo, cenários e recusa operação desconhecida',async()=>{
 const worker=new Worker(new URL('./helpers/calculation-worker-node.mjs',import.meta.url));
 try{
  const [ready]=await once(worker,'message');assert.equal(ready.ready,true);
  const inputs={...defaults(),method:'dunnett',groups:'4',delta:'5',sd:'8'};
  const ask=async(kind,id)=>{const response=once(worker,'message');worker.postMessage({kind,id,inputs});return (await response)[0];};
  const result=await ask('calculate',1);assert.equal(result.id,1);assert.equal(result.value.n,53);
  const scenarios=await ask('scenarios',2);assert.equal(scenarios.value.length,3);
  assert.ok(scenarios.value[0].result.n>scenarios.value[1].result.n);assert.ok(scenarios.value[2].result.n<scenarios.value[1].result.n);
  const invalid=await ask('unknown',3);assert.match(invalid.error,/desconhecida/);
 }finally{await worker.terminate();}
});
