export const cityCookie = 'rodnya_city';
export const suggestedCities = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Краснодар', 'Алматы', 'Астана', 'Шымкент', 'Караганда', 'Ташкент', 'Самарканд', 'Бухара', 'Минск', 'Бишкек', 'Ереван', 'Тбилиси', 'Баку'];
const aliases: Record<string, string> = {
  moscow: 'Москва', moskva: 'Москва', мәскеу: 'Москва',
  'saint petersburg': 'Санкт-Петербург', 'st petersburg': 'Санкт-Петербург', 'st. petersburg': 'Санкт-Петербург',
  kazan: 'Казань', novosibirsk: 'Новосибирск', yekaterinburg: 'Екатеринбург', ekaterinburg: 'Екатеринбург', krasnodar: 'Краснодар',
  almaty: 'Алматы', almati: 'Алматы', 'алма-ата': 'Алматы', astana: 'Астана', 'nur-sultan': 'Астана', 'нур-султан': 'Астана',
  shymkent: 'Шымкент', chimkent: 'Шымкент', karaganda: 'Караганда', qaragandy: 'Караганда', қарағанды: 'Караганда',
  tashkent: 'Ташкент', toshkent: 'Ташкент', ташкент: 'Ташкент', samarkand: 'Самарканд', samarqand: 'Самарканд', bukhara: 'Бухара', buxoro: 'Бухара',
  minsk: 'Минск', bishkek: 'Бишкек', yerevan: 'Ереван', tbilisi: 'Тбилиси', baku: 'Баку',
};
export type CityPreference = { city: string; source: 'auto' | 'manual' };
export function normalizeCity(value: unknown): string {
  if (typeof value !== 'string') return '';
  const clean = value.normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, '').trim().replace(/\s+/g, ' ').slice(0, 80);
  const key = clean.toLocaleLowerCase().replace(/ё/g, 'е');
  return aliases[key] || suggestedCities.find(city => city.toLocaleLowerCase() === key) || clean;
}
export function readCityPreference(value?: string): CityPreference | null {
  if (!value) return null;
  try {
    const p = JSON.parse(decodeURIComponent(value));
    if (typeof p.city !== 'string' || !['manual', 'auto'].includes(p.source)) return null;
    return { city: normalizeCity(p.city), source: p.source };
  } catch { return null; }
}
export function detectedCity(request: Request): string | null {
  // Only use edge metadata, never a caller-supplied city header. No IP or coordinates are stored.
  const cf = (request as Request & { cf?: { city?: string } }).cf;
  return normalizeCity(cf?.city) || null;
}
