export type Animal = {
  id: string
  species: string
  name: string
  breed: string
  image: string
  alt: string
  description: string
  phrase: string
  facts: string
  weight: string
  lifespan: string
  habitat: string
  wikiUrl: string
  category: 'home' | 'wild'
}

export type City = {
  id: string
  name: string
  timezone: string
  latitude: number
  longitude: number
  zone: string
}

export type AnimalSeed = Omit<Animal, 'wikiUrl'> & { wikipedia: string }

export type AnimalFacts = Pick<Animal, 'image' | 'description' | 'wikiUrl'>

export type BlockKey = 'animal' | 'today' | 'weather' | 'wish' | 'occasion' | 'training'
export type Blocks = Record<BlockKey, boolean>

export type AnimalScope = 'all' | 'home'
export type ThemeMode = 'dark' | 'light'

export type Birthday = { id: string; name: string; date: string }

export type Favorite = { id: string; name: string; breed: string; image: string; addedAt: string }
