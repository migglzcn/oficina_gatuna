export const FILING_DURATION=23
export function filingPose(seconds:number,home:[number,number,number]){
 const raised=home[1]+0.12
 // Exit behind the rear desks, then pass in front of them and to the left of the side cabinet.
 const outward:[number,number,number][]=[home,[home[0],raised,home[2]],[4.55,raised,home[2]],[4.55,raised,-0.4],[3,raised,-0.4],[3,raised,2.85],[0.9,raised,2.85]]
 const points=[...outward,outward[6],...outward.slice(0,6).reverse()]
 const times=[0,1,3,5,6,8,10,11,13,15,16,18,22,23]
 const t=Math.max(0,Math.min(FILING_DURATION,seconds))
 const index=Math.min(times.length-2,Math.max(0,times.findIndex((end,i)=>i>0&&t<=end)-1))
 const a=points[index],b=points[index+1],fraction=(t-times[index])/(times[index+1]-times[index])
 const walking=index!==0&&index!==6&&index!==12
 return {position:a.map((value,i)=>value+(b[i]-value)*fraction) as [number,number,number],rotation:walking?Math.atan2(b[0]-a[0],b[2]-a[2]):index===6?-Math.PI/2:0,walking,deposited:t>=10.5,finished:t>=FILING_DURATION}
}
