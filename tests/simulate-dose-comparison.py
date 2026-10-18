"""Finite-sample diagnostic, not used by calculator. SciPy fits two separate curves.
Nonconvergent fits count as failures/nonrejections in unconditional power.
"""
from pathlib import Path
import json, math
import numpy as np
from scipy.stats import norm,betabinom
from scipy.special import expit,digamma
from scipy.optimize import minimize
ns={};exec(Path(__file__).with_name('generate-dose-comparison-reference.py').read_text().split('cases=[]')[0],ns)
rng=np.random.default_rng(20261018);B=600;rows=[]
for link,unit,allocation in [('logit','individual','1'),('probit','individual','2'),('logit','container','1'),('probit','container','.5')]:
 s={**ns['BASE'],'lcLink':link,'lcUnit':unit,'lcCompareAllocation':allocation};ref=ns['compare'](s);curves=[]
 for second in [False,True]:
  t={**s,**({k:s['lc2'+k[2:]] for k in ['lcC1','lcC2','lcP1','lcP2','lcDoses','lcM','lcICC']} if second else {})};r=ref['n2'] if second else ref['n'];one=ns['reference'](t);x=np.log([float(v) for v in t['lcDoses'].split(';')]);m=1 if unit=='individual' else int(t['lcM']);rho=0 if m==1 else float(t['lcICC']);b=one['slope'];truth=np.array([-b*np.log(one['lc50']),b]);eta=truth[0]+b*x;p=norm.cdf(eta) if link=='probit' else expit(eta);curves.append((x,m,rho,r,truth,p))
 reject=failed=0
 for iteration in range(B):
  estimates=[]
  for x,m,rho,r,truth,p in curves:
   if rho:
    tau=1/rho-1;q=rng.beta(p[:,None]*tau,(1-p[:,None])*tau,size=(len(x),r));y=rng.binomial(m,q)
   else:y=rng.binomial(m,p[:,None],size=(len(x),r))
   def model(par):
    eta=par[0]+par[1]*x;mu=np.clip(norm.cdf(eta) if link=='probit' else expit(eta),1e-9,1-1e-9);der=norm.pdf(eta) if link=='probit' else mu*(1-mu);return mu,der
   def objective(par):
    if par[1]<=0:return 1e20
    mu,_=model(par)
    if rho:return -np.sum(betabinom.logpmf(y,m,mu[:,None]*tau,(1-mu[:,None])*tau))
    return -np.sum(y*np.log(mu[:,None])+(m-y)*np.log1p(-mu[:,None]))
   fit=minimize(objective,truth,method='Nelder-Mead',options={'maxiter':1500,'xatol':1e-7,'fatol':1e-7})
   if not fit.success or fit.x[1]<1e-5:break
   a,b=fit.x;mu,der=model(fit.x);ww=[]
   for pp,dd in zip(mu,der):
    if rho:
     k=np.arange(m+1);aa,bb=pp*tau,(1-pp)*tau;score=tau*(digamma(k+aa)-digamma(aa)-digamma(m-k+bb)+digamma(bb));info=np.sum(betabinom.pmf(k,m,aa,bb)*score**2)
    else:info=m/(pp*(1-pp))
    ww.append(r*info*dd**2)
   X=np.c_[np.ones(len(x)),x];I=X.T@np.diag(ww)@X;g=np.array([-1/b,a/b**2])
   try:v=float(g@np.linalg.inv(I)@g)
   except np.linalg.LinAlgError:break
   if not np.isfinite(v) or v<=0:break
   estimates.append((-a/b,v))
  if len(estimates)!=2:failed+=1;continue
  z=abs(estimates[1][0]-estimates[0][0])/math.sqrt(estimates[0][1]+estimates[1][1]);reject+=int(z>norm.ppf(.975))
 observed=reject/B;rows.append(dict(link=link,unit=unit,allocation=allocation,replications=B,n1=ref['n'],n2=ref['n2'],plannedPower=ref['power'],rejections=reject,fitFailures=failed,unconditionalPower=observed,mcStandardError=math.sqrt(observed*(1-observed)/B)))
Path(__file__).with_name('dose-comparison-simulation.json').write_text(json.dumps(dict(seed=20261018,note='Known ICC; illustrative Wald finite-sample diagnostic, failures counted as nonrejections; not a guarantee.',cases=rows),indent=2));print(json.dumps(rows,indent=2))
