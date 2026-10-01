import { createCollectionStore } from './createCollectionStore'
import { STORAGE_KEYS } from '../../lib/storage'

export const useGamesStore = createCollectionStore(STORAGE_KEYS.games)
