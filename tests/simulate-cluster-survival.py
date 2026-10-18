"""Independent robust log-rank diagnostic; Clayton survival copula with exponential marginals.
Copula dependence is calibrated to H0 martingale-residual correlation, NOT raw-time ICC.
No such generator is included in browser calculation.
"""
from pathlib import Path
import json,math,importlib.util
import numpy as np
from scipy.stats import norm
from scipy.optimize import brentq
from numpy.polynomial.legendre import leggauss
spec=importlib.util.spec_from_file_location('ref',Path(__file__).with_name('generate-cluster-survival-reference.py'));ref=importlib.util.module_from_spec(spec);spec.loader.exec_module(ref)
rng=np.random.default_rng(20261019);B=4000;rows=[]
def residual_rho(theta,h):
 nodes,weights=leggauss(64);u=(nodes+1)*h/2;w=weights*h/2
 def joint(a,b):return np.exp(-np.log(np.exp(theta*a)+np.exp(theta*b)-1)/theta)
 # E[(delta - lambda min(T,C))_1 (...)_2], Var(M)=1-exp(-h).
 cov=-1+joint(h,h)+2*np.sum(w*joint(h,u))+np.sum(w[:,None]*w[None,:]*joint(u[:,None],u[None,:]))
 return float(cov/-np.expm1(-h))
def robust_logrank(T,g,cluster,follow):
 observed=np.minimum(T,follow);event=T<=follow;order=np.argsort(observed);obs=observed[order];gg=g[order];ev=event[order];cc=cluster[order];n=len(obs)
 # Continuous event times: no event ties; administrative censoring ties at end.
 risk1=np.cumsum(gg[::-1])[::-1];risk=np.arange(n,0,-1);q=risk1/risk
 w=gg-q;idx=np.flatnonzero(ev);eventT=obs[idx];wg=w[idx];U=float(wg.sum());cum=[]
 for arm in [0,1]:
  riskg=risk1[idx] if arm else risk[idx]-risk1[idx];increment=np.where(gg[idx]==arm,wg/np.maximum(1,riskg),0);cum.append(np.r_[0,np.cumsum(increment)])
 last=np.searchsorted(eventT,obs,side='right');integral=np.where(gg==1,cum[1][last],cum[0][last]);residual=ev*w-integral;clusterResidual=np.bincount(cc,weights=residual);variance=float(clusterResidual@clusterResidual)
 if variance<=0 or not np.isfinite(variance):return None
 return U/math.sqrt(variance)
for patch in [{},{'csRho':'.2'},{'csM':'2','csRho':'.2'},{'csMedian2':'96'},{'csFollow':'48'},{'csMedian2':'40'}]:
 s={**ref.BASE,**patch};r=ref.reference(s);k=r['n'];m=int(s['csM']);follow=float(s['csFollow']);D=r['pooled'];h0=-math.log1p(-D);theta=brentq(lambda t:residual_rho(t,h0)-float(s['csRho']),.0001,10);g=np.repeat([0,1],k*m);cluster=np.repeat(np.arange(2*k),m);rates=np.where(g==0,math.log(2)/float(s['csMedian1']),math.log(2)/float(s['csMedian2']));reject=nullreject=failed=0
 for _ in range(B):
  Z=np.repeat(rng.gamma(1/theta,1,size=2*k),m);E=rng.exponential(size=2*k*m);base=np.log1p(E/Z)/theta
  z=robust_logrank(base/rates,g,cluster,follow);z0=robust_logrank(base/(h0/follow),g,cluster,follow)
  if z is None or z0 is None:failed+=1;continue
  reject+=int(abs(z)>norm.ppf(.975));nullreject+=int(abs(z0)>norm.ppf(.975))
 observed=reject/B;row=dict(inputs=s,clustersPerArm=k,organismsPerCluster=m,plannedPower=r['power'],replications=B,power=observed,nullRejection=nullreject/B,mcStandardError=math.sqrt(observed*(1-observed)/B),failures=failed,copulaTheta=theta,H0ResidualCorrelation=residual_rho(theta,h0));rows.append(row);print(json.dumps(row),flush=True)
Path(__file__).with_name('cluster-survival-simulation.json').write_text(json.dumps(dict(seed=20261019,software='SciPy '+ref.scipy.__version__,note='Gangnon-Kosorok empirical group-specific martingale variance, normal critical value. Clayton survival copula calibrated to residual correlation under a common H0 exponential with event probability D. Failures count as nonrejections. Illustrative, not universal validation.',cases=rows),indent=2))
