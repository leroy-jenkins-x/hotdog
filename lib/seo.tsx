import type { Metadata } from 'next';
import type { Locale } from './types';
import { origin,demoEnabled } from './server';
import { t } from './i18n';
export function metadata(locale:Locale,path='',title?:string,description?:string,noindex=false):Metadata {
  const d=t(locale),base=origin();return {title:title?`${title} — ${d.brand}`:`${d.brand} Питомцы, родословные и знакомства`,description:description||d.heroText,metadataBase:new URL(base),alternates:{canonical:`${base}/${locale}${path}`,languages:{ru:`${base}/ru${path}`,kk:`${base}/kk${path}`,uz:`${base}/uz${path}`,'x-default':`${base}/ru${path}`}},robots:{index:!demoEnabled()&&!noindex,follow:true},openGraph:{title:title||d.hero1+' '+d.hero2,description:description||d.heroText,url:`${base}/${locale}${path}`,siteName:d.brand,locale:locale==='ru'?'ru_RU':locale==='kk'?'kk_KZ':'uz_UZ',type:'website',images:[{url:`${base}/pet-family.webp`,width:1672,height:941,alt:d.tagline}]},twitter:{card:'summary_large_image'},icons:{icon:'/favicon.svg'}};
}
export function JsonLd({value}:{value:unknown}) {return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(value).replace(/</g,'\\u003c')}}/>;}
