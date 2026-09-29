import type { Animal } from '../../data'

export const findAnimal = (list: Animal[], id: string, name?: string, breed?: string) =>
  list.find((animal) => animal.id === id) ?? list.find((animal) => animal.name === name && animal.breed === breed)
