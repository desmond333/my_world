import { useCallback, useMemo, useState } from 'react'
import { anyPeriod, findPeriod, periodOptions } from '../../data'
import type { CollectionListKey, SearchCandidate } from '../../data'
import { useRemoteSearch } from '../../hooks'
import { ANY_TAG, filterItems, tagOptions, toCollectionItem } from '../../lib'
import { ViewModeToggle } from '../../shared/ui'
import { type CollectionStore, usePageViewMode } from '../../store'
import { CollectionBoard } from './CollectionBoard'
import { SearchPanel } from './SearchPanel'
import type { CollectionDescriptor, ItemLocation } from './types'
import './Collection.css'

export type CollectionViewProps = { descriptor: CollectionDescriptor; store: CollectionStore }

export const CollectionView = ({ descriptor, store }: CollectionViewProps) => {
  const useStore = store
  const wishlist = useStore((state) => state.wishlist)
  const watched = useStore((state) => state.watched)
  const add = useStore((state) => state.add)
  const remove = useStore((state) => state.remove)
  const move = useStore((state) => state.move)
  const reorder = useStore((state) => state.reorder)
  const updateItem = useStore((state) => state.updateItem)

  const [list, setList] = useState<CollectionListKey>('wishlist')
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState(ANY_TAG)
  const [periodId, setPeriodId] = useState(anyPeriod.id)

  const search = useRemoteSearch(query, descriptor.search.run, {
    minLength: descriptor.search.minLength,
    enabled: descriptor.search.configured,
  })

  const stored = list === 'wishlist' ? wishlist : watched
  const period = findPeriod(periodId)
  const visible = useMemo(() => filterItems(stored, tag, period), [stored, tag, period])
  const tags = useMemo(() => tagOptions(stored), [stored])

  const actions = useMemo(
    () => ({
      add: (target: CollectionListKey, candidate: SearchCandidate) => add(target, toCollectionItem(candidate)),
      move,
      remove,
    }),
    [add, move, remove],
  )

  const locationOf = useMemo(() => {
    const places = new Map<string, CollectionListKey>()
    wishlist.forEach((item) => places.set(item.id, 'wishlist'))
    watched.forEach((item) => places.set(item.id, 'watched'))
    return (id: string): ItemLocation => places.get(id) ?? null
  }, [wishlist, watched])

  const switchList = useCallback((next: CollectionListKey) => {
    setList(next)
    setTag(ANY_TAG)
  }, [])

  const counts = useMemo(() => ({ wishlist: wishlist.length, watched: watched.length }), [wishlist, watched])

  const handleReorder = useCallback(
    (orderedIds: string[]) => {
      reorder(list, orderedIds)
    },
    [list, reorder],
  )

  const { isNormal, mode, setMode } = usePageViewMode('media')

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
        <ViewModeToggle mode={mode} onChange={setMode} size="sm" />
      </div>

      <SearchPanel
        query={query}
        results={search.items}
        loading={search.loading}
        error={search.error}
        config={descriptor.search}
        lists={descriptor.lists}
        locationOf={locationOf}
        actions={actions}
        onQuery={setQuery}
      />
      <CollectionBoard
        list={list}
        items={visible}
        counts={counts}
        lists={descriptor.lists}
        tags={isNormal ? tags : []}
        tag={tag}
        periods={isNormal ? periodOptions : []}
        periodId={periodId}
        online={descriptor.search.online}
        onList={switchList}
        onTag={setTag}
        onPeriod={setPeriodId}
        onRemove={remove}
        onMove={move}
        onReorder={handleReorder}
        onUpdateItem={updateItem}
      />
    </>
  )
}
