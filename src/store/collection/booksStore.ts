import { createCollectionStore } from './createCollectionStore'
import { STORAGE_KEYS } from '../../lib/storage'

export const useBooksStore = createCollectionStore(STORAGE_KEYS.books)
