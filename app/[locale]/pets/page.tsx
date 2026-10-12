import { Search, X, SlidersHorizontal, MapPin, Info } from 'lucide-react';
import { cookies } from 'next/headers';
import { localeOf, t } from '@/lib/i18n';
import { metadata, JsonLd } from '@/lib/seo';
import { searchPets, origin } from '@/lib/server';
import { cityCookie, normalizeCity, readCityPreference } from '@/lib/cities';
import { searchCopy } from '@/lib/search-i18n';
import { PreferredCityInput } from '@/components/site/preferences';
import { PetCard, Empty } from '@/components/site/ui';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export const dynamic = 'force-dynamic';
async function filters(searchParams: Props['searchParams']) {
  const p = await searchParams, value = (key: string) => typeof p[key] === 'string' ? p[key] as string : '';
  const saved = readCityPreference((await cookies()).get(cityCookie)?.value);
  return { p, species: value('species'), city: normalizeCity('city' in p ? value('city') : saved?.city), q: value('q').trim().slice(0, 120), lineage: value('lineage') === '1', breeding: value('purpose') !== 'all', sex: ['male', 'female'].includes(value('sex')) ? value('sex') : '' };
}
export async function generateMetadata({ params, searchParams }: Props) {
  const locale = localeOf((await params).locale), f = await filters(searchParams), copy = searchCopy(locale);
  return metadata(locale, '/pets', copy.searchTitle, copy.searchHint, Object.keys(f.p).length > 0 || Boolean(f.city));
}
export default async function Catalog({ params, searchParams }: Props) {
  const locale = localeOf((await params).locale), d = t(locale), copy = searchCopy(locale), f = await filters(searchParams);
  const { pets, expanded } = await searchPets(f);
  return <main id="main" className="container page-main">
    <JsonLd value={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: d.brand, item: `${origin()}/${locale}` }, { '@type': 'ListItem', position: 2, name: copy.pairSearch, item: `${origin()}/${locale}/pets` }] }} />
    <div className="page-heading"><span className="eyebrow">{copy.pairSearch}</span><h1>{f.breeding ? copy.searchTitle : d.catalogTitle}</h1><p>{f.breeding ? copy.searchHint : d.catalogText}</p></div>
    <div className="catalog-layout">
      <aside className="filter-card"><h2><SlidersHorizontal size={19} />{d.filters}</h2>
        <form action={`/${locale}/pets`}>
          <label>{copy.scope}<select name="purpose" defaultValue={f.breeding ? 'breeding' : 'all'}><option value="breeding">{copy.breedingOnly}</option><option value="all">{copy.allProfiles}</option></select></label>
          <label>{copy.queryLabel}<input name="q" defaultValue={f.q} placeholder={copy.queryPlaceholder} maxLength={120} /></label>
          <label>{d.species}<select name="species" defaultValue={f.species}><option value="">{d.all}</option><option value="dog">{d.dogs}</option><option value="cat">{d.cats}</option><option value="snake">{d.snakes}</option></select></label>
          <label>{copy.partnerSex}<select name="sex" defaultValue={f.sex}><option value="">{copy.anySex}</option><option value="male">{d.male}</option><option value="female">{d.female}</option></select></label>
          <label>{d.city}<PreferredCityInput locale={locale} initial={f.city} /></label>
          <label className="check-label"><input type="checkbox" name="lineage" value="1" defaultChecked={f.lineage} />{d.withLineage}</label>
          <button className="button button-dark full" type="submit"><Search size={17} />{copy.pairSearch}</button>
          <a className="filter-clear" href={`/${locale}/pets?city=${encodeURIComponent(f.city)}&purpose=breeding`}><X size={14} />{d.clear}</a>
        </form><p className="filter-help">{copy.fallbackHint}</p>
      </aside>
      <div className="catalog-results">
        {expanded && <div className="search-expansion" role="status"><Info size={20} aria-hidden="true" /><p>{copy.noLocal.replace('{city}', f.city)}</p></div>}
        <div className="results-bar"><strong>{pets.length} <span>{d.results}</span></strong><span className="results-city"><MapPin size={14} />{expanded || !f.city ? copy.allCities : f.city}</span><a href={`/${locale}/register`} className="text-link">{d.addPet} +</a></div>
        {pets.length ? <div className="pet-grid catalog-grid">{pets.map(p => <PetCard key={p.id} pet={p} locale={locale} />)}</div> : <Empty title={copy.noPairs} text={copy.noPairsText} locale={locale} />}
      </div>
    </div>
  </main>;
}
