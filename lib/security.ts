export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export function safeReturn(value: string | null | undefined) { return value && value.startsWith('/') && !value.startsWith('//') && !/[\\\r\n]/.test(value) ? value : '/ru/dashboard'; }
export function b64(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
export function fromB64(value: string) { return Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')), c=>c.charCodeAt(0)); }
export async function seal(data: object, secret: string) {
  const body = b64(new TextEncoder().encode(JSON.stringify(data)));
  const key = await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return body+'.'+b64(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(body))));
}
export async function unseal<T>(token: string | undefined, secret: string): Promise<T|null> {
  if (!token || token.length>8000) return null;
  try {
    const [body,signature,extra]=token.split('.'); if (!body||!signature||extra) return null;
    const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
    if (!await crypto.subtle.verify('HMAC',key,fromB64(signature),new TextEncoder().encode(body))) return null;
    return JSON.parse(new TextDecoder().decode(fromB64(body))) as T;
  } catch { return null; }
}
export function cookieValue(request: Request,name: string) { return request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1); }
export function sameOrigin(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) throw new HttpError(403,'Cross-origin writes are not allowed.');
}
export function cookie(name:string,value:string,maxAge:number) { return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`; }
export function validateFile(bytes: Uint8Array, type: string, kind: string) {
  const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71;
  const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  const webp=new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
  const pdf=new TextDecoder().decode(bytes.slice(0,5))==='%PDF-';
  if (!((type==='image/png'&&png)||(type==='image/jpeg'&&jpg)||(type==='image/webp'&&webp&&kind==='photo')||(type==='application/pdf'&&pdf&&kind==='pedigree'))) throw new HttpError(400,'Unsupported file or file contents do not match the declared format.');
}
