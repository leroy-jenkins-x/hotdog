import { database,runtime,userFor } from '@/lib/server';
export async function GET(request:Request,ctx:{params:Promise<{id:string}>}) {
  const {id}=await ctx.params;const record=await database().prepare('SELECT * FROM assets WHERE id=?').bind(id).first<{owner_id:string;kind:string;content_type:string}>();
  if(!record)return new Response('Not found',{status:404});
  const publicPhoto=record.kind==='photo'&&Boolean(await database().prepare('SELECT id FROM pets WHERE photo_id=?').bind(id).first());
  if(!publicPhoto) {const user=await userFor(request);if(user?.id!==record.owner_id)return new Response('Forbidden',{status:403,headers:{'Cache-Control':'no-store'}});}
  const object=await runtime().BUCKET?.get(id);if(!object)return new Response('Not found',{status:404});
  return new Response(object.body,{headers:{'Content-Type':record.content_type,'X-Content-Type-Options':'nosniff','Content-Disposition':record.kind==='pedigree'?'attachment; filename="pedigree"':'inline','Cache-Control':publicPhoto?'public,max-age=3600':'private,no-store'}});
}
