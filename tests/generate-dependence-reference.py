"""Independent NumPy/SciPy matrix projections and raw-data simulation.
No Ensaio/JavaScript numerical code is imported. SciPy 1.17.0.
"""
from pathlib import Path
import json
import numpy as np
import scipy
from scipy.linalg import helmert
from scipy.stats import f,ncf
BASE=Path(__file__).resolve().parent

def num(s,k,default=None):return float(str(s.get(k,default)).replace(',','.'))
def covariance(s):
 t=int(s['rmOccasions']);rho=num(s,'rho');var=num(s,'sd')**2
 return var*np.array([[1 if i==j else rho if s['rmCovariance']=='cs' else rho**abs(i-j) for j in range(t)] for i in range(t)])
def components(s,n):
 if s['method']=='clusterTrial':
  g=int(s['groups']);m=int(s['clusterSize']);icc=num(s,'icc');var=num(s,'sd')**2
  mu=np.array([0,num(s,'delta')]) if g==2 else np.array([float(x.replace(',','.')) for x in s['means'].split(';')])
  # Cluster mean variance from a full m-by-m random-intercept covariance.
  v=var*(icc+(1-icc)/m)
  return g-1,g*(n-1),float(n*np.square(mu-mu.mean()).sum()/v)
 g=int(s['rmGroups']);t=int(s['rmOccasions']);mu=np.array([float(x.replace(',','.')) for x in s['means'].split(';')]).reshape(g,t);cov=covariance(s)
 if s['rmEffect']=='contrast':
  c=np.array([-1]+[0]*(t-2)+[1]) if s.get('rmContrast','first-last')=='first-last' else np.array([float(x.replace(',','.')) for x in s['rmWeights'].split(';')])
  effects=mu@c;v=c@cov@c;signal=effects[0]**2 if g==1 else np.square(effects-effects.mean()).sum()
  return (1,n-1,float(n*signal/v)) if g==1 else (g-1,g*(n-1),float(n*signal/v))
 if s['rmEffect']=='group':
  c=np.ones(t)/t;effects=mu@c;v=c@cov@c
  return g-1,g*(n-1),float(n*np.square(effects-effects.mean()).sum()/v)
 h=helmert(t,full=False);projected=mu@h.T;v=h@cov@h.T;scale=np.trace(v)/(t-1)
 assert np.allclose(v,np.eye(t-1)*scale)
 if s['rmEffect']=='time':return t-1,g*(n-1)*(t-1),float(g*n*np.square(projected.mean(0)).sum()/scale)
 return (g-1)*(t-1),g*(n-1)*(t-1),float(n*np.square(projected-projected.mean(0)).sum()/scale)
def power_at(s,n):
 d1,d2,lam=components(s,n);alpha=num(s,'alpha','5')/100/num(s,'comparisons','1')
 return float(ncf.sf(f.isf(alpha,d1,d2),d1,d2,lam)) if lam>0 else alpha
rm=dict(method='repeated',rmGroups='2',rmOccasions='3',rmCovariance='cs',rmEffect='interaction',means='10;12;14;10;14;18',sd='4',rho='0.6')
cl=dict(method='clusterTrial',groups='2',clusterAllocation='group',delta='5',sd='8',clusterSize='10',icc='0.05')
cases=[]
def add(name,s,**patch):cases.append((name,{**s,**patch}))
for effect in ['group','time','interaction']:
 add('repeated-'+effect,rm,rmEffect=effect)
 add('Stata-'+effect,rm,rmEffect=effect,means='145;135;130;145;130;120',sd='15',rho='0.7')
add('Stata-oneGroup',rm,rmGroups='1',rmEffect='time',means='26.4;25.6;21',sd=str(np.sqrt(77)))
add('oneGroup-negativeCorrelation',rm,rmGroups='1',rmEffect='time',means='10;11;12',rho='-0.4')
add('repeated-loss',rm,loss='15')
add('repeated-power90',rm,power='90')
add('repeated-alpha1',rm,alpha='1')
add('repeated-bonferroni',rm,comparisons='3')
add('repeated-smallEffect',rm,means='10;12;14;10;12.5;15')
add('repeated-fourOccasions',rm,rmOccasions='4',means='10;11;12;13;10;12;14;16',rho='0.5')
add('repeated-threeGroups',rm,rmGroups='3',means='10;12;14;10;14;18;10;11;12',rmEffect='interaction')
for cov in ['cs','ar1']:
 add(cov+'-contrast-oneGroup',rm,rmCovariance=cov,rmEffect='contrast',rmGroups='1',means='10;12;14')
 add(cov+'-contrast-twoGroups',rm,rmCovariance=cov,rmEffect='contrast')
 add(cov+'-contrast-custom',rm,rmCovariance=cov,rmEffect='contrast',rmContrast='custom',rmWeights='-0.5;-0.5;1')
add('ar1-negativeCorrelation',rm,rmCovariance='ar1',rmEffect='contrast',rho='-0.5')
add('repeated-minTwo',rm,rmGroups='1',rmEffect='time',means='0;5;10',sd='1',rho='0.5')
for name,patch in [('usual',{}),('ICC-zero',{'icc':'0'}),('ICC-high',{'icc':'0.5'}),('power90',{'power':'90'}),('alpha1',{'alpha':'1'}),('moreIndividuals',{'clusterSize':'50'}),('losses',{'loss':'10','withinLoss':'20'}),('smallEffect',{'delta':'1'}),('minTwo',{'delta':'20'})]:add('cluster-'+name,cl,**patch)
add('cluster-threeGroups',cl,groups='3',means='10;12;15')
add('cluster-tenGroups',cl,groups='10',means='10;11;12;13;14;15;16;17;18;19')
fixtures=[]
for name,s in cases:
 n=next(i for i in range(2,100000) if power_at(s,i)>=num(s,'power','80')/100)
 initial=int(np.ceil(n/(1-num(s,'loss','0')/100)))
 g=int(s.get('rmGroups',s.get('groups','1')));iscl=s['method']=='clusterTrial'
 m=int(s['clusterSize']) if iscl else 1;mi=int(np.ceil(m/(1-num(s,'withinLoss','0')/100))) if iscl else 1
 d1,d2,lam=components(s,n)
 fixtures.append(dict(name=name,inputs=s,n=n,total=g*n*m,initial=initial,initialTotal=g*initial*mi,df1=d1,df2=d2,ncp=lam,power=power_at(s,n),previousPower=power_at(s,n-1) if n>2 else None))
# Actual Gaussian observations, reduced to observed ANOVA/contrast statistics.
rng=np.random.default_rng(20261016);draws=100000;checks=[]
for covarianceType in ['cs','ar1']:
 for null in [True,False]:
  g,n,t=2,8,3;s={**rm,'rmCovariance':covarianceType};mu=np.zeros((g,t)) if null else np.array([[10,12,14],[10,14,18]])
  cov=covariance(s);y=rng.multivariate_normal(np.zeros(t),cov,size=(draws,g,n))+mu[None,:,None,:]
  byUnit=y.mean(3);byGroup=y.mean((2,3));byDateGroup=y.mean(2);byDate=y.mean((1,2));grand=y.mean((1,2,3))
  if covarianceType=='cs':
   ssewithin=np.square(y-byUnit[:,:,:,None]-byDateGroup[:,:,None,:]+byGroup[:,:,None,None]).sum((1,2,3))
   numerators={'group':n*np.square(byGroup-grand[:,None]).sum(1),'time':g*n*np.square(byDate-grand[:,None]).sum(1),'interaction':n*np.square(byDateGroup-byGroup[:,:,None]-byDate[:,None,:]+grand[:,None,None]).sum((1,2))}
   for effect in ['group','time','interaction']:
    se={**s,'rmEffect':effect};d1,d2,_=components(se,n)
    denominator=np.square(byUnit-byGroup[:,:,None]).sum((1,2)) if effect=='group' else ssewithin
    expected=.05 if null else power_at(se,n);observed=float(((numerators[effect]/d1)/(denominator/d2)>f.isf(.05,d1,d2)).mean());se_mc=float(np.sqrt(expected*(1-expected)/draws));assert abs(observed-expected)<4*se_mc+1/draws
    checks.append(dict(model='repeated-cs',effect=effect,null=null,expected=expected,observed=observed,mcse=se_mc))
  c=np.array([-1,0,1]);z=y@c;by=z.mean(2);gr=z.mean((1,2));numerator=n*np.square(by-gr[:,None]).sum(1);denominator=np.square(z-by[:,:,None]).sum((1,2));se={**s,'rmEffect':'contrast'};d1,d2,_=components(se,n)
  expected=.05 if null else power_at(se,n);observed=float(((numerator/d1)/(denominator/d2)>f.isf(.05,d1,d2)).mean());se_mc=float(np.sqrt(expected*(1-expected)/draws));assert abs(observed-expected)<4*se_mc+1/draws
  checks.append(dict(model='repeated-'+covarianceType,effect='contrast',null=null,expected=expected,observed=observed,mcse=se_mc))
for groups in [2,3]:
 for null in [True,False]:
  k,m=7,10;sd,icc=8,.05;s={**cl,'groups':str(groups),'means':'0;2;5'};mu=np.zeros(groups) if null else np.array([0,5]) if groups==2 else np.array([0,2,5])
  y=mu[None,:,None,None]+rng.normal(0,sd*np.sqrt(icc),(draws,groups,k,1))+rng.normal(0,sd*np.sqrt(1-icc),(draws,groups,k,m));z=y.mean(3);by=z.mean(2);gr=z.mean((1,2));ssn=k*np.square(by-gr[:,None]).sum(1);ssd=np.square(z-by[:,:,None]).sum((1,2));d1,d2,_=components(s,k)
  expected=.05 if null else power_at(s,k);observed=float(((ssn/d1)/(ssd/d2)>f.isf(.05,d1,d2)).mean());se_mc=float(np.sqrt(expected*(1-expected)/draws));assert abs(observed-expected)<4*se_mc+1/draws
  checks.append(dict(model='clusterTrial',groups=groups,null=null,expected=expected,observed=observed,mcse=se_mc))
output=dict(reference='SciPy '+scipy.__version__,fixtures=fixtures,simulationsPerCheck=draws,seed=20261016,simulationChecks=checks)
(BASE/'dependence-reference.json').write_text(json.dumps(output,indent=2,allow_nan=False)+'\n')
print(f'{len(fixtures)} reference sizes and {len(checks)} raw-data simulation checks passed.')
