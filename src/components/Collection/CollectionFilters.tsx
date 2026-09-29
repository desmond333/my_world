import { memo } from 'react'
import { ANY_TAG } from '../../lib'
import { useTranslation } from '../../lib/i18n'
import type { CollectionFiltersProps } from './types'

export const CollectionFilters = memo(({ tags, tag, periods, periodId, onTag, onPeriod }: CollectionFiltersProps) => {
  const { t } = useTranslation()

  return (
    <div className="collection-filters">
      <label className="filter-field">
        <span>{t('collection.genre')}</span>
        <select value={tag} onChange={(event) => onTag(event.target.value)}>
          <option value={ANY_TAG}>{t('collection.genreAll')}</option>
          {tags.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label className="filter-field">
        <span>{t('collection.period')}</span>
        <select value={periodId} onChange={(event) => onPeriod(event.target.value)}>
          {periods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.id === 'any' ? t('collection.periodAny') : period.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
})

CollectionFilters.displayName = 'CollectionFilters'
