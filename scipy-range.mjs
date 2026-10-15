/* Adapted from SciPy 1.17.0, scipy/stats/_stats.pyx:
 * _studentized_range_cdf_logconst, _studentized_range_cdf,
 * _studentized_range_cdf_asymptotic (finite-df kernel conditioned on s).
 * Source: https://github.com/scipy/scipy/blob/v1.17.0/scipy/stats/_stats.pyx
 * Copyright (c) 2001-2002 Enthought, Inc. 2003, SciPy Developers.
 * BSD-3-Clause; full notice: ../licenses/scipy-BSD-3-Clause.txt.
 * Adaptations: dependency injection for Phi/logGamma, separation of the
 * chi/normal densities, y=sqrt(2*df)*(s-1) for numerical integration.
 * The finite degrees-of-freedom mixture is retained, not replaced by an
 * infinite-df/normal approximation.
 */
export function sdLogDensity(s,df,logGamma){
 return (df/2)*Math.log(df)-logGamma(df/2)-(df/2-1)*Math.LN2
  +(df-1)*Math.log(s)-df*s*s/2;
}
export function normalRangeTerm(q,k,s,z,phiZ,Phi){
 return k*phiZ*Math.pow(Math.max(0,Phi(z+q*s)-Phi(z)),k-1);
}
