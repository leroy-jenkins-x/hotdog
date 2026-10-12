import { localeOf,t } from '@/lib/i18n';
import { metadata } from '@/lib/seo';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const l=localeOf((await params).locale);return metadata(l,'/privacy',t(l).privacy,t(l).privacyText);}
export default async function Page({params}:{params:Promise<{locale:string}>}){const l=localeOf((await params).locale),d=t(l);return <main id="main" className="container page-main prose"><h1>{d.privacyTitle}</h1><p>{d.privacyText}</p><h2>{d.pedigree}</h2><p>{d.documentHint}</p><h2>{d.myPets}</h2><p>{d.draftSaved}. {d.loginDemoText}</p><h2>{d.careTitle}</h2><p>{d.evidenceText}</p><a className="button button-outline" style={{marginTop:30}} href={`/${l}/pets`}>{d.explore} ↗</a></main>;}
