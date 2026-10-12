'use client';
import { createContext,useContext,useState,useEffect,useRef } from 'react';
import { X,UserRound,ArrowRight,Phone,Send,Mail,PawPrint,Menu } from 'lucide-react';
import type { Locale,User,AccountData } from '@/lib/types';
import { t } from '@/lib/i18n';
import { usePathname } from 'next/navigation';
import { searchCopy } from '@/lib/search-i18n';
type SessionData={user:User|null;demo:boolean;providers:{vk:boolean;telegram:boolean;phone:boolean}};
type Context=SessionData&{ready:boolean;refresh:()=>Promise<void>;login:()=>void;favoriteIds:string[];refreshFavorites:()=>Promise<void>};
const Auth=createContext<Context>({user:null,demo:false,providers:{vk:false,telegram:false,phone:false},ready:false,refresh:async()=>{},login:()=>{},favoriteIds:[],refreshFavorites:async()=>{}});
export const useAuth=()=>useContext(Auth);
export async function requestJson<T=unknown>(path:string,body?:unknown):Promise<T>{const response=await fetch('/api/app/'+path,{method:body===undefined?'GET':'POST',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const data=await response.json() as T & {error?:string};if(!response.ok)throw Object.assign(new Error(data.error||'Request failed'),{status:response.status});return data;}
export function SessionProvider({locale,children}:{locale:Locale;children:React.ReactNode}) {
  const d=t(locale),dialog=useRef<HTMLDialogElement>(null),returnFocus=useRef<HTMLElement|null>(null);
  const [state,setState]=useState<SessionData>({user:null,demo:false,providers:{vk:false,telegram:false,phone:false}}),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[phone,setPhone]=useState(false),[favorites,setFavorites]=useState<string[]>([]);
  const refreshFavorites=async()=>{try{const a=await requestJson<AccountData>('account');setFavorites(a.favoriteIds);}catch{setFavorites([]);}};
  const refresh=async()=>{try{const s=await requestJson<SessionData>('session');setState(s);if(s.user)await refreshFavorites();}catch{}finally{setReady(true);}};
  useEffect(()=>{void refresh();},[]);
  const login=()=>{returnFocus.current=document.activeElement as HTMLElement;setError('');setPhone(false);dialog.current?.showModal();};
  const close=()=>{dialog.current?.close();returnFocus.current?.focus();};
  const demoLogin=async()=>{setBusy(true);try{await requestJson('demo',{});await refresh();close();}catch{setError(d.error);}finally{setBusy(false);}};
  return <Auth.Provider value={{...state,ready,refresh,login,favoriteIds:favorites,refreshFavorites}}>{children}<dialog ref={dialog} className="modal login-modal" onClick={e=>{if(e.target===dialog.current)close();}} onClose={()=>returnFocus.current?.focus()} aria-labelledby="login-title"><button className="icon-button modal-close" onClick={close} aria-label={d.close}><X size={20}/></button><span className="round-icon"><PawPrint size={26}/></span><h2 id="login-title">{d.loginTitle}</h2><p className="muted">{d.loginText}</p><div className="providers">{[{id:'vk',label:d.vk,icon:<span className="provider-logo vk">vk</span>,enabled:state.providers.vk},{id:'vk',label:d.mail,icon:<Mail size={20}/>,enabled:state.providers.vk},{id:'telegram',label:d.telegram,icon:<Send size={20}/>,enabled:state.providers.telegram}].map((p,i)=><div key={i}>{p.enabled?<a className="provider-button" href={`/api/auth/${p.id}/start?returnTo=${encodeURIComponent(typeof window!=='undefined'?window.location.pathname:'/'+locale+'/dashboard')}`} target="_top">{p.icon}{p.label}<ArrowRight size={17}/></a>:<button className="provider-button pending" type="button" disabled>{p.icon}<span>{p.label}<small>{d.providerPending}</small></span></button>}</div>)}<button className="provider-button" onClick={()=>setPhone(!phone)}><Phone size={20}/>{d.phone}<ArrowRight size={17}/></button>{phone&&<div className="soft-note">{d.phoneText}</div>}</div>{state.demo&&<><div className="or-divider"><span>{d.demo}</span></div><button className="button button-primary full" disabled={busy} onClick={demoLogin}>{busy?d.loading:d.demoLogin}<ArrowRight size={18}/></button><p className="tiny muted">{d.loginDemoText}</p></>}{error&&<p className="error" role="alert">{error}</p>}<p className="tiny muted"><a href={`/${locale}/privacy`}>{d.privacy}</a> · <a href={`/${locale}/terms`}>{d.terms}</a></p></dialog></Auth.Provider>;
}
export function AccountButton({locale}:{locale:Locale}){const a=useAuth(),d=t(locale);return a.user?<a className="button button-dark small" href={`/${locale}/dashboard`}><UserRound size={17}/>{d.myPets}</a>:<button className="button button-outline small" onClick={a.login}><UserRound size={17}/>{d.signIn}</button>;}
export function MobileMenu({locale}:{locale:Locale}){const [open,setOpen]=useState(false),d=t(locale);return <div className="mobile-menu"><button className="icon-button" aria-expanded={open} aria-label={d.explore} onClick={()=>setOpen(!open)}><Menu/></button>{open&&<nav><a href={`/${locale}/pets`}>{d.explore}</a><a href={`/${locale}/guides`}>{d.guides}</a><a href={`/${locale}/dashboard`}>{d.myPets}</a><a href={`/${locale}/register`}>{d.addPet}</a></nav>}</div>;}
export function LanguageSwitch({locale}:{locale:Locale}) {
  const path=usePathname()||'/'+locale,copy=searchCopy(locale);
  return <label className="language-dropdown"><span className="sr-only">{copy.language}</span><select aria-label={copy.language} value={locale} onChange={e=>{const url=new URL(window.location.href);window.location.assign(path.replace(/^\/(ru|kk|uz)(?=\/|$)/,'/'+e.target.value)+url.search+url.hash);}}><option value="ru" lang="ru">Русский</option><option value="kk" lang="kk">Қазақша</option><option value="uz" lang="uz">O‘zbekcha</option></select></label>;
}
