import {calculate} from './engine.mjs';
import {isComparison} from './comparisons.mjs';

export function comparisonScenarios(s){
 const key=s.differenceMode==='percent'?'deltaPercent':'delta';
 const base=Number(String(s[key]).replace(',','.'));
 return [.8,1,1.2].map(factor=>{
  const value=base*factor;
  try{return {value,result:calculate({...s,[key]:String(value)})};}
  catch(error){return {value,error:error.message};}
 });
}

// Keep the numerical integrations off the browser's UI thread. The fallback
// is also used by unit tests and environments without module Workers.
let worker=null,serial=0;
const pending=new Map();
function failAll(message){for(const {reject,timer} of pending.values()){clearTimeout(timer);reject(Error(message));}pending.clear();worker?.terminate();worker=null;}
function job(kind,inputs){
 if(typeof Worker==='undefined'||!isComparison(inputs.method))return Promise.resolve().then(()=>kind==='scenarios'?comparisonScenarios(inputs):calculate(inputs));
 return new Promise((resolve,reject)=>{
  try{
   if(!worker){
    worker=new Worker(new URL('./calculation-worker.mjs',import.meta.url),{type:'module'});
    worker.onmessage=({data})=>{
     const item=pending.get(data.id);if(!item)return;pending.delete(data.id);clearTimeout(item.timer);
     if(data.error)item.reject(Error(data.error));else item.resolve(data.value);
    };
    worker.onerror=()=>failAll('Não foi possível concluir o cálculo neste navegador. Nenhum resultado foi recomendado.');
   }
   const id=++serial;
   const timer=setTimeout(()=>failAll('O cálculo excedeu o tempo permitido. Revise os valores; nenhum resultado foi recomendado.'),30000);
   pending.set(id,{resolve,reject,timer});
   try{worker.postMessage({id,kind,inputs});}catch(error){pending.delete(id);clearTimeout(timer);reject(error);}
  }catch(error){reject(error);}
 });
}
export const runCalculation=inputs=>job('calculate',inputs);
export const runScenarios=inputs=>job('scenarios',inputs);
