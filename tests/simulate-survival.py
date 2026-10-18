"""Raw exponential lifetimes and entry times; independent two-sided log-rank diagnostic."""
from pathlib import Path
import json,importlib.util
import numpy as np
import scipy
from scipy.stats import chi2
spec=importlib.util.spec_from_file_location('ref',Path(__file__).with_name('generate-survival-reference.py'));mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
rng=np.random.default_rng(20261018);B=6000;rows=[]
for patch in [{},{'survRatio':'2'},{'survEntry':'96'},{'survMedianExp':'96'}]:
 s={**mod.BASE,**patch};s['survApprox']='schoenfeld' if s['survRatio']!='1' else 'freedman';r=mod.reference(s);nc,ne=r['nCon'],r['nExp'];rate=np.log(2)/float(s['survMedianCon']);entry=float(s['survEntry']);follow=float(s['survFollow']);groups=np.r_[np.zeros(nc),np.ones(ne)];rejections=0;eventcounts=[]
 for _ in range(B):
  birth=rng.uniform(0,entry,size=nc+ne);T=rng.exponential(1/(rate*np.where(groups==0,1,r['hr'])));C=entry+follow-birth;events=T<=C;obs=np.minimum(T,C);order=np.argsort(obs,kind='stable');g=groups[order];ev=events[order];risk=np.arange(nc+ne,0,-1);risk2=np.cumsum(g[::-1])[::-1];fraction=risk2/risk
  score=np.sum((g-fraction)[ev]);variance=np.sum((fraction*(1-fraction))[ev]);pvalue=chi2.sf(score*score/variance,1) if variance>0 else 1
  rejections+=pvalue<float(s['alpha'])/100/int(s['comparisons']);eventcounts.append(int(events.sum()))
 power=rejections/B;rows.append(dict(inputs={**patch,'survApprox':s['survApprox']},nCon=nc,nExp=ne,replications=B,nominalPower=float(s['power'])/100,approxPower=r['power'],simulatedLogrankPower=power,mcStandardError=float(np.sqrt(power*(1-power)/B)),meanEvents=float(np.mean(eventcounts)),expectedEvents=r['expectedEvents']))
Path(__file__).with_name('survival-simulation.json').write_text(json.dumps(dict(seed=20261018,software='NumPy/SciPy '+scipy.__version__,note='Diagnostic under exponential proportional hazards; not a guarantee for all settings.',cases=rows),indent=2));print(json.dumps(rows,indent=2))
