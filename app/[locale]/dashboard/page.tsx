import { localeOf,t } from '@/lib/i18n';
import { metadata } from '@/lib/seo';
import { Dashboard } from '@/components/site/dashboard';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const l=localeOf((await params).locale);return metadata(l,'/dashboard',t(l).myPets,t(l).dashboardText,true);}
export default async function Page({params}:{params:Promise<{locale:string}>}){const l=localeOf((await params).locale),d=t(l);return <main id="main" className="container page-main"><div className="page-heading"><span className="eyebrow">{d.myPets}</span><h1>{d.dashboardTitle}</h1><p>{d.dashboardText}</p></div><Dashboard locale={l}/></main>;}
