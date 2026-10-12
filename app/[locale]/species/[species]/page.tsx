import { notFound } from 'next/navigation';
import { localeOf,t } from '@/lib/i18n';
import { metadata,JsonLd } from '@/lib/seo';
import { speciesContent } from '@/lib/species-content';
import { publicPets,origin } from '@/lib/server';
import { PetCard,Empty,SpeciesIcon } from '@/components/site/ui';
import type { Species } from '@/lib/types';
type Props={params:Promise<{locale:string;species:string}>};
export const dynamic='force-dynamic';
export async function generateMetadata({params}:Props){const {locale:raw,species}=await params,l=localeOf(raw);if(!['dog','cat','snake'].includes(species))return {};const c=speciesContent[l][species as Species];return metadata(l,'/species/'+species,c.title,c.text.slice(0,160));}
export default async function Page({params}:Props){const {locale:raw,species}=await params,l=localeOf(raw);if(!['dog','cat','snake'].includes(species))notFound();const s=species as Species,c=speciesContent[l][s],d=t(l),pets=await publicPets({species:s});return <main id="main" className="container page-main"><JsonLd value={{'@context':'https://schema.org','@type':'CollectionPage',name:c.title,description:c.text,inLanguage:l,url:`${origin()}/${l}/species/${s}`}}/><div className="page-heading"><span className="eyebrow"><SpeciesIcon species={s} size={19}/>{d.explore}</span><h1>{c.title}</h1><p>{c.text}</p></div><div className="results-bar"><span>{pets.length} {d.results}</span><a className="text-link" href={`/${l}/pets?species=${s}`}>{d.filters} ↗</a></div>{pets.length?<div className="pet-grid">{pets.map(p=><PetCard pet={p} locale={l} key={p.id}/>)}</div>:<Empty title={d.noResults} text={d.noResultsText} locale={l}/>}</main>;}
