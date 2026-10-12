import { z } from 'zod';
import { database,demoEnabled,petById,publicPets,publicRecord,decodePet,decodeMeeting,requireUser,runtime,userFor,secret,origin } from './server';
import { HttpError,sameOrigin,seal,cookie,validateFile } from './security';
import type { Parent } from './types';
const clean=z.string().trim();
export const petInput=z.object({name:clean.min(1).max(80),species:z.enum(['dog','cat','snake']),breed:clean.max(120).default(''),sex:z.enum(['male','female','unknown']),born:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal('')),city:clean.min(1).max(80),description:clean.max(1800),father:clean.max(120).default(''),mother:clean.max(120).default(''),fatherId:z.string().max(100).optional(),motherId:z.string().max(100).optional(),photoId:z.string().optional(),pedigreeId:z.string().optional(),status:z.enum(['available','introduction','unavailable']),consent:z.literal(true)});
const meetingInput=z.object({animalId:clean.min(1).max(100),ownAnimalId:z.string().max(100).optional(),startsAt:z.string().datetime(),timezone:clean.min(1).max(60),purpose:z.enum(['introduction','breeding']),place:clean.min(1).max(160),note:clean.max(1000)});
export function json(value:unknown,status=200,headers:Record<string,string>={}) {return Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});}
async function parse(request:Request) {if(Number(request.headers.get('content-length')||0)>12000)throw new HttpError(413,'Payload too large.');const raw=await request.text();if(raw.length>12000)throw new HttpError(413,'Payload too large.');return JSON.parse(raw);}
export async function api(request:Request,path:string[]) {
  try {
    if(request.method!=='GET')sameOrigin(request);
    const db=database();const key=path.join('/');const url=new URL(request.url);
    if(key==='session'&&request.method==='GET')return json({user:await userFor(request),demo:demoEnabled(),providers:{vk:Boolean(runtime().VK_CLIENT_ID),telegram:Boolean(runtime().TELEGRAM_CLIENT_ID&&runtime().TELEGRAM_CLIENT_SECRET),phone:false}});
    if(key==='demo'&&request.method==='POST') {
      if(!demoEnabled())throw new HttpError(403,'Demo login is disabled.');
      const userId='demo-user-'+crypto.randomUUID();const name='Друг питомцев';
      await db.prepare('INSERT INTO users (id,provider,provider_id,name,created_at) VALUES (?,?,?,?,?)').bind(userId,'demo',userId,name,new Date().toISOString()).run();
      const token=await seal({userId,exp:Date.now()+86400000*7,demo:true},secret());
      return json({user:{id:userId,name,provider:'demo',demo:true}},200,{'Set-Cookie':cookie('rodnya_session',token,604800)});
    }
    if(key==='logout'&&request.method==='POST')return json({ok:true},200,{'Set-Cookie':cookie('rodnya_session','',0)});
    if(path[0]==='public'&&request.method==='GET') {
      if(path[1]==='animals'&&path[2]) {const p=await petById(path[2]);if(!p)throw new HttpError(404,'Animal not found.');return json(path[3]==='lineage'?{animalId:p.id,parents:p.parents,evidence:p.parents.some(x=>x.name)?'owner-reported':'unknown',unknownBranches:2-p.parents.filter(x=>x.name).length,sourceUrl:`${origin()}/ru/pets/${p.id}`} :publicRecord(p,url.searchParams.get('locale')||'ru'),200,{'Cache-Control':'public, max-age=60'});}
      if(path[1]==='species')return json({data:[{id:'dog',names:{ru:'Собаки',kk:'Иттер',uz:'Itlar'}},{id:'cat',names:{ru:'Кошки',kk:'Мысықтар',uz:'Mushuklar'}},{id:'snake',names:{ru:'Змеи',kk:'Жыландар',uz:'Ilonlar'}}]});
      const data=await publicPets({q:url.searchParams.get('q')||undefined,species:url.searchParams.get('species')||undefined,city:url.searchParams.get('city')||undefined,limit:30});return json({data:data.map(p=>publicRecord(p,url.searchParams.get('locale')||'ru')),limit:30,nextCursor:null,schemaVersion:'1.0'},200,{'Cache-Control':'public, max-age=60'});
    }
    const user=await requireUser(request);
    if(key==='account'&&request.method==='GET') {
      const pets=await db.prepare('SELECT * FROM pets WHERE owner_id=? ORDER BY created_at DESC').bind(user.id).all<Record<string,unknown>>();
      const saved=await db.prepare('SELECT pet_id FROM favorites WHERE user_id=?').bind(user.id).all<{pet_id:string}>();
      const meetings=await db.prepare('SELECT * FROM meetings WHERE sender_id=? OR recipient_id=? ORDER BY starts_at DESC').bind(user.id,user.id).all<Record<string,unknown>>();
      return json({user,pets:pets.results.map(decodePet),favoriteIds:saved.results.map(x=>x.pet_id),meetings:meetings.results.map(decodeMeeting)});
    }
    if(key==='uploads'&&request.method==='POST') {
      if(!request.headers.get('content-type')?.startsWith('multipart/form-data'))throw new HttpError(400,'Expected a multipart file upload.');
      if(Number(request.headers.get('content-length')||0)>9*1024*1024)throw new HttpError(413,'File is too large.');
      const data=await request.formData();const file=data.get('file');const kind=data.get('kind');
      if(!(file instanceof File)||!['photo','pedigree'].includes(String(kind)))throw new HttpError(400,'Missing upload.');
      if(file.size>8*1024*1024||file.size===0)throw new HttpError(413,'Choose a file smaller than 8 MB.');
      const buffer=new Uint8Array(await file.arrayBuffer());validateFile(buffer,file.type,String(kind));
      const bucket=runtime().BUCKET;if(!bucket)throw new HttpError(503,'File storage is not configured.');
      const id=crypto.randomUUID();await bucket.put(id,buffer,{httpMetadata:{contentType:file.type}});
      try{await db.prepare('INSERT INTO assets (id,owner_id,kind,content_type,size,created_at) VALUES (?,?,?,?,?,?)').bind(id,user.id,kind,file.type,file.size,new Date().toISOString()).run();}catch(error){await bucket.delete(id);throw error;}
      return json({id},201);
    }
    if(key==='pets'&&request.method==='POST') {
      const d=petInput.parse(await parse(request));const id=crypto.randomUUID();const now=new Date().toISOString();
      if(d.born&&(!Number.isFinite(Date.parse(d.born))||new Date(d.born).toISOString().slice(0,10)!==d.born||d.born>now.slice(0,10)))throw new HttpError(400,'Birth date must be valid and cannot be in the future.');
      for(const [assetId,kind] of [[d.photoId,'photo'],[d.pedigreeId,'pedigree']])if(assetId&&!await db.prepare('SELECT id FROM assets WHERE id=? AND owner_id=? AND kind=?').bind(assetId,user.id,kind).first())throw new HttpError(403,'File does not belong to your account.');
      const parents:Parent[]=[];
      for(const [name,parentId,expectedSex] of [[d.father,d.fatherId,'male'],[d.mother,d.motherId,'female']]) {
        if(parentId){const parent=await petById(parentId);if(!parent||parent.species!==d.species||parent.sex!==expectedSex||(d.born&&parent.born&&parent.born>=d.born))throw new HttpError(400,'Parent record does not match species, sex or dates.');parents.push({name:parent.name,id:parent.id,evidence:'owner-reported'});}else parents.push({name:name||'',evidence:name?'owner-reported':'unknown'});
      }
      if(d.fatherId&&d.fatherId===d.motherId)throw new HttpError(400,'Parents must be distinct.');
      await db.prepare('INSERT INTO pets (id,owner_id,name,species,breed,sex,born,city,description,parents,photo_id,pedigree_id,status,is_demo,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,user.id,d.name,d.species,d.breed||'Неизвестно',d.sex,d.born,d.city,d.description,JSON.stringify(parents),d.photoId||null,d.pedigreeId||null,d.status,demoEnabled()?1:0,now,now).run();
      return json({id},201);
    }
    if(path[0]==='favorites'&&path[1]&&request.method==='POST') {
      const id=path[1];if(!await petById(id))throw new HttpError(404,'Animal not found.');
      const existing=await db.prepare('SELECT pet_id FROM favorites WHERE user_id=? AND pet_id=?').bind(user.id,id).first();
      await db.prepare(existing?'DELETE FROM favorites WHERE user_id=? AND pet_id=?':'INSERT OR IGNORE INTO favorites (user_id,pet_id) VALUES (?,?)').bind(user.id,id).run();return json({saved:!existing});
    }
    if(key==='meetings'&&request.method==='POST') {
      const d=meetingInput.parse(await parse(request));const target=await petById(d.animalId);if(!target)throw new HttpError(404,'Animal not found.');
      if(target.ownerId===user.id||target.status==='unavailable')throw new HttpError(400,'This animal is not available for a meeting.');
      if(Date.parse(d.startsAt)<Date.now()+60000||Date.parse(d.startsAt)>Date.now()+86400000*365)throw new HttpError(400,'Choose a future date within one year.');
      try{new Intl.DateTimeFormat('en',{timeZone:d.timezone});}catch{throw new HttpError(400,'Invalid timezone.');}
      const own=d.ownAnimalId?await petById(d.ownAnimalId):null;if(own&&own.ownerId!==user.id)throw new HttpError(403,'Choose your own animal.');
      if(d.purpose==='breeding') {
        if(!own||own.status!=='available'||target.status!=='available'||own.species!==target.species||own.sex==='unknown'||target.sex==='unknown'||own.sex===target.sex)throw new HttpError(400,'Breeding requires available animals of the same species and confirmed opposite sexes.');
        const relatives=new Set([target.id,...target.parents.map(x=>x.id).filter(Boolean)]);
        if(relatives.has(own.id)||own.parents.some(p=>p.id&&relatives.has(p.id)))throw new HttpError(400,'Recorded close relationship requires separate review.');
      }
      const id=crypto.randomUUID(),now=new Date().toISOString(),endsAt=new Date(Date.parse(d.startsAt)+3600000).toISOString();
      await db.prepare('INSERT INTO meetings (id,sender_id,recipient_id,animal_id,own_animal_id,starts_at,ends_at,timezone,purpose,place,note,state,is_demo,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,user.id,target.ownerId,target.id,own?.id||null,d.startsAt,endsAt,d.timezone,d.purpose,d.place,d.note,'requested',target.isDemo?1:0,now).run();return json({id},201);
    }
    if(path[0]==='meetings'&&path[1]&&request.method==='POST') {
      const row=await db.prepare('SELECT * FROM meetings WHERE id=?').bind(path[1]).first<Record<string,unknown>>();if(!row)throw new HttpError(404,'Meeting not found.');
      const m=decodeMeeting(row);const {action}=z.object({action:z.enum(['confirm','decline','cancel','demo-confirm'])}).parse(await parse(request));
      const simulated=action==='demo-confirm'&&demoEnabled()&&m.isDemo&&m.senderId===user.id;
      if(action==='cancel'){if(![m.senderId,m.recipientId].includes(user.id))throw new HttpError(403,'Forbidden.');if(!['requested','confirmed'].includes(m.state))throw new HttpError(409,'Meeting already closed.');await db.batch([db.prepare('UPDATE meetings SET state=? WHERE id=?').bind('cancelled',m.id),db.prepare('DELETE FROM reservations WHERE meeting_id=?').bind(m.id)]);return json({ok:true});}
      if(!simulated&&m.recipientId!==user.id)throw new HttpError(403,'Only the other owner can respond.');if(m.state!=='requested')throw new HttpError(409,'Meeting already answered.');
      if(action==='decline'){await db.prepare('UPDATE meetings SET state=? WHERE id=? AND state=?').bind('declined',m.id,'requested').run();return json({ok:true});}
      if(Date.parse(m.startsAt)<Date.now())throw new HttpError(409,'The proposed time has passed.');
      const target=await petById(m.animalId);const own=m.ownAnimalId?await petById(m.ownAnimalId):null;
      if(!target||target.ownerId!==m.recipientId||target.status==='unavailable'||(m.ownAnimalId&&(!own||own.ownerId!==m.senderId)))throw new HttpError(409,'The animal record changed. Please propose a new meeting.');
      const resources=[...new Set([m.animalId,m.ownAnimalId,'user:'+m.senderId,'user:'+m.recipientId].filter(Boolean))];
      try{await db.batch([db.prepare('UPDATE meetings SET state=? WHERE id=? AND state=?').bind('confirmed',m.id,'requested'),...resources.map(r=>db.prepare('INSERT INTO reservations (id,meeting_id,resource_id,starts_at,ends_at) VALUES (?,?,?,?,?)').bind(m.id+':'+r,m.id,r,m.startsAt,m.endsAt))]);}catch{throw new HttpError(409,'That time conflicts with another confirmed meeting. Choose another time.');}
      return json({ok:true});
    }
    throw new HttpError(404,'Endpoint not found.');
  }catch(error){if(error instanceof HttpError)return json({error:error.message},error.status);if(error instanceof z.ZodError||error instanceof SyntaxError)return json({error:'Please check the entered fields.'},400);console.error('Request failed',error instanceof Error?error.name:'UnknownError');return json({error:'Unable to complete this request.'},500);}
}
