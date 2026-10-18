"""Run original lifelines functions extracted verbatim; SciPy integral for event probability."""
from pathlib import Path
import json,importlib.util
import numpy as np
import scipy
from scipy.integrate import quad
spec=importlib.util.spec_from_file_location('source',Path(__file__).parent/'reference-source/lifelines-cph.py');original=importlib.util.module_from_spec(spec);spec.loader.exec_module(original)
BASE=dict(survApprox='freedman',survUnit='individual',survObservation='exact',survPH='yes',survEffect='medians',survMedianCon='48',survMedianExp='72',survRatio='1',survEntry='0',survFollow='168',survTimeUnit='horas',alpha='5',power='80',comparisons='1',loss='0',sides='two')
def reference(s):
 rate=np.log(2)/float(s['survMedianCon']);hr=float(s['survMedianCon'])/float(s['survMedianExp']) if s['survEffect']=='medians' else float(s['survHR']);entry=float(s['survEntry']);follow=float(s['survFollow']);ratio=float(s['survRatio']);alpha=float(s['alpha'])/100/int(s['comparisons']);target=float(s['power'])/100
 def probability(lam):return 1-np.exp(-lam*follow) if entry==0 else quad(lambda t:1-np.exp(-lam*(follow+entry-t)),0,entry,epsabs=1e-12,epsrel=1e-12)[0]/entry
 pc,pe=probability(rate),probability(hr*rate);ne,nc=original.sample_size_necessary_under_cph(target,ratio,pe,pc,hr,alpha);sourceSizes=[int(nc),int(ne)];sourcePower=float(original.power_under_cph(ne,nc,pe,pc,hr,alpha))
 def power_calc(ne,nc):
  if s['survApprox']=='freedman':return original.power_under_cph(ne,nc,pe,pc,hr,alpha)
  from scipy.stats import norm
  D=ne*pe+nc*pc;q=ne/(ne+nc)
  return norm.cdf(np.sqrt(D*q*(1-q))*abs(np.log(hr))-norm.ppf(1-alpha/2))
 if s['survApprox']=='schoenfeld':
  from scipy.stats import norm
  q=ratio/(1+ratio);D=(norm.ppf(1-alpha/2)+norm.ppf(target))**2/(q*(1-q)*np.log(hr)**2);rawCon=D/(pc+ratio*pe);nc=int(np.ceil(rawCon));ne=int(np.ceil(ratio*rawCon))
 nc=max(nc,2);ne=max(ne,2);power=power_calc(ne,nc);iterations=0
 while power+1e-12<target:
  nc+=1;ne=max(ne,int(np.ceil(nc*ratio)));power=power_calc(ne,nc);iterations+=1
 loss=float(s['loss'])/100;initial=int(np.ceil(nc/(1-loss))+np.ceil(ne/(1-loss)))
 return dict(nCon=int(nc),nExp=int(ne),total=int(nc+ne),initialTotal=initial,pCon=float(pc),pExp=float(pe),hr=float(hr),power=float(power),expectedEvents=float(nc*pc+ne*pe),roundingIterations=iterations,sourceSizes=sourceSizes,sourcePowerAtSourceSizes=sourcePower)
cases=[]
for hr in [.3,.5,2/3,.8,1.25,1.5,2,3]:
 for ratio in [.5,1,2]:
  s={**BASE,'survEffect':'hr','survHR':str(hr),'survRatio':str(ratio),'survApprox':'freedman' if ratio==1 else 'schoenfeld'};cases.append(dict(id=f'hr-{hr}-ratio-{ratio}',inputs=s,expected=reference(s)))
for patch in [dict(survEntry='96'),dict(survEntry='240',survFollow='24'),dict(survFollow='12'),dict(power='90'),dict(alpha='1'),dict(comparisons='3'),dict(loss='10'),dict(survMedianCon='480',survMedianExp='720',survFollow='1680'),dict(survEffect='hr',survHR='.99')]:
 s={**BASE,**patch};cases.append(dict(id='variant-'+str(len(cases)),inputs=s,expected=reference(s)))
for hr in [.5,.8,1.5]:
 for ratio in [.5,1,2]:
  s={**BASE,'survApprox':'schoenfeld','survEffect':'hr','survHR':str(hr),'survRatio':str(ratio)};cases.append(dict(id=f'schoenfeld-{hr}-{ratio}',inputs=s,expected=reference(s)))
if __name__=='__main__':
 Path(__file__).with_name('survival-reference.json').write_text(json.dumps(dict(reference=f'lifelines 0.30.0 original functions, SciPy {scipy.__version__}, quad for administrative event probability',cases=cases),indent=2));print(len(cases),'reference cases')
