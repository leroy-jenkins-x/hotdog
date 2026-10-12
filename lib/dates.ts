export function zonedDateTime(value:string,timeZone:string){
  const match=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);if(!match)throw new Error('Invalid date');
  const [year,month,day,hour,minute]=match.slice(1).map(Number);const wanted=Date.UTC(year,month-1,day,hour,minute);
  const f=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  const local=(stamp:number)=>{const parts=Object.fromEntries(f.formatToParts(new Date(stamp)).map(p=>[p.type,p.value]));return Date.UTC(Number(parts.year),Number(parts.month)-1,Number(parts.day),Number(parts.hour),Number(parts.minute));};
  let result=wanted;for(let i=0;i<4;i++)result-=local(result)-wanted;
  if(local(result)!==wanted)throw new Error('This local time does not exist');return new Date(result).toISOString();
}
