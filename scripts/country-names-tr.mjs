const ISO_ALPHA2_BY_UEFA_CODE = {
  AUT: 'AT', AZE: 'AZ', BEL: 'BE', CZE: 'CZ', DEN: 'DK', ENG: 'GB',
  ESP: 'ES', FRA: 'FR', GER: 'DE', GRE: 'GR', ITA: 'IT', NED: 'NL',
  NOR: 'NO', POL: 'PL', POR: 'PT', SCO: 'GB', SRB: 'RS', SUI: 'CH',
  SVK: 'SK', SWE: 'SE', TUR: 'TR', UKR: 'UA', CRO: 'HR', HUN: 'HU',
  ISR: 'IL', KAZ: 'KZ', ROU: 'RO', SVN: 'SI', BUL: 'BG', CYP: 'CY',
}

const OVERRIDES = {
  ENG: 'İngiltere',
  SCO: 'İskoçya',
}

const displayNames = new Intl.DisplayNames(['tr'], { type: 'region' })

export function countryNameTr(uefaCode, fallback) {
  if (OVERRIDES[uefaCode]) return OVERRIDES[uefaCode]
  const alpha2 = ISO_ALPHA2_BY_UEFA_CODE[uefaCode]
  return alpha2 ? (displayNames.of(alpha2) ?? fallback) : fallback
}
