"""Reproduce expected values independently with SciPy 1.17.0 (not required in browser).
Run: python3 tests/generate-reference.py. Outputs are committed as fixtures.
Normal planning equations: Cochran (1977), Rosner (2000), Fleiss (1981),
Fisher z. Normal fixed-model power: noncentral F / paired noncentral t.
"""
import math,json
from pathlib import Path
import scipy
from scipy.stats import norm,f,ncf,t,nct

def solve(fn,target,start=2):
 lo=hi=start
 if fn(hi)>=target:return hi
 while fn(hi)<target:
  lo=hi+1;hi*=2
  if hi>2000000:raise ValueError('No solution in fixture generator')
 while lo<hi:
  mid=(lo+hi)//2
  if fn(mid)>=target:hi=mid
  else:lo=mid+1
 return hi

def ref(s):
 m=s['method'];loss=float(s.get('loss',0))/100
 alpha=float(s.get('alpha',5))/100/float(s.get('comparisons',1));power=float(s.get('power',80))/100
 side=s.get('sides','two');za=norm.isf(alpha/(2 if side=='two' else 1));zb=norm.ppf(power)
 z=norm.ppf((1+float(s.get('confidence',95))/100)/2);fcn=None
 if m in ['mean','proportion','cluster']:
  margin=float(s['margin'])
  if m=='mean':raw=z*z*float(s['sd'])**2/margin**2
  else:
   p=float(s['p'])/100;raw=z*z*p*(1-p)/(margin/100)**2
  if s.get('population')=='finite':
   pop=float(s['populationN']);raw=pop*raw/(pop-1+raw)
  if m=='cluster':
   size=int(s['clusterSize']);deff=1+(size-1)*float(s['icc']);n=max(2,math.ceil(raw*deff/size));units=[n];total=n*size;mult=size
  else:n=max(2,math.ceil(raw));units=[n];total=n;mult=1
 elif m=='means':
  d=float(s.get('delta',s.get('d')));sd1=float(s.get('sd1',1));sd2=float(s.get('sd2',1));ratio=float(s.get('ratio',1))
  n=max(2,math.ceil((sd1**2+sd2**2/ratio)*(za+zb)**2/d**2));units=[n,max(2,math.ceil(n*ratio))];total=sum(units);mult=1
 elif m=='proportions':
  p1=float(s['p1'])/100;p2=float(s['p2'])/100;ratio=float(s.get('ratio',1));pooled=(p1+ratio*p2)/(1+ratio)
  raw=(za*math.sqrt((1+ratio)*pooled*(1-pooled))+zb*math.sqrt(ratio*p1*(1-p1)+p2*(1-p2)))**2/(ratio*(p1-p2)**2)
  n=math.ceil(raw);units=[n,math.ceil(raw*ratio)];total=sum(units);mult=1
 elif m=='paired':
  if s.get('scale')=='standard':d=abs(float(s['d']))
  else:
   if s.get('pairScale')=='correlation':
    s1=float(s['sd1']);s2=float(s['sd2']);sd=math.sqrt(s1*s1+s2*s2-2*float(s['rho'])*s1*s2)
   else:sd=float(s['sd'])
   d=abs(float(s['delta']))/sd
  def fcn(n):
   crit=t.isf(alpha/(2 if side=='two' else 1),n-1);nc=math.sqrt(n)*d
   return nct.sf(crit,n-1,nc)+(nct.cdf(-crit,n-1,nc) if side=='two' else 0)
  n=solve(fcn,power);units=[n];total=n;mult=1
 elif m in ['anova','factorial','blocks']:
  if m=='factorial':
   a=int(s['a']);b=int(s['b']);k=a*b;effect=s.get('effect','AB');df1=a-1 if effect=='A' else b-1 if effect=='B' else (a-1)*(b-1)
  else:k=int(s['groups']);df1=k-1
  if s.get('scale')=='standard':effect_f=float(s['f'])
  else:
   import numpy as np
   means=np.array([float(x.strip()) for x in s['means'].split(';')]);center=means-means.mean()
   if m=='factorial':
    mat=means.reshape(a,b)
    if effect=='A':center=np.broadcast_to(mat.mean(axis=1)[:,None]-mat.mean(),(a,b))
    elif effect=='B':center=np.broadcast_to(mat.mean(axis=0)[None,:]-mat.mean(),(a,b))
    else:center=mat-mat.mean(axis=1)[:,None]-mat.mean(axis=0)[None,:]+mat.mean()
   effect_f=math.sqrt(float(np.mean(center**2)))/float(s['sd'])
  def fcn(n):
   df2=(k-1)*(n-1) if m=='blocks' else k*(n-1)
   return ncf.sf(f.isf(alpha,df1,df2),df1,df2,k*n*effect_f**2)
  n=solve(fcn,power);units=[n];total=k*n;mult=k
 elif m=='correlation':
  n=max(4,math.ceil(3+((za+zb)/math.atanh(abs(float(s['r']))))**2));units=[n];total=n;mult=1
 elif m=='regression':
  p=int(s['predictors']);q=int(s['tested']);f2=float(s['f2']) if s.get('effectMode')=='f2' else (float(s['r2full'])-float(s['r2reduced']))/(1-float(s['r2full']))
  fcn=lambda n:ncf.sf(f.isf(alpha,q,n-p-1),q,n-p-1,n*f2)
  n=solve(fcn,power,p+3);units=[n];total=n;mult=1
 return {'n':n,'units':units,'total':total,'initialTotal':sum(math.ceil(x/(1-loss)) for x in units)*mult,'power':float(fcn(n)) if fcn else None}
CASES=[
 {'method':'mean','sd':'8','margin':'2'},
 {'method':'mean','sd':'8','margin':'0.01','confidence':'99'},
 {'method':'mean','sd':'8','margin':'2','population':'finite','populationN':'500','loss':'10'},
 {'method':'proportion','p':'50','margin':'5'},
 {'method':'proportion','p':'1','margin':'0.2'},
 {'method':'proportion','p':'99','margin':'0.2'},
 {'method':'proportion','p':'50','margin':'5','population':'finite','populationN':'1000'},
 {'method':'means','delta':'5.42','sd1':'15.34','sd2':'18.23'},
 {'method':'means','delta':'5','sd1':'8','sd2':'8','ratio':'2.3','loss':'12'},
 {'method':'means','delta':'-5','sd1':'8','sd2':'12','ratio':'0.5','sides':'less'},
 {'method':'means','delta':'0.1','sd1':'8','sd2':'8'},
 {'method':'means','scale':'standard','d':'0.5','comparisons':'3'},
 {'method':'paired','delta':'5','sd':'8'},
 {'method':'paired','delta':'5','pairScale':'correlation','sd1':'8','sd2':'10','rho':'0.6','loss':'15'},
 {'method':'paired','scale':'standard','d':'0.02'},
 {'method':'paired','scale':'standard','d':'-0.5','sides':'less'},
 {'method':'proportions','p1':'60','p2':'75'},
 {'method':'proportions','p1':'2','p2':'4','ratio':'2'},
 {'method':'proportions','p1':'98','p2':'96','ratio':'0.5','sides':'less'},
 {'method':'anova','groups':'3','means':'10;12;15','sd':'8'},
 {'method':'anova','groups':'5','scale':'standard','f':'0.1','loss':'10'},
 {'method':'factorial','a':'2','b':'3','means':'10;12;14;10;14;18','sd':'4','effect':'AB'},
 {'method':'factorial','a':'2','b':'3','means':'10;12;14;10;14;18','sd':'4','effect':'A'},
 {'method':'factorial','a':'2','b':'3','means':'10;12;14;10;14;18','sd':'4','effect':'B','comparisons':'3'},
 {'method':'blocks','groups':'3','means':'10;12;15','sd':'4','loss':'10'},
 {'method':'blocks','groups':'2','scale':'standard','f':'0.3'},
 {'method':'correlation','r':'0.3'},
 {'method':'correlation','r':'-0.1','sides':'less'},
 {'method':'regression','predictors':'3','tested':'2','r2full':'0.25','r2reduced':'0.1'},
 {'method':'regression','predictors':'5','tested':'5','effectMode':'f2','f2':'0.02'},
 {'method':'cluster','p':'50','margin':'5','clusterSize':'20','icc':'0.05','loss':'10'},
 {'method':'cluster','p':'10','margin':'2','clusterSize':'10','icc':'0'},
]
Path(__file__).with_name('sample-reference.json').write_text(json.dumps({'reference':f'SciPy {scipy.__version__}; independent Python reference equations','cases':[{'input':s,'expected':ref(s)} for s in CASES]},indent=2))
print(f'{len(CASES)} reference sample sizes generated.')
