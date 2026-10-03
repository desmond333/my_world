import type { AnimalFacts, AnimalSeed } from '../../data/types'

const WIKI_API = 'https://ru.wikipedia.org/api/rest_v1/page/summary/'

type WikiSummary = {
  description?: string
  extract?: string
  content_urls?: { desktop?: { page?: string } }
}

const clean = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300\u0301]/g, '')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim()

const wikiUrl = (seed: AnimalSeed) => `https://ru.wikipedia.org/wiki/${seed.wikipedia}`

export const fetchAnimalFacts = async (seed: AnimalSeed, signal?: AbortSignal): Promise<AnimalFacts> => {
  const response = await fetch(`${WIKI_API}${encodeURIComponent(seed.wikipedia)}`, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`animal:${seed.id}`)
  const data = (await response.json()) as WikiSummary
  const lead = clean(data.extract ?? '')
  const caption = clean(data.description ?? '')
  const description = lead || (caption ? `${caption[0].toUpperCase()}${caption.slice(1)}.` : '')
  return {
    description: description || seed.description,
    wikiUrl: data.content_urls?.desktop?.page ?? wikiUrl(seed),
  }
}
