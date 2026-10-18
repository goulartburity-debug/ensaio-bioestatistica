"""SciPy reference for Gangnon & Kosorok (2004), whole-cluster special case.
Closed-form required clusters, independent of JS integer search.
"""
from pathlib import Path
import math,json,scipy
from scipy.stats import norm
BASE=dict(csStructure='whole',csObservation='exact',csPH='yes',csCorrelation='martingale',csM='10',csRho='.1',csMedian1='48',csMedian2='72',csFollow='168',csTimeUnit='horas',alpha='5',comparisons='1',power='80',loss='0',sides='two')
def reference(s):
 m=int(s['csM']);rho=float(s['csRho']);t=float(s['csFollow']);hr=float(s['csMedian1'])/float(s['csMedian2']);p1=-math.expm1(-math.log(2)*t/float(s['csMedian1']));p2=-math.expm1(-math.log(2)*t/float(s['csMedian2']));D=(p1+p2)/2;deff=1+(m-1)*rho;alpha=float(s['alpha'])/100/int(s['comparisons']);za=norm.ppf(1-alpha/2);zb=norm.ppf(float(s['power'])/100)
 events=4*deff*(za+zb)**2/math.log(hr)**2;raw=events/(2*m*D);k=max(2,math.ceil(raw));initial=math.ceil(k/(1-float(s['loss'])/100));power=norm.cdf(math.sqrt(2*k*m*D/(4*deff))*abs(math.log(hr))-za)
 return dict(n=k,total=2*k,initialTotal=2*initial,individuals=2*k*m,initialIndividuals=2*initial*m,deff=deff,p1=p1,p2=p2,pooled=D,eventTarget=events,expectedEvents=2*k*m*D,power=float(power),raw=raw)
if __name__=='__main__':
 cases=[]
 for m in [2,10,100]:
  for rho in [.001,.1,.5]:
   for patch in [{},{'csMedian2':'49'},{'power':'95','comparisons':'3','loss':'10'},{'csFollow':'24'}]:
    s={**BASE,'csM':str(m),'csRho':str(rho),**patch};cases.append(dict(id=str(len(cases)),inputs=s,expected=reference(s)))
 for patch in [dict(csMedian2='24'),dict(csMedian2='96'),dict(csMedian1='480',csMedian2='720',csFollow='1680'),dict(alpha='.1',power='99.9'),dict(csFollow='100000'),dict(loss='90')]:
  s={**BASE,**patch};cases.append(dict(id=str(len(cases)),inputs=s,expected=reference(s)))
 Path(__file__).with_name('cluster-survival-reference.json').write_text(json.dumps(dict(reference='SciPy '+scipy.__version__+'; Gangnon-Kosorok section 4; closed-form ceiling vs JS integer search',cases=cases),indent=2));print(len(cases),'cases')
