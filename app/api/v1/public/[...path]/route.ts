import { api } from '@/lib/api';
export async function GET(req:Request,ctx:{params:Promise<{path:string[]}>}) {return api(req,['public',...(await ctx.params).path]);}
