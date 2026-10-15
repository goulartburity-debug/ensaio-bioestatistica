import {calculate} from './engine.mjs';
import {comparisonScenarios} from './calculation-jobs.mjs';
self.onmessage=({data})=>{
 try{
  if(!['calculate','scenarios'].includes(data.kind))throw Error('Operação de cálculo desconhecida.');
  const value=data.kind==='scenarios'?comparisonScenarios(data.inputs):calculate(data.inputs);
  self.postMessage({id:data.id,value});
 }catch(error){self.postMessage({id:data.id,error:error.message});}
};
