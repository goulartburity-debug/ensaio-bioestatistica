"""Independent finite-difference Fisher information from SciPy life distributions."""
from pathlib import Path
import json,math
import numpy as np
import scipy
from scipy.stats import norm,lognorm,fisk
BASE=dict(ltUnit='individual',ltModel='lognormal',ltFollow='cohort',ltT1='24',ltT2='96',ltP1='20',ltP2='80',ltTimes='24;48;72;96;120;144;168',ltPrecision='20',ltTimeUnit='horas',confidence='95',loss='0')
def reference(s):
 inv=norm.ppf if s['ltModel']=='lognormal' else lambda p:np.log(p/(1-p))
 t1,t2,p1,p2=map(float,[s['ltT1'],s['ltT2'],s['ltP1'],s['ltP2']]);p1/=100;p2/=100
 beta=(inv(p2)-inv(p1))/np.log(t2/t1);mu=np.log(t1)-inv(p1)/beta;times=np.array([float(t) for t in s['ltTimes'].split(';')]);shape=np.log(1/beta) if s['ltModel']=='lognormal' else np.log(beta)
 def probs(par):
  dist=lognorm(s=np.exp(par[1]),scale=np.exp(par[0])) if s['ltModel']=='lognormal' else fisk(c=np.exp(par[1]),scale=np.exp(par[0]))
  F=dist.cdf(times);return np.r_[F[0],np.diff(F),dist.sf(times[-1])]
 par=np.array([mu,shape]);q=probs(par);J=[];h=1e-4
 for i in range(2):
  delta=np.zeros(2);delta[i]=h;J.append((probs(par-2*delta)-8*probs(par-delta)+8*probs(par+delta)-probs(par+2*delta))/(12*h))
 J=np.array(J).T;I=J.T@np.diag(1/q)@J;v=np.linalg.inv(I)[0,0];z=norm.ppf((1+float(s['confidence'])/100)/2);raw=z*z*v/np.log1p(float(s['ltPrecision'])/100)**2;n=max(2,math.ceil(raw));initial=math.ceil(n/(1-float(s['loss'])/100));factor=np.exp(z*np.sqrt(v/n));median=np.exp(mu)
 return dict(n=n,initialTotal=initial,varianceOne=float(v),beta=float(beta),lt50=float(median),factor=float(factor),plannedInterval=[float(median/factor),float(median*factor)],probabilities=q.tolist(),expectedEvents=float(n*(1-q[-1])),expectedSurvivors=float(n*q[-1]),raw=float(raw))
cases=[]
for model in ['lognormal','loglogistic']:
 for times in ['24;72;168','24;48;72;96;120;144;168','12;24;36;48;60;72;84;96;108;120;132;144;156;168']:
  for precision in [10,20,40]:
   s={**BASE,'ltModel':model,'ltTimes':times,'ltPrecision':str(precision)};cases.append(dict(id=f'{model}-{len(times.split(";"))}-{precision}',inputs=s,expected=reference(s)))
for patch in [dict(confidence='99'),dict(loss='10'),dict(ltP1='10',ltP2='70'),dict(ltTimes='24;48;72;96'),dict(ltTimes='24;48;72;96;120;144;168;192;216;240'),dict(ltT1='240',ltT2='960',ltTimes='240;480;720;960;1200;1440;1680')]:
 s={**BASE,**patch};cases.append(dict(id='variant-'+str(len(cases)),inputs=s,expected=reference(s)))
if __name__=='__main__':
 Path(__file__).with_name('lifetime-reference.json').write_text(json.dumps(dict(reference=f'SciPy {scipy.__version__}: lognorm/fisk, five-point finite differences, location/log-scale coordinates',cases=cases),indent=2));print(len(cases),'reference cases')
