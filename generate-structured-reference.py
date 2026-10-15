"""Independent SciPy reference and direct-ANOVA Monte Carlo checks.
Run: python tests/generate-structured-reference.py
No JavaScript routines, jStat or Ensaio formulas are imported.
Sources: Purdue STAT514 Split-Plot Designs and RCBD with Replication.
"""
import json
from pathlib import Path
import numpy as np
import scipy
from scipy.stats import f, ncf

BASE=Path(__file__).resolve().parent

def components(s,r):
    means=np.array([float(x.replace(',','.')) for x in s['means'].split(';')])
    if s['method']=='splitplot':
        a,b=int(s['a']),int(s['b']);mu=means.reshape(a,b);g=mu.mean();row=mu.mean(1)-g;col=mu.mean(0)-g
        sub=float(s['sdSub'])**2
        if s['effect']=='A':
            v=b*float(s['sdWholeMean'])**2 if s.get('splitVarianceMode')=='means' else sub+b*float(s.get('sdWhole','0'))**2
            return a-1,(a-1)*(r-1),r*b*float(row@row)/v
        if s['effect']=='B':return b-1,a*(r-1)*(b-1),r*a*float(col@col)/sub
        interaction=mu-mu.mean(1)[:,None]-mu.mean(0)[None,:]+g
        return (a-1)*(b-1),a*(r-1)*(b-1),r*float(np.square(interaction).sum())/sub
    k,m=int(s['groups']),int(s['unitsPerCell']);signal=float(np.square(means-means.mean()).sum());sd=float(s['sd'])
    if s['blockModel']=='additive':return k-1,k*r*m-k-r+1,r*m*signal/sd**2
    return k-1,(k-1)*(r-1),r*m*signal/(sd**2+m*float(s['sdCell'])**2)

def power_at(s,r):
    d1,d2,lam=components(s,r);alpha=float(s.get('alpha','5'))/100/int(s.get('comparisons','1'))
    return float(ncf.sf(f.isf(alpha,d1,d2),d1,d2,lam)) if lam else alpha

split=dict(method='splitplot',a='2',b='3',effect='A',means='10;12;14;11;16;21',sdSub='4',sdWhole='3',splitVarianceMode='components')
reps=dict(method='replicatedBlocks',groups='3',unitsPerCell='2',cellKind='independent',blockModel='additive',means='10;12;15',sd='4')
cases=[]
def add(name,s,**patch):cases.append((name,{**s,**patch}))
for effect in ['A','B','AB']:add('split-'+effect,split,effect=effect)
add('split-A-zeroWhole',split,sdWhole='0')
add('split-A-meanScale',split,splitVarianceMode='means',sdWholeMean=str(np.sqrt(9+16/3)))
add('split-A-power90',split,power='90')
add('split-A-alpha1',split,alpha='1')
add('split-AB-bonferroni',split,effect='AB',comparisons='3')
add('split-A-loss',split,loss='15')
add('split-B-noWholeInput',split,effect='B',sdWhole='')
add('split-AB-threeByTwo',split,a='3',b='2',means='10;14;13;16;15;22',effect='AB')
add('split-A-large',split,means='10;12;14;10.3;12.3;14.3',sdWhole='2')
add('split-A-moderate',split,means='10;12;14;16;18;20',sdWhole='1')
add('split-A-minBlocks',split,means='0;2;4;80;82;84',sdWhole='1')
add('split-B-minBlocks',split,means='0;50;100;0;50;100',effect='B')
add('split-AB-minBlocks',split,means='0;20;40;40;20;0',effect='AB')
add('reps-minBlocks',reps,groups='2',means='0;100')
for model in ['additive','interaction']:
    add('reps-'+model,reps,blockModel=model,sdCell='2')
    add('reps-'+model+'-loss',reps,blockModel=model,sdCell='2',loss='10')
    add('reps-'+model+'-power90',reps,blockModel=model,sdCell='2',power='90')
    add('reps-'+model+'-m5',reps,blockModel=model,sdCell='2',unitsPerCell='5')
add('reps-twoTreatments',reps,groups='2',means='10;14',unitsPerCell='3')
add('reps-randomZero',reps,blockModel='interaction',sdCell='0')
add('reps-maxGroups',reps,groups='20',means=';'.join(str(10+i/3) for i in range(20)),unitsPerCell='3')
add('reps-smallerEffect',reps,means='10;10.5;11',sd='3')
fixtures=[]
for name,s in cases:
    target=float(s.get('power','80'))/100;maximum=1_000_000//(int(s['a'])*int(s['b']) if s['method']=='splitplot' else int(s['groups'])*int(s['unitsPerCell']))
    r=next((n for n in range(2,maximum+1) if power_at(s,n)>=target),None)
    assert r is not None
    d1,d2,lam=components(s,r);per=int(s['a'])*int(s['b']) if s['method']=='splitplot' else int(s['groups'])*int(s['unitsPerCell']);initial=int(np.ceil(r/(1-float(s.get('loss','0'))/100)))
    fixtures.append(dict(name=name,inputs=s,n=r,total=r*per,initial=initial,initialTotal=initial*per,df1=d1,df2=d2,ncp=lam,power=power_at(s,r),previousPower=power_at(s,r-1) if r>2 else None))

# Direct simulated data and ANOVA sums of squares, independently of the NCP.
rng=np.random.default_rng(20261015);simulations=100_000;checks=[]
for kind in ['splitplot','additive','interaction']:
 for null in [False,True]:
    r=5
    if kind=='splitplot':
        a,b=2,3;mu=np.zeros((a,b)) if null else np.array([[10,12,14],[11,16,21]])
        y=mu+rng.normal(0,3,(simulations,r,a,1))+rng.normal(0,4,(simulations,r,a,b))+rng.normal(0,5,(simulations,r,1,1))
        g=y.mean((1,2,3));byBlock=y.mean((2,3));byA=y.mean((1,3));byB=y.mean((1,2));byAB=y.mean(1);byWhole=y.mean(3)
        ssa=r*b*np.square(byA-g[:,None]).sum(1);ssb=r*a*np.square(byB-g[:,None]).sum(1)
        ssab=r*np.square(byAB-byA[:,:,None]-byB[:,None,:]+g[:,None,None]).sum((1,2))
        ssw=b*np.square(byWhole-g[:,None,None]).sum((1,2));ssblock=a*b*np.square(byBlock-g[:,None]).sum(1)
        ssew=ssw-ssblock-ssa;sst=np.square(y-g[:,None,None,None]).sum((1,2,3));sses=sst-ssw-ssb-ssab
        for effect,numerator in [('A',ssa),('B',ssb),('AB',ssab)]:
            s={**split,'effect':effect};d1,d2,_=components(s,r);denominator=ssew if effect=='A' else sses
            observed=float(((numerator/d1)/(denominator/d2)>f.isf(.05,d1,d2)).mean());expected=.05 if null else power_at(s,r)
            mcse=np.sqrt(expected*(1-expected)/simulations);assert abs(observed-expected)<4*mcse+1/simulations,(kind,effect,null,observed,expected)
            checks.append(dict(model=kind,effect=effect,null=null,observed=observed,expected=expected,mcse=float(mcse)))
    else:
        k,m=3,2;mu=np.zeros(k) if null else np.array([10,12,15]);sdcell=2 if kind=='interaction' else 0
        y=mu[None,None,:,None]+rng.normal(0,5,(simulations,r,1,1))+rng.normal(0,sdcell,(simulations,r,k,1))+rng.normal(0,4,(simulations,r,k,m))
        g=y.mean((1,2,3));byT=y.mean((1,3));byBlock=y.mean((2,3));byCell=y.mean(3)
        sstreat=r*m*np.square(byT-g[:,None]).sum(1)
        if kind=='additive':
            denominator=np.square(y-byBlock[:,:,None,None]-byT[:,None,:,None]+g[:,None,None,None]).sum((1,2,3))
        else:denominator=m*np.square(byCell-byBlock[:,:,None]-byT[:,None,:]+g[:,None,None]).sum((1,2))
        s={**reps,'blockModel':kind,'sdCell':'2'};d1,d2,_=components(s,r);observed=float(((sstreat/d1)/(denominator/d2)>f.isf(.05,d1,d2)).mean());expected=.05 if null else power_at(s,r)
        mcse=np.sqrt(expected*(1-expected)/simulations);assert abs(observed-expected)<4*mcse+1/simulations,(kind,null,observed,expected)
        checks.append(dict(model=kind,null=null,observed=observed,expected=expected,mcse=float(mcse)))
output=dict(reference='SciPy '+scipy.__version__,seed=20261015,simulationsPerCheck=simulations,fixtures=fixtures,simulationChecks=checks)
(BASE/'structured-reference.json').write_text(json.dumps(output,indent=2,allow_nan=False)+'\n')
print(f'{len(fixtures)} reference sizes; {len(checks)} direct ANOVA Monte Carlo checks passed with 100000 draws each.')
