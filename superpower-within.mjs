// Adapted from Superpower 0.2.4.1, R/power_oneway_within.R.
// Copyright (c) 2021 Daniel Lakens and Aaron R. Caldwell. MIT License.
// Full notice: ../licenses/Superpower-MIT.txt.
// Source commit: 4beaaf9fff3fba59b380a04dae180840e8a24c5e.
// Ported only: centering, noncentrality and degrees of freedom for ONE group,
// common marginal SD, compound symmetry. R pf/qf evaluation is replaced by
// the independently validated Ensaio noncentral F implementation, not a normal
// approximation. Unused effect-size reporting and design-object plumbing omitted.
export function superpowerWithin(means,n,sd,rho){
 const average=means.reduce((sum,x)=>sum+x,0)/means.length;
 const residual=means.map(x=>x-average);
 return {df1:means.length-1,df2:(n-1)*(means.length-1),lambda:n*residual.reduce((sum,x)=>sum+x*x,0)/(sd*sd*(1-rho))};
}
