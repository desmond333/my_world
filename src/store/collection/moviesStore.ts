import { createCollectionStore } from './createCollectionStore'
import { STORAGE_KEYS } from '../../lib/storage'

export const useMoviesStore = createCollectionStore(STORAGE_KEYS.movies)
