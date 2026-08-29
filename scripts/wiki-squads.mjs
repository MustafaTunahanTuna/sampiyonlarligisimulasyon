const API = 'https://en.wikipedia.org/w/api.php'
const USER_AGENT = 'champions-league-sim/1.0 (squad data build script)'
const BATCH_SIZE = 18

const POSITION_ALIASES = {
  GK: 'GK',
  DF: 'DF',
  CB: 'DF',
  LB: 'DF',
  RB: 'DF',
  LWB: 'DF',
  RWB: 'DF',
  MF: 'MF',
  DM: 'MF',
  CM: 'MF',
  AM: 'MF',
  LM: 'MF',
  RM: 'MF',
  FW: 'FW',
  CF: 'FW',
  ST: 'FW',
  LW: 'FW',
  RW: 'FW',
}

function templateBlocks(wikitext, name) {
  const blocks = []
  const opener = new RegExp(`\\{\\{${name}`, 'gi')
  let match = opener.exec(wikitext)
  while (match !== null) {
    const start = match.index
    let depth = 0
    let cursor = start
    while (cursor < wikitext.length) {
      if (wikitext.startsWith('{{', cursor)) {
        depth += 1
        cursor += 2
        continue
      }
      if (wikitext.startsWith('}}', cursor)) {
        depth -= 1
        cursor += 2
        if (depth === 0) break
        continue
      }
      cursor += 1
    }
    blocks.push({ start, text: wikitext.slice(start, cursor) })
    opener.lastIndex = cursor
    match = opener.exec(wikitext)
  }
  return blocks
}

function splitParameters(block) {
  const body = block.slice(2, -2)
  const parts = []
  let depth = 0
  let current = ''
  for (let index = 0; index < body.length; index += 1) {
    if (body.startsWith('{{', index) || body.startsWith('[[', index)) depth += 1
    if (body.startsWith('}}', index) || body.startsWith(']]', index)) depth -= 1
    const char = body[index]
    if (char === '|' && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }
    current += char
  }
  parts.push(current)
  return parts.slice(1)
}

function parameterMap(block) {
  const values = {}
  for (const part of splitParameters(block)) {
    const separator = part.indexOf('=')
    if (separator === -1) continue
    values[part.slice(0, separator).trim().toLowerCase()] = part.slice(separator + 1).trim()
  }
  return values
}

function cleanName(raw) {
  const linked = raw.match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/)
  const text = linked === null ? raw : (linked[2] ?? linked[1])
  return text
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/''+/g, '')
    .replace(/\s*\((?:footballer|football player)[^)]*\)/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalisePosition(raw) {
  const token = raw.replace(/\{\{[^}]*\}\}/g, '').replace(/[^A-Za-z]/g, '').toUpperCase()
  return POSITION_ALIASES[token] ?? null
}

const EXCLUDED_SECTION = /loan|academy|reserve|youth|women|under[- ]?\d|u\d{2}|former|notable/i

function sectionHeadings(wikitext) {
  const headings = []
  for (const match of wikitext.matchAll(/^==+\s*(.+?)\s*==+\s*$/gm)) {
    headings.push({ start: match.index, title: match[1] })
  }
  return headings
}

function sectionAt(headings, position) {
  let current = ''
  for (const heading of headings) {
    if (heading.start > position) break
    current = heading.title
  }
  return current
}

export function parseSquad(wikitext) {
  const headings = sectionHeadings(wikitext)
  const players = []
  const seen = new Set()
  for (const block of templateBlocks(wikitext, 'fs player')) {
    const section = sectionAt(headings, block.start)
    if (EXCLUDED_SECTION.test(section)) continue

    const values = parameterMap(block.text)
    if (values.name === undefined) continue
    const name = cleanName(values.name)
    if (name === '' || seen.has(name)) continue
    const position = values.pos === undefined ? null : normalisePosition(values.pos)
    if (position === null) continue
    if (/loan/i.test(values.other ?? '')) continue
    seen.add(name)
    players.push({
      name,
      position,
      number: values.no === undefined ? null : Number.parseInt(values.no, 10) || null,
    })
  }
  return players
}

async function fetchBatch(titles) {
  const url =
    `${API}?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&formatversion=2&redirects=1&titles=` +
    encodeURIComponent(titles.join('|'))
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) throw new Error(`Wikipedia ${response.status} for ${titles.length} sayfa`)
  const payload = await response.json()
  if (payload.query === undefined) throw new Error(`Wikipedia yanıtı beklenmedik: ${JSON.stringify(payload).slice(0, 200)}`)

  const resolved = new Map()
  for (const entry of payload.query.normalized ?? []) resolved.set(entry.from, entry.to)
  for (const entry of payload.query.redirects ?? []) resolved.set(entry.from, entry.to)

  const contentByTitle = new Map()
  for (const page of payload.query.pages) {
    if (page.missing === true) continue
    contentByTitle.set(page.title, page.revisions[0].slots.main.content)
  }

  const byRequestedTitle = new Map()
  for (const title of titles) {
    let target = title
    while (resolved.has(target)) target = resolved.get(target)
    byRequestedTitle.set(title, contentByTitle.get(target) ?? null)
  }
  return byRequestedTitle
}

export async function fetchSquads(titles) {
  const squads = new Map()
  for (let start = 0; start < titles.length; start += BATCH_SIZE) {
    const batch = titles.slice(start, start + BATCH_SIZE)
    const pages = await fetchBatch(batch)
    for (const [title, wikitext] of pages) {
      squads.set(title, wikitext === null ? null : parseSquad(wikitext))
    }
  }
  return squads
}
