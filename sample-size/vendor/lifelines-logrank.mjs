/* Adapted from lifelines 0.30.0, statistics.py:
 * sample_size_necessary_under_cph and power_under_cph.
 * Copyright (c) 2017 Cameron Davidson-Pilon. MIT License.
 * Full notice: ../licenses/lifelines-MIT.txt
 * Changes: scalar JavaScript, jStat normal quantiles/CDF; events target exposed.
 * This is the Freedman-type approximation used by those functions,
 * not the log(HR) formula of Schoenfeld.
 */
import {jStat} from './jstat.mjs';
export function lifelinesSize(power,k,pExp,pCon,hr,alpha=.05){
 const events=1/k*((k*hr+1)/(hr-1))**2*(jStat.normal.inv(1-alpha/2,0,1)+jStat.normal.inv(power,0,1))**2;
 return {nExp:Math.ceil(events*k/(k*pExp+pCon)),nCon:Math.ceil(events/(k*pExp+pCon)),events};
}
export function lifelinesPower(nExp,nCon,pExp,pCon,hr,alpha=.05){
 const events=nExp*pExp+nCon*pCon,k=nExp/nCon;
 return jStat.normal.cdf(Math.sqrt(k*events)*Math.abs(hr-1)/(k*hr+1)-jStat.normal.inv(1-alpha/2,0,1),0,1);
}
