import { memo } from 'react'
import { ANY_TAG } from '../../lib'
import type { CollectionFiltersProps } from './types'

export const CollectionFilters = memo(({ tags, tag, periods, periodId, onTag, onPeriod }: CollectionFiltersProps) => (
  <div className="collection-filters">
    <label className="filter-field">
      <span>Жанр</span>
      <select value={tag} onChange={(event) => onTag(event.target.value)}>
        <option value={ANY_TAG}>Все жанры</option>
        {tags.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
    <label className="filter-field">
      <span>Период</span>
      <select value={periodId} onChange={(event) => onPeriod(event.target.value)}>
        {periods.map((period) => (
          <option key={period.id} value={period.id}>
            {period.label}
          </option>
        ))}
      </select>
    </label>
  </div>
))

CollectionFilters.displayName = 'CollectionFilters'
