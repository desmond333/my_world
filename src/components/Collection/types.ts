import type { CollectionDetails, CollectionItem, CollectionListKey, CollectionListOption, PeriodOption, SearchCandidate } from '../../data'

export type ItemLocation = CollectionListKey | null

export type CollectionDetailsConfig = {
  label: string
  load: (id: string, signal: AbortSignal) => Promise<CollectionDetails>
}

export type CollectionLinkConfig = {
  label: string
  href: (title: string) => string
}

export type CollectionSearchConfig = {
  kicker: string
  panelTitle: string
  fieldLabel: string
  placeholder: string
  minLength: number
  configured: boolean
  notConfiguredHint: string
  run: (term: string, signal: AbortSignal) => Promise<SearchCandidate[]>
  details?: CollectionDetailsConfig
  online?: CollectionLinkConfig
}

export type CollectionDescriptor = {
  kicker: string
  heading: string
  intro: string
  lists: CollectionListOption[]
  search: CollectionSearchConfig
}

export type CollectionActions = {
  add: (list: CollectionListKey, candidate: SearchCandidate) => void
  move: (id: string, to: CollectionListKey) => void
  remove: (list: CollectionListKey, id: string) => void
}

export type ResultCardProps = {
  candidate: SearchCandidate
  location: ItemLocation
  lists: CollectionListOption[]
  actions: CollectionActions
  onOpenDetails?: (candidate: SearchCandidate) => void
  detailsLabel?: string
  online?: CollectionLinkConfig
}

export type SearchPanelProps = {
  query: string
  results: SearchCandidate[]
  loading: boolean
  error: string
  config: CollectionSearchConfig
  lists: CollectionListOption[]
  locationOf: (id: string) => ItemLocation
  actions: CollectionActions
  onQuery: (value: string) => void
}

export type CollectionFiltersProps = {
  tags: string[]
  tag: string
  periods: PeriodOption[]
  periodId: string
  onTag: (value: string) => void
  onPeriod: (value: string) => void
}

export type SortableItemRowProps = {
  item: CollectionItem
  list: CollectionListKey
  lists: CollectionListOption[]
  onRemove: (list: CollectionListKey, id: string) => void
  onMove: (id: string, to: CollectionListKey) => void
  online?: CollectionLinkConfig
}

export type CollectionBoardProps = {
  list: CollectionListKey
  items: CollectionItem[]
  counts: Record<CollectionListKey, number>
  lists: CollectionListOption[]
  tags: string[]
  tag: string
  periods: PeriodOption[]
  periodId: string
  online?: CollectionLinkConfig
  onList: (list: CollectionListKey) => void
  onTag: (value: string) => void
  onPeriod: (value: string) => void
  onRemove: (list: CollectionListKey, id: string) => void
  onMove: (id: string, to: CollectionListKey) => void
  onReorder: (orderedIds: string[]) => void
}
