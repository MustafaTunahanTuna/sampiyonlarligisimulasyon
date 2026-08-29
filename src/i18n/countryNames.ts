import type { Locale } from './locale'

const COUNTRY_NAMES: Record<Locale, Record<string, string>> = {
  tr: {
    AUT: 'Avusturya',
    AZE: 'Azerbaycan',
    BEL: 'Belçika',
    CZE: 'Çekya',
    ENG: 'İngiltere',
    ESP: 'İspanya',
    FRA: 'Fransa',
    GER: 'Almanya',
    GRE: 'Yunanistan',
    ITA: 'İtalya',
    NED: 'Hollanda',
    NOR: 'Norveç',
    POR: 'Portekiz',
    SVK: 'Slovakya',
    TUR: 'Türkiye',
    UKR: 'Ukrayna',
  },
  en: {
    AUT: 'Austria',
    AZE: 'Azerbaijan',
    BEL: 'Belgium',
    CZE: 'Czechia',
    ENG: 'England',
    ESP: 'Spain',
    FRA: 'France',
    GER: 'Germany',
    GRE: 'Greece',
    ITA: 'Italy',
    NED: 'Netherlands',
    NOR: 'Norway',
    POR: 'Portugal',
    SVK: 'Slovakia',
    TUR: 'Türkiye',
    UKR: 'Ukraine',
  },
}

export function countryNameOf(team: { countryCode: string; countryName: string }, locale: Locale): string {
  return COUNTRY_NAMES[locale][team.countryCode] ?? team.countryName
}
