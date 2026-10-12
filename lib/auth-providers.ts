import { database,runtime,secret,demoEnabled } from './server';
import { b64,fromB64,cookie,cookieValue,seal,unseal,safeReturn } from './security';
type Pending={state:string;verifier:string;nonce:string;provider:string;returnTo:string;exp:number};
const fail=(text:string,status=400)=>Response.json({error:text},{status,headers:{'Cache-Control':'no-store'}});
export async function providerAuth(request:Request,provider:string,step:string) {
  if(!['vk','telegram'].includes(provider))return fail('Unsupported login provider.');
  const e=runtime();const clientId=provider==='vk'?e.VK_CLIENT_ID:e.TELEGRAM_CLIENT_ID;
  if(!clientId||(provider==='telegram'&&!e.TELEGRAM_CLIENT_SECRET))return fail('This provider is not configured yet.',503);
  const url=new URL(request.url),callback=`${url.origin}/api/auth/${provider}/callback`;
  const authorize=provider==='vk'?'https://id.vk.ru/authorize':'https://oauth.telegram.org/auth';
  try {
    if(step==='start') {
      const verifier=b64(crypto.getRandomValues(new Uint8Array(48))),state=crypto.randomUUID(),nonce=crypto.randomUUID();
      const challenge=b64(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
      const pending:Pending={state,verifier,nonce,provider,returnTo:safeReturn(url.searchParams.get('returnTo')),exp:Date.now()+600000};
      const redirect=new URL(authorize);for(const [k,v] of Object.entries({client_id:clientId,redirect_uri:callback,response_type:'code',scope:provider==='telegram'?'openid profile':'vkid.personal_info',state,code_challenge:challenge,code_challenge_method:'S256'}))redirect.searchParams.set(k,v);
      // Authorization-code flow is bound to the request with state and S256 PKCE.
      return new Response(null,{status:302,headers:{Location:redirect.toString(),'Set-Cookie':cookie('rodnya_oauth',await seal(pending,secret()),600),'Cache-Control':'no-store'}});
    }
    if(step!=='callback')return fail('Not found.',404);
    const pending=await unseal<Pending>(cookieValue(request,'rodnya_oauth'),secret());
    if(!pending||pending.exp<Date.now()||pending.provider!==provider||pending.state!==url.searchParams.get('state')||!url.searchParams.get('code'))return fail('Invalid or expired login. Please start again.');
    const body=new URLSearchParams({grant_type:'authorization_code',client_id:clientId,code:url.searchParams.get('code')!,code_verifier:pending.verifier,redirect_uri:callback});
    if(provider==='vk'){const device=url.searchParams.get('device_id');if(!device)return fail('VK callback did not include device_id.');body.set('device_id',device);body.set('state',pending.state);}
    const headers:Record<string,string>={'Content-Type':'application/x-www-form-urlencoded'};
    if(provider==='telegram')headers.Authorization='Basic '+btoa(clientId+':'+e.TELEGRAM_CLIENT_SECRET);
    const response=await fetch(provider==='vk'?'https://id.vk.ru/oauth2/auth':'https://oauth.telegram.org/token',{method:'POST',headers,body});
    if(!response.ok)return fail('Provider could not complete login. Please try again.',502);
    const token=await response.json() as Record<string,unknown>;
    let externalId:string,name:string;
    if(provider==='vk') {
      if(typeof token.access_token!=='string')return fail('Missing provider token.',502);
      const result=await fetch('https://id.vk.ru/oauth2/user_info',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:clientId,access_token:token.access_token})});
      if(!result.ok)return fail('Provider profile is unavailable.',502);const profile=await result.json() as {user?:{user_id?:string|number;first_name?:string;last_name?:string}};
      if(!profile.user?.user_id)return fail('Provider identity is missing.',502);externalId=String(profile.user.user_id);name=[profile.user.first_name,profile.user.last_name].filter(Boolean).join(' ')||'Владелец питомца';
    }else {
      if(typeof token.id_token!=='string')return fail('Missing identity token.',502);
      const [head,payload,signature]=token.id_token.split('.');if(!head||!payload||!signature)return fail('Malformed identity token.',502);
      const header=JSON.parse(new TextDecoder().decode(fromB64(head))) as {kid:string;alg:string};const claims=JSON.parse(new TextDecoder().decode(fromB64(payload))) as {iss:string;aud:string|string[];exp:number;sub:string;name?:string;nonce?:string};
      const jwksResponse=await fetch('https://oauth.telegram.org/.well-known/jwks.json');const jwks=await jwksResponse.json() as {keys:(JsonWebKey&{kid?:string;alg?:string})[]};
      const jwk=jwks.keys.find(k=>k.kid===header.kid&&(!k.alg||k.alg===header.alg));
      if(!jwk||header.alg!=='RS256')return fail('Unsupported identity signing key.',502);
      const publicKey=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
      const verified=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',publicKey,fromB64(signature),new TextEncoder().encode(head+'.'+payload));
      if(!verified||claims.iss!=='https://oauth.telegram.org'||!(Array.isArray(claims.aud)?claims.aud:[claims.aud]).includes(clientId)||claims.exp*1000<Date.now()||(claims.nonce!==undefined&&claims.nonce!==pending.nonce)||!claims.sub)return fail('Identity verification failed.',401);
      externalId=claims.sub;name=claims.name||'Владелец питомца';
    }
    const userId=provider+':'+externalId;await database().prepare('INSERT INTO users (id,provider,provider_id,name,created_at) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name').bind(userId,provider,externalId,name.slice(0,120),new Date().toISOString()).run();
    const session=await seal({userId,exp:Date.now()+86400000*7,demo:false},secret());
    const out=new Headers({Location:pending.returnTo,'Cache-Control':'no-store'});out.append('Set-Cookie',cookie('rodnya_session',session,604800));out.append('Set-Cookie',cookie('rodnya_oauth','',0));
    return new Response(null,{status:302,headers:out});
  }catch{ return fail('Unable to complete secure provider login.',502); }
}
