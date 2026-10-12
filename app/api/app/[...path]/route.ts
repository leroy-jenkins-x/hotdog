import { api } from '@/lib/api';
type Context={params:Promise<{path:string[]}>};
export async function GET(req:Request,ctx:Context){return api(req,(await ctx.params).path);}
export async function POST(req:Request,ctx:Context){return api(req,(await ctx.params).path);}
