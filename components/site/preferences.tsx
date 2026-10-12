'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ChevronDown, LocateFixed, MapPin, X } from 'lucide-react';
import type { Locale } from '@/lib/types';
import { cityCookie, normalizeCity, readCityPreference, suggestedCities, type CityPreference } from '@/lib/cities';
import { searchCopy } from '@/lib/search-i18n';
import { t } from '@/lib/i18n';

type CityContext = {
  preference: CityPreference | null; busy: boolean; error: boolean;
  choose: (city: string) => void; detect: () => Promise<boolean>;
};
const City = createContext<CityContext>({ preference: null, busy: false, error: false, choose: () => {}, detect: async () => false });
export const useCity = () => useContext(City);

export function CityProvider({ initial, children }: { initial: CityPreference | null; children: React.ReactNode }) {
  const [preference, setPreference] = useState(initial), [busy, setBusy] = useState(false), [error, setError] = useState(false);
  const revision = useRef(0), pending = useRef<AbortController | null>(null);
  function save(next: CityPreference, navigate: boolean) {
    setPreference(next);
    document.cookie = `${cityCookie}=${encodeURIComponent(JSON.stringify(next))}; Path=/; Max-Age=${next.source === 'manual' ? 31536000 : 604800}; SameSite=Lax; Secure`;
    const url = new URL(window.location.href);
    if (navigate && /^\/(ru|kk|uz)\/pets\/?$/.test(url.pathname) && url.searchParams.get('city') !== next.city) {
      url.searchParams.set('city', next.city);
      window.location.assign(url.pathname + url.search + url.hash);
    }
  }
  function choose(city: string) {
    revision.current++;
    pending.current?.abort();
    setBusy(false); setError(false);
    save({ city: normalizeCity(city), source: 'manual' }, true);
  }
  async function detect(): Promise<boolean> {
    pending.current?.abort();
    const controller = new AbortController(), version = ++revision.current;
    pending.current = controller; setBusy(true); setError(false);
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch('/api/app/location', { signal: controller.signal, cache: 'no-store' });
      if (!response.ok) throw new Error('Location unavailable');
      const data = await response.json() as { city: string | null };
      if (version !== revision.current) return false;
      const city = normalizeCity(data.city);
      if (!city) { setError(true); return false; }
      save({ city, source: 'auto' }, true);
      return true;
    } catch { if (version === revision.current) setError(true); return false; }
    finally { clearTimeout(timer); if (version === revision.current) setBusy(false); }
  }
  useEffect(() => {
    const url = new URL(window.location.href);
    const saved = readCityPreference(document.cookie.split('; ').find(c => c.startsWith(cityCookie + '='))?.slice(cityCookie.length + 1));
    if (/^\/(ru|kk|uz)\/pets\/?$/.test(url.pathname) && url.searchParams.has('city')) {
      const city = normalizeCity(url.searchParams.get('city'));
      save({ city, source: saved?.city === city ? saved.source : 'manual' }, false);
    } else if (saved) setPreference(saved);
    else void detect();
    return () => { revision.current++; pending.current?.abort(); };
  }, []);
  return <City.Provider value={{ preference, busy, error, choose, detect }}>{children}</City.Provider>;
}

export function CityPicker({ locale }: { locale: Locale }) {
  const city = useCity(), copy = searchCopy(locale), d = t(locale);
  const dialog = useRef<HTMLDialogElement>(null), opener = useRef<HTMLButtonElement>(null), [draft, setDraft] = useState('');
  function close() { dialog.current?.close(); opener.current?.focus(); }
  function apply(value: string) { city.choose(value); close(); }
  return <>
    <button ref={opener} id="city-picker" type="button" className="city-trigger" aria-haspopup="dialog" aria-label={`${copy.changeCity}: ${city.preference?.city || copy.allCities}`} title={city.preference?.source === 'auto' ? copy.autoCity : copy.manualCity} onClick={() => { setDraft(city.preference?.city || ''); dialog.current?.showModal(); }}>
      <MapPin size={16} aria-hidden="true" /><span>{city.preference?.city || copy.allCities}</span><ChevronDown size={13} aria-hidden="true" />
    </button>
    <dialog ref={dialog} className="modal city-modal" aria-labelledby="city-title" onClose={() => opener.current?.focus()} onClick={e => { if (e.target === dialog.current) close(); }}>
      <button className="icon-button modal-close" type="button" onClick={close} aria-label={d.close}><X size={20} /></button>
      <span className="round-icon"><MapPin size={25} /></span><h2 id="city-title">{copy.cityTitle}</h2><p className="muted">{copy.cityHint}</p>
      <form onSubmit={e => { e.preventDefault(); if (draft.trim()) apply(draft); }}>
        <label className="field-label">{copy.cityInput}<input autoComplete="address-level2" list="header-cities" value={draft} maxLength={80} required placeholder={copy.cityPlaceholder} onChange={e => setDraft(e.target.value)} /></label>
        <datalist id="header-cities">{suggestedCities.map(c => <option value={c} key={c} />)}</datalist>
        <button className="button button-primary full" type="submit">{copy.applyCity}</button>
      </form>
      <div className="city-options">{suggestedCities.slice(0, 9).map(c => <button type="button" key={c} onClick={() => apply(c)}>{c}</button>)}</div>
      <div className="city-secondary"><button type="button" className="text-link" disabled={city.busy} onClick={async () => { if (await city.detect()) close(); }}><LocateFixed size={17} />{city.busy ? copy.detecting : copy.detectCity}</button><button type="button" className="text-link" onClick={() => apply('')}>{copy.allCities}</button></div>
      {city.error && <p className="soft-note" role="status">{copy.geoUnavailable}</p>}
    </dialog>
  </>;
}

export function PreferredCityInput({ locale, initial }: { locale: Locale; initial: string }) {
  const city = useCity(), [value, setValue] = useState(initial), copy = searchCopy(locale);
  useEffect(() => { if (city.preference) setValue(city.preference.city); }, [city.preference]);
  return <><input name="city" value={value} onChange={e => setValue(e.target.value)} onBlur={() => setValue(normalizeCity(value))} placeholder={copy.allCities} list="filter-cities" maxLength={80} /><datalist id="filter-cities">{suggestedCities.map(c => <option value={c} key={c} />)}</datalist></>;
}
