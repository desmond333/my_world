import { animalSeeds } from '../data'
import type { Animal, AnimalFacts, AnimalSeed } from '../data/types'

const WIKI_API = 'https://ru.wikipedia.org/api/rest_v1/page/summary/'

type WikiSummary = {
  title?: string
  description?: string
  extract?: string
  thumbnail?: { source?: string }
  originalimage?: { source?: string }
  content_urls?: { desktop?: { page?: string } }
}

const COMBINING_MARKS = /[̀-ͯ]/g

const clean = (text: string) => text.replace(COMBINING_MARKS, '').replace(/\s+/g, ' ').trim()

const widen = (source: string) => source.replace(/\/\d+px-/, '/1280px-')

const wikiUrl = (seed: AnimalSeed) => `https://ru.wikipedia.org/wiki/${seed.wikipedia}`

export const fetchAnimalFacts = async (seed: AnimalSeed, signal?: AbortSignal): Promise<AnimalFacts> => {
  const response = await fetch(`${WIKI_API}${encodeURIComponent(seed.wikipedia)}`, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`animal:${seed.id}`)
  const data = (await response.json()) as WikiSummary
  const lead = clean(data.extract ?? '')
  const caption = clean(data.description ?? '')
  const description = lead || (caption ? `${caption[0].toUpperCase()}${caption.slice(1)}.` : '')
  const picture = widen(data.originalimage?.source ?? data.thumbnail?.source ?? '')
  return {
    image: picture || seed.image,
    description: description || seed.description,
    wikiUrl: data.content_urls?.desktop?.page ?? wikiUrl(seed),
  }
}

export type AnimalsLoadResult = { animals: Animal[]; fromApi: number; failed: string[] }

export const loadAnimals = async (signal?: AbortSignal): Promise<AnimalsLoadResult> => {
  const results = await Promise.allSettled(animalSeeds.map((seed) => fetchAnimalFacts(seed, signal)))
  const failed: string[] = []
  let fromApi = 0
  const animals = animalSeeds.map((seed, index) => {
    const result = results[index]
    if (result.status === 'fulfilled') {
      fromApi += 1
      return { ...seed, ...result.value }
    }
    failed.push(seed.id)
    return { ...seed, wikiUrl: wikiUrl(seed) }
  })
  return { animals, fromApi, failed }
}
