import type { Locale } from './types';
const ru = {
  language: 'Язык', allCities: 'Все города', changeCity: 'Выбрать город', cityTitle: 'Где ищем пару?',
  cityHint: 'Город определяется приблизительно. Вы всегда можете выбрать другой.', cityInput: 'Ваш город', cityPlaceholder: 'Начните вводить название',
  applyCity: 'Выбрать этот город', detectCity: 'Определить город автоматически', detecting: 'Определяем город…',
  geoUnavailable: 'Не удалось определить город. Выберите его вручную или смотрите все города.', autoCity: 'Определён автоматически', manualCity: 'Выбран вами',
  pairSearch: 'Найти пару', searchTitle: 'Найдём пару вашему питомцу', searchHint: 'Выберите вид и пол пары. Родословную и условия можно обсудить с владельцем.',
  queryLabel: 'Порода, морфа или имя', queryPlaceholder: 'Например, корги или британская', partnerSex: 'Пол пары', anySex: 'Любой',
  scope: 'Какие анкеты показать', breedingOnly: 'Для обсуждения пары', allProfiles: 'Все анкеты',
  noLocal: 'В городе «{city}» пока нет подходящих анкет. Показываем варианты в других городах с теми же фильтрами.',
  searchingIn: 'Ищем в городе', searchingEverywhere: 'Ищем во всех городах', fallbackHint: 'Если в вашем городе нет подходящих анкет, покажем другие города.',
  noPairs: 'Подходящей пары пока не нашли', noPairsText: 'Мы проверили и другие города. Попробуйте другую породу или уменьшите число фильтров.',
  breedingStatus: 'Открыт к обсуждению пары', locationUnavailable: 'Город можно выбрать вручную',
};
export type SearchCopy = typeof ru;
const kk: SearchCopy = {
  language: 'Тіл', allCities: 'Барлық қалалар', changeCity: 'Қаланы таңдау', cityTitle: 'Жұпты қай жерден іздейміз?',
  cityHint: 'Қала шамамен анықталады. Оны кез келген уақытта өзгерте аласыз.', cityInput: 'Қалаңыз', cityPlaceholder: 'Қала атауын енгізіңіз',
  applyCity: 'Осы қаланы таңдау', detectCity: 'Қаланы автоматты анықтау', detecting: 'Қаланы анықтап жатырмыз…',
  geoUnavailable: 'Қаланы анықтау мүмкін болмады. Қолмен таңдаңыз немесе барлық қалаларды қараңыз.', autoCity: 'Автоматты анықталды', manualCity: 'Өзіңіз таңдадыңыз',
  pairSearch: 'Жұп табу', searchTitle: 'Жануарыңызға жұп табайық', searchHint: 'Жұптың түрі мен жынысын таңдаңыз. Шежіре мен шарттарды иесімен талқылауға болады.',
  queryLabel: 'Тұқымы, морфасы немесе аты', queryPlaceholder: 'Мысалы, корги немесе британдық', partnerSex: 'Жұптың жынысы', anySex: 'Кез келген',
  scope: 'Қандай анкеталарды көрсету керек', breedingOnly: 'Жұптауды талқылау үшін', allProfiles: 'Барлық анкеталар',
  noLocal: '«{city}» қаласында сәйкес анкеталар әзірге жоқ. Сол сүзгілермен басқа қалалардағы нұсқаларды көрсетеміз.',
  searchingIn: 'Іздеу қаласы', searchingEverywhere: 'Барлық қалалардан іздейміз', fallbackHint: 'Қалаңызда сәйкес анкета болмаса, басқа қалаларды көрсетеміз.',
  noPairs: 'Сәйкес жұп әзірге табылмады', noPairsText: 'Басқа қалаларды да тексердік. Басқа тұқымды таңдаңыз немесе сүзгілерді азайтыңыз.',
  breedingStatus: 'Жұптауды талқылауға ашық', locationUnavailable: 'Қаланы қолмен таңдауға болады',
};
const uz: SearchCopy = {
  language: 'Til', allCities: 'Barcha shaharlar', changeCity: 'Shaharni tanlash', cityTitle: 'Juftni qayerdan izlaymiz?',
  cityHint: 'Shahar taxminan aniqlanadi. Uni istalgan vaqtda o‘zgartirishingiz mumkin.', cityInput: 'Shahringiz', cityPlaceholder: 'Shahar nomini kiriting',
  applyCity: 'Shu shaharni tanlash', detectCity: 'Shaharni avtomatik aniqlash', detecting: 'Shahar aniqlanmoqda…',
  geoUnavailable: 'Shaharni aniqlab bo‘lmadi. Qo‘lda tanlang yoki barcha shaharlarni ko‘ring.', autoCity: 'Avtomatik aniqlandi', manualCity: 'Siz tanlagansiz',
  pairSearch: 'Juft topish', searchTitle: 'Jonivoringizga juft topaylik', searchHint: 'Juftning turi va jinsini tanlang. Nasabnoma va shartlarni egasi bilan muhokama qilishingiz mumkin.',
  queryLabel: 'Zoti, morfasi yoki ismi', queryPlaceholder: 'Masalan, korgi yoki britan', partnerSex: 'Juftning jinsi', anySex: 'Istalgan',
  scope: 'Qaysi anketalarni ko‘rsatish', breedingOnly: 'Juftlashishni muhokama qilish uchun', allProfiles: 'Barcha anketalar',
  noLocal: '«{city}» shahrida mos anketalar hozircha yo‘q. Shu filtrlar bilan boshqa shaharlardagi variantlarni ko‘rsatamiz.',
  searchingIn: 'Qidiruv shahri', searchingEverywhere: 'Barcha shaharlardan izlaymiz', fallbackHint: 'Shahringizda mos anketa bo‘lmasa, boshqa shaharlarni ko‘rsatamiz.',
  noPairs: 'Mos juft hozircha topilmadi', noPairsText: 'Boshqa shaharlarni ham tekshirdik. Boshqa zotni tanlang yoki filtrlarni kamaytiring.',
  breedingStatus: 'Juftlashishni muhokama qilishga ochiq', locationUnavailable: 'Shaharni qo‘lda tanlash mumkin',
};
export function searchCopy(locale: Locale): SearchCopy { return { ru, kk, uz }[locale]; }
