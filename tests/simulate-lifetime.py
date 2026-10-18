"""Finite-sample diagnostic only. Run: python tests/simulate-lifetime.py"""
from pathlib import Path
import json,importlib.util
import numpy as np
from scipy.stats import norm,lognorm,fisk
from scipy.optimize import minimize
spec=importlib.util.spec_from_file_location('ref',Path(__file__).with_name('generate-lifetime-reference.py'));mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
rng=np.random.default_rng(20261018);B=400;rows=[]
for model in ['lognormal','loglogistic']:
 s={**mod.BASE,'ltModel':model};r=mod.reference(s);n=r['n'];times=np.array([float(t) for t in s['ltTimes'].split(';')]);truth=np.array([np.log(r['lt50']),np.log(1/r['beta']) if model=='lognormal' else np.log(r['beta'])]);coverage=0;failures=0;factors=[]
 def distribution(par):return lognorm(s=np.exp(par[1]),scale=np.exp(par[0])) if model=='lognormal' else fisk(c=np.exp(par[1]),scale=np.exp(par[0]))
 def probs(par):
  dist=distribution(par);F=dist.cdf(times);return np.r_[F[0],np.diff(F),dist.sf(times[-1])]
 def derivative(par):
  h=1e-4;J=[]
  for i in range(2):
   v=np.zeros(2);v[i]=h;J.append((probs(par-2*v)-8*probs(par-v)+8*probs(par+v)-probs(par+2*v))/(12*h))
  return np.array(J).T
 for _ in range(B):
  raw=distribution(truth).rvs(size=n,random_state=rng);counts=np.bincount(np.searchsorted(times,raw,side='left'),minlength=len(times)+1)
  def objective(par):
   q=probs(par)
   if np.any(q<=0):return 1e100
   return -float(counts@np.log(q))
  fit=minimize(objective,truth,method='Nelder-Mead',options={'xatol':1e-8,'fatol':1e-8,'maxiter':1500})
  if not fit.success or objective(fit.x)>objective(truth)+1e-7:failures+=1;continue
  q=probs(fit.x);J=derivative(fit.x);I=n*(J.T@np.diag(1/q)@J)
  try:variance=float(np.linalg.inv(I)[0,0])
  except np.linalg.LinAlgError:failures+=1;continue
  half=norm.ppf(.975)*np.sqrt(variance);coverage+=abs(fit.x[0]-truth[0])<=half;factors.append(float(np.exp(half)))
 proportion=coverage/B;rows.append(dict(model=model,n=n,replications=B,fitFailures=failures,coverageIncludingFailures=proportion,mcStandardError=float(np.sqrt(proportion*(1-proportion)/B)),plannedFactor=r['factor'],medianObservedFactor=float(np.median(factors))))
Path(__file__).with_name('lifetime-simulation.json').write_text(json.dumps(dict(seed=20261018,software='SciPy '+mod.scipy.__version__,note='Raw event times generated, then coarsened to inspection intervals. Illustrative diagnostic, not a coverage guarantee.',cases=rows),indent=2));print(json.dumps(rows,indent=2))
