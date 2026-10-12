'use client';
import { ArrowRight, MapPin, Search } from 'lucide-react';
import { t } from '@/lib/i18n';
import { searchCopy } from '@/lib/search-i18n';
import type { Locale } from '@/lib/types';
import { useCity } from './preferences';

export function PairSearch({ locale }: { locale: Locale }) {
  const d = t(locale), copy = searchCopy(locale), city = useCity();
  return <div className="pair-search-area">
    <form action={`/${locale}/pets`} className="hero-search pair-search" aria-label={copy.pairSearch}>
      <input type="hidden" name="purpose" value="breeding" /><input type="hidden" name="city" value={city.preference?.city || ''} />
      <label className="pair-query"><span>{copy.queryLabel}</span><div><Search size={18} aria-hidden="true" /><input name="q" placeholder={copy.queryPlaceholder} maxLength={120} /></div></label>
      <label><span>{d.species}</span><select name="species"><option value="">{d.all}</option><option value="dog">{d.dogs}</option><option value="cat">{d.cats}</option><option value="snake">{d.snakes}</option></select></label>
      <label><span>{copy.partnerSex}</span><select name="sex"><option value="">{copy.anySex}</option><option value="male">{d.male}</option><option value="female">{d.female}</option></select></label>
      <button type="submit" className="button button-dark">{copy.pairSearch}<ArrowRight size={18} /></button>
    </form>
    <p className="search-location"><MapPin size={14} aria-hidden="true" /><span>{city.busy ? copy.detecting : city.preference?.city ? `${copy.searchingIn}: ${city.preference.city}` : copy.searchingEverywhere}. {copy.fallbackHint}</span></p>
  </div>;
}
