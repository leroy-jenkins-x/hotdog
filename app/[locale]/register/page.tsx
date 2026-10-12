import { localeOf,t } from '@/lib/i18n';
import { metadata } from '@/lib/seo';
import { Registration } from '@/components/site/register';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const l=localeOf((await params).locale);return metadata(l,'/register',t(l).addPet,t(l).registerText,true);}
export default async function Page({params}:{params:Promise<{locale:string}>}){return <main id="main" className="container page-main"><Registration locale={localeOf((await params).locale)}/></main>;}
