import { localeOf,t } from '@/lib/i18n';
import { metadata } from '@/lib/seo';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const l=localeOf((await params).locale);return metadata(l,'/terms',t(l).terms,t(l).termsText);}
export default async function Page({params}:{params:Promise<{locale:string}>}){const l=localeOf((await params).locale),d=t(l);return <main id="main" className="container page-main prose"><h1>{d.termsTitle}</h1><p>{d.termsText}</p><h2>{d.care1}</h2><p>{d.care1Text}</p><h2>{d.care2}</h2><p>{d.care2Text}</p><h2>{d.care3}</h2><p>{d.care3Text}</p><a className="button button-outline" style={{marginTop:30}} href={`/${l}/register`}>{d.addPet} +</a></main>;}
