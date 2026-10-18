"""Independent SciPy reference; each Fisher matrix uses intercept/slope coordinates.
Variance of log ratio is the delta-method quadratic form of the block-diagonal information.
Run: python tests/generate-dose-comparison-reference.py
"""
from pathlib import Path
import json, math
import numpy as np
import scipy
from scipy.stats import norm, betabinom
BASE=dict(lcAssumption='zero',lcLink='logit',lcTime='72 h',lcUnit='container',lcM='10',lcICC='0.05',lcC1='1',lcC2='4',lcP1='20',lcP2='80',lcDoses='0.5;1;2;4;8',lcPrecision='20',lcControl='yes',confidence='95',loss='0')
def reference(s):
 inv=norm.ppf if s['lcLink']=='probit' else lambda p:np.log(p/(1-p))
 c1,c2,p1,p2=map(float,[s['lcC1'],s['lcC2'],s['lcP1'],s['lcP2']]);p1/=100;p2/=100
 slope=(inv(p2)-inv(p1))/np.log(c2/c1);intercept=inv(p1)-slope*np.log(c1);theta=-intercept/slope
 doses=np.array([float(v) for v in s['lcDoses'].split(';')]);x=np.log(doses);eta=intercept+slope*x
 prob=norm.cdf(eta) if s['lcLink']=='probit' else 1/(1+np.exp(-eta));der=norm.pdf(eta) if s['lcLink']=='probit' else prob*(1-prob)
 m=1 if s['lcUnit']=='individual' else int(s['lcM']);rho=0 if m==1 else float(s['lcICC']);weights=[]
 for p,g in zip(prob,der):
  if not rho:info=m/(p*(1-p))
  else:
   k=np.arange(m+1);t=1/rho-1;h=1e-4*min(p,1-p)
   def lp(q):return betabinom.logpmf(k,m,q*t,(1-q)*t)
   score=(lp(p-2*h)-8*lp(p-h)+8*lp(p+h)-lp(p+2*h))/(12*h)
   info=np.sum(betabinom.pmf(k,m,p*t,(1-p)*t)*score**2)
  weights.append(info*g*g)
 X=np.c_[np.ones(len(x)),x];information=X.T@np.diag(weights)@X
 gradient=np.array([-1/slope,intercept/slope**2]);variance=float(gradient@np.linalg.inv(information)@gradient)
 z=norm.ppf((1+float(s['confidence'])/100)/2);h=np.log1p(float(s['lcPrecision'])/100)
 raw=z*z*variance/h**2;r=math.ceil(raw);groups=len(doses)+(s['lcControl']=='yes');initial=math.ceil(r/(1-float(s['loss'])/100));factor=float(np.exp(z*np.sqrt(variance/r)))
 return dict(n=r,total=r*groups,initialTotal=initial*groups,lc50=float(np.exp(theta)),slope=float(slope),varianceOne=variance,factor=factor,plannedInterval=[float(np.exp(theta)/factor),float(np.exp(theta)*factor)],probabilities=prob.tolist(),raw=float(raw))

BASE.update(lcCompareStructure='independent',lcCompareAllocation='1',lc2C1='1.25',lc2C2='5',lc2P1='20',lc2P2='80',lc2Doses='0.625;1.25;2.5;5;10',lc2M='10',lc2ICC='.05',alpha='5',power='80',comparisons='1',sides='two')
def compare(s):
 a=reference(s)
 t={**s,**{k:s['lc2'+k[2:]] for k in ['lcC1','lcC2','lcP1','lcP2','lcDoses','lcM','lcICC']}}
 b=reference(t);v1=a['varianceOne'];v2=b['varianceOne'];logratio=math.log(b['lc50']/a['lc50']);alloc=float(s['lcCompareAllocation']);alpha=float(s['alpha'])/100/float(s['comparisons']);z=norm.ppf(1-alpha/2)
 def power(n):
  d=abs(logratio)/math.sqrt(v1/n+v2/math.ceil(alloc*n));return float(norm.cdf(d-z)+norm.cdf(-d-z))
 lo=2;hi=2;target=float(s['power'])/100
 while power(hi)<target:hi*=2
 while lo<hi:
  mid=(lo+hi)//2
  if power(mid)>=target:hi=mid
  else:lo=mid+1
 n1=lo;n2=math.ceil(alloc*n1);g1=len(s['lcDoses'].split(';'))+(s['lcControl']=='yes');g2=len(s['lc2Doses'].split(';'))+(s['lcControl']=='yes');loss=float(s['loss'])/100
 factor=math.exp(z*math.sqrt(v1/n1+v2/n2));ratio=math.exp(logratio)
 return dict(n=n1,n2=n2,total=n1*g1+n2*g2,initialTotal=math.ceil(n1/(1-loss))*g1+math.ceil(n2/(1-loss))*g2,power=power(n1),ratio=ratio,ratioInterval=[ratio/factor,ratio*factor],v1=v1,v2=v2)
cases=[]
for link in ['logit','probit']:
 for unit in ['individual','container']:
  for allocation in ['.5','1','2']:
   for patch in [{},{'lc2P1':'10','lc2P2':'85','lc2ICC':'.2','lc2M':'20'},{'power':'95','comparisons':'3','loss':'10'}]:
    s={**BASE,'lcLink':link,'lcUnit':unit,'lcCompareAllocation':allocation,**patch};cases.append(dict(id=str(len(cases)),inputs=s,expected=compare(s)))
for patch in [dict(lc2C1='1.05',lc2C2='4.2',lc2Doses='.525;1.05;2.1;4.2;8.4'),dict(lc2C1='.8',lc2C2='3.2',lc2Doses='.4;.8;1.6;3.2;6.4'),dict(lcControl='no',loss='20'),dict(lc2Doses='.625;1.25;2.5;5;10;20')]:
 s={**BASE,**patch};cases.append(dict(id=str(len(cases)),inputs=s,expected=compare(s)))
Path(__file__).with_name('dose-comparison-reference.json').write_text(json.dumps(dict(reference=f'SciPy {scipy.__version__}; independent Fisher/delta/normal power',cases=cases),indent=2))
print(len(cases),'cases')
