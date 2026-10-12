'use client';
import { useState } from 'react';
import { Heart,Share2,Check } from 'lucide-react';
import type { Locale } from '@/lib/types';
import { t } from '@/lib/i18n';
import { useAuth,requestJson } from './session';
export function Favorite({id,locale}:{id:string;locale:Locale}){const auth=useAuth(),d=t(locale),[busy,setBusy]=useState(false);const saved=auth.favoriteIds.includes(id);return <button className={'favorite-button '+(saved?'is-saved':'')} aria-label={d.favorite} aria-pressed={saved} disabled={busy} onClick={async()=>{if(!auth.user){auth.login();return;}setBusy(true);try{await requestJson('favorites/'+id,{});await auth.refreshFavorites();}finally{setBusy(false);}}}><Heart size={20} fill={saved?'currentColor':'none'}/></button>;}
export function Share({locale}:{locale:Locale}){const d=t(locale),[copied,setCopied]=useState(false);return <button className="button button-outline small" onClick={async()=>{try{await navigator.clipboard.writeText(window.location.href);setCopied(true);}catch{if(navigator.share)await navigator.share({url:window.location.href});}}}>{copied?<Check size={17}/>:<Share2 size={17}/>} {copied?d.copied:d.share}</button>;}
