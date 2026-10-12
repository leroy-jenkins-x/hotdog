import { providerAuth } from '@/lib/auth-providers';
export async function GET(req:Request,ctx:{params:Promise<{provider:string;step:string}>}){const {provider,step}=await ctx.params;return providerAuth(req,provider,step);}
