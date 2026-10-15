"""Independent SciPy reference for Ensaio cycle 2; not used by the website.

Tukey: scipy.stats.studentized_range.ppf.
Dunnett: scipy.integrate.quad over a chi-square mixing density and
scipy.special.roots_hermitenorm/ndtr for the normal expectation.
Also checks the null probability with scipy.stats.multivariate_t.cdf,
whose randomized QMC implementation is independent of both quadratures.
Power: scipy.stats.nct.sf/cdf; factorial blocks: scipy.stats.ncf.sf.
"""
import json, math, warnings
from pathlib import Path
from functools import lru_cache
import numpy as np
import scipy
from scipy.integrate import quad
from scipy.optimize import brentq
from scipy.special import roots_hermitenorm, ndtr, gammaln
from scipy.stats import studentized_range, t, nct, f, ncf, multivariate_t

z,zw=roots_hermitenorm(180)
zw=zw/math.sqrt(2*math.pi)

def dunnett_cdf(c,k,df):
    scale=math.sqrt(2*df)
    logconst=df/2*math.log(df)-gammaln(df/2)-(df/2-1)*math.log(2)
    def integrand(y):
        s=1+y/scale
        if s<=0:return 0.
        density=math.exp(logconst+(df-1)*math.log(s)-df*s*s/2)/scale
        conditional=np.dot(zw,(ndtr(z+c*math.sqrt(2)*s)-ndtr(z-c*math.sqrt(2)*s))**(k-1))
        return density*conditional
    return quad(integrand,max(-12,-scale),12,epsabs=2e-10,epsrel=2e-10,limit=250)[0]

@lru_cache(None)
def critical(method,k,df,alpha):
    if k==2:return t.ppf(1-alpha/2,df)
    if method=='contrast':return t.ppf(1-alpha/2,df)
    if method=='tukey':return studentized_range.ppf(1-alpha,k,df)/math.sqrt(2)
    return brentq(lambda c:dunnett_cdf(c,k,df)-(1-alpha),.001,200,xtol=2e-9)

def solve(fn,target):
    lo=hi=2
    while fn(hi)<target:
        lo=hi+1;hi*=2
        if hi>500000:raise ValueError('reference search outside range')
    while lo<hi:
        mid=(lo+hi)//2
        if fn(mid)>=target:hi=mid
        else:lo=mid+1
    return lo

def reference(s):
    method=s['method'];blocked=s.get('design','independent')=='blocks'
    if method=='factorial':
        a,b=int(s['a']),int(s['b']);k=a*b
        means=np.array([float(x) for x in s['means'].split(';')]).reshape(a,b)
        dev=means-means.mean(axis=1,keepdims=True)-means.mean(axis=0,keepdims=True)+means.mean()
        effect=s.get('effect','AB')
        if effect=='A':dev=means.mean(axis=1)-means.mean()
        if effect=='B':dev=means.mean(axis=0)-means.mean()
        f2=np.mean(dev**2)/float(s['sd'])**2
        df1=(a-1)*(b-1) if effect=='AB' else a-1 if effect=='A' else b-1
        def power(n):
            df=(k-1)*(n-1) if blocked else k*(n-1)
            return ncf.sf(f.isf(float(s.get('alpha','5'))/100,df1,df),df1,df,k*n*f2)
        target=float(s.get('power','80'))/100;n=solve(power,target)
        critical_value=None
    else:
        k=int(s['groups']);alpha=float(s.get('alpha','5'))/100
        if method=='contrast':alpha/=int(s.get('comparisons','1'))
        target=float(s.get('power','80'))/100
        sd=float(s['sd']);delta=float(s['delta'])
        if s.get('differenceMode')=='percent':delta=float(s['referenceMean'])*float(s['deltaPercent'])/100
        variance_factor=2
        if method=='contrast':
            weights=s.get('weights')
            if s.get('contrastType')=='custom':weights=np.array([float(x) for x in weights.split(';')])
            elif s.get('contrastType')=='pair':
                weights=np.zeros(k);weights[int(s.get('contrastFirst','1'))-1]=-1;weights[int(s.get('contrastSecond','2'))-1]=1
            else:weights=np.r_[-1,np.repeat(1/(k-1),k-1)]
            variance_factor=np.dot(weights,weights)
        def power(n):
            df=(k-1)*(n-1) if blocked else k*(n-1)
            c=critical(method,k,df,alpha)
            nc=delta*math.sqrt(n)/(sd*math.sqrt(variance_factor))
            probability=nct.sf(c,df,nc)+nct.cdf(-c,df,nc)
            # SciPy 1.17.0 nct can return NaN in a nearly certain rejection
            # case. Use the exact t² = F(1,df,nc²) identity with Boost ncf.
            if not math.isfinite(probability):probability=ncf.sf(c*c,1,df,nc*nc)
            return probability
        n=solve(power,target)
        n=max(n,1+math.ceil(int(s.get('minResidualDf','0'))/((k-1) if blocked else k)))
        critical_value=critical(method,k,(k-1)*(n-1) if blocked else k*(n-1),alpha)
    initial=math.ceil(n/(1-float(s.get('loss','0'))/100))
    return dict(n=n,total=k*n,initial=initial,initialTotal=k*initial,power=power(n),previousPower=power(n-1) if n>2 else None,dfResidual=(k-1)*(n-1) if blocked else k*(n-1),critical=critical_value)

cases=[]
for method in ['dunnett','tukey']:
    for extra in [{},{'design':'blocks','loss':'10'},{'groups':'2'},{'groups':'6','delta':'2','sd':'5','power':'90'},{'groups':'3','delta':'12','sd':'4','alpha':'1'},{'differenceMode':'percent','referenceMean':'20','deltaPercent':'25'},{'groups':'4','delta':'20','sd':'4','minResidualDf':'15'}]:
        cases.append({'method':method,'groups':'4','delta':'5','sd':'8',**extra})
cases += [
 {'method':'contrast','groups':'3','delta':'5','sd':'8'},
 {'method':'contrast','groups':'4','delta':'5','sd':'8','contrastType':'pair'},
 {'method':'contrast','groups':'3','delta':'5','sd':'8','contrastType':'custom','weights':'-1;0.5;0.5'},
 {'method':'contrast','groups':'3','delta':'10','sd':'8','contrastType':'custom','weights':'-2;1;1'},
 {'method':'contrast','groups':'3','delta':'5','sd':'4','design':'blocks','loss':'10','comparisons':'3'},
 {'method':'contrast','groups':'4','delta':'2','sd':'8','contrastType':'custom','weights':'-0.5;-0.5;0.5;0.5'},
]
for effect in ['A','B','AB']:
    cases.append({'method':'factorial','design':'blocks','a':'2','b':'3','means':'10;12;14;10;14;18','sd':'4','effect':effect,'loss':'10'})
results=[]
for s in cases:
    result=reference(s);results.append({'input':s,'expected':result});print(s['method'],result['n'],flush=True)

criticals=[]
for method,k,df,alpha in [('tukey',3,2,.05),('tukey',4,12,.05),('tukey',6,80,.05),('tukey',10,1000,.05),('tukey',5,10,.001),('tukey',5,10,.2),('dunnett',3,2,.05),('dunnett',4,12,.05),('dunnett',6,80,.05),('dunnett',10,1000,.05),('dunnett',5,10,.001),('dunnett',5,10,.2)]:
    c=critical(method,k,df,alpha)
    row=dict(method=method,k=k,df=df,alpha=alpha,critical=c)
    if method=='dunnett':
        corr=np.full((k-1,k-1),.5);np.fill_diagonal(corr,1)
        row['independentMvtCDF']=multivariate_t.cdf(np.full(k-1,c),shape=corr,df=df,lower_limit=np.full(k-1,-c),maxpts=1000000,random_state=np.random.default_rng(42))
    criticals.append(row)
output=dict(reference=f'SciPy {scipy.__version__}: studentized_range, multivariate_t, nct, ncf; independent adaptive quadrature',criticalCases=criticals,cases=results)
Path(__file__).with_name('comparison-reference.json').write_text(json.dumps(output,indent=2,allow_nan=False))
print('Saved',len(results),'sizes and',len(criticals),'critical values.',flush=True)
