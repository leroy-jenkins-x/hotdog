import { env } from 'cloudflare:workers';
import { demoPets } from './demo';
import type { Pet, User, Meeting } from './types';
import { cookieValue, unseal, HttpError } from './security';
export const runtime = () => env as Cloudflare.Env;
export const demoEnabled = () => runtime().DEMO_MODE === 'true';
export const origin = () => (runtime().SITE_ORIGIN || 'https://example.ru').replace(/\/$/,'');
export function database() { const db=runtime().DB; if(!db) throw new HttpError(503,'Database is not configured.'); return db; }
export function secret() { const key=runtime().SESSION_SECRET; if(!key||key.length<32) throw new HttpError(503,'Authentication is not configured.'); return key; }
type Session = {userId:string;exp:number;demo:boolean};
export async function userFor(request: Request): Promise<User|null> {
  const payload=await unseal<Session>(cookieValue(request,'rodnya_session'),secret());
  if(!payload||payload.exp<Date.now()|| (payload.demo&&!demoEnabled())) return null;
  const row=await database().prepare('SELECT id,name,provider FROM users WHERE id=?').bind(payload.userId).first<{id:string;name:string;provider:string}>();
  return row ? {...row,demo:row.provider==='demo'}:null;
}
export async function requireUser(request:Request) {const user=await userFor(request);if(!user) throw new HttpError(401,'Please sign in.');return user;}
export function decodePet(r: Record<string,unknown>):Pet {
  return {id:String(r.id),ownerId:String(r.owner_id),name:String(r.name),species:r.species as Pet['species'],breed:String(r.breed),sex:r.sex as Pet['sex'],born:String(r.born),city:String(r.city),description:String(r.description),parents:JSON.parse(String(r.parents||'[]')),photoId:r.photo_id?String(r.photo_id):undefined,pedigreeId:r.pedigree_id?String(r.pedigree_id):undefined,status:r.status as Pet['status'],isDemo:Boolean(r.is_demo),createdAt:String(r.created_at),updatedAt:String(r.updated_at)};
}
export async function petById(id:string):Promise<Pet|null> {
  const seed=demoEnabled()?demoPets.find(p=>p.id===id):null;if(seed)return seed;
  const row=await database().prepare('SELECT * FROM pets WHERE id=?').bind(id).first<Record<string,unknown>>();return row?decodePet(row):null;
}
export async function publicPets(options:{q?:string;species?:string;city?:string;lineage?:boolean;limit?:number}={}) {
  const db=database();const limit=Math.min(60,Math.max(1,options.limit||30));
  // This small deployment deliberately uses indexed filters and bounded scans rather than a search service.
  const result=await db.prepare('SELECT * FROM pets ORDER BY created_at DESC LIMIT 200').all<Record<string,unknown>>();
  const all=[...(demoEnabled()?demoPets:[]),...result.results.map(decodePet)];
  const normalize=(s:string)=>s.normalize('NFKC').toLocaleLowerCase().replace(/ё/g,'е');
  return all.filter(p=>(!options.species||p.species===options.species)&&(!options.city||normalize(p.city).includes(normalize(options.city)))&&(!options.q||normalize(p.name+' '+p.breed+' '+p.description).includes(normalize(options.q)))&&(!options.lineage||p.parents.some(x=>x.name))).slice(0,limit);
}
export function publicRecord(p:Pet,locale='ru') {
  return {id:p.id,name:p.name,species:p.species,breed:p.breed,sex:p.sex,birthDate:p.born||null,city:p.city,description:p.description,parents:p.parents,status:p.status,photoUrl:p.photoId?`${origin()}/api/media/${p.photoId}`:null,hasPedigreeDocument:Boolean(p.pedigreeId),lineageStatus:p.parents.some(x=>x.name)?'owner-reported':'unknown',isDemo:p.isDemo,updatedAt:p.updatedAt,sourceUrl:`${origin()}/${locale}/pets/${p.id}`,availableLocales:['ru','kk','uz'],schemaVersion:'1.0'};
}
export function decodeMeeting(r:Record<string,unknown>):Meeting {return {id:String(r.id),senderId:String(r.sender_id),recipientId:String(r.recipient_id),animalId:String(r.animal_id),ownAnimalId:r.own_animal_id?String(r.own_animal_id):undefined,startsAt:String(r.starts_at),endsAt:String(r.ends_at),timezone:String(r.timezone),purpose:r.purpose as Meeting['purpose'],place:String(r.place),note:String(r.note),state:r.state as Meeting['state'],isDemo:Boolean(r.is_demo),createdAt:String(r.created_at)};}
