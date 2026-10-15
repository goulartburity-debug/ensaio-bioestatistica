/* Adapted from OpenEpi SampleSize/SSMean.js, CalcPower, sample-size block.
Statistics: Minn M. Soe and Kevin M. Sullivan, Emory University.
Copyright (c) 2003, 2008 Andrew G. Dean and Kevin M. Sullivan, Atlanta, GA, USA.
MIT license: see ../licenses/OpenEpi-MIT.txt. Source snapshot: 2026-10-15.
Adaptation: pure function; z/power quantiles passed by caller, not rounded lookup
constants; inputs already validated; return values replace legacy HTML table.
Normal approximation, NOT noncentral-t or exact Welch power.
Reference: Rosner, Fundamentals of Biostatistics, 5th ed., examples 8.28–8.29.
*/
export function openEpiMeans(s1,s2,ratio,diff,z,power){
 const n1=Math.ceil((Math.pow(s1,2)+(Math.pow(s2,2)/ratio))*Math.pow(z+power,2)/(Math.pow(diff,2)));
 const n2=Math.ceil(n1*ratio);
 return [n1,n2];
}
