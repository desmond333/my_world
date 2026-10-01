import { memo } from 'react'
import { ANY_TAG } from '../../lib'
import { useTranslation } from '../../lib/i18n'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui'
import type { CollectionFiltersProps } from './types'

export const CollectionFilters = memo(({ tags, tag, periods, periodId, onTag, onPeriod }: CollectionFiltersProps) => {
  const { t } = useTranslation()

  return (
    <div className="collection-filters">
      <div className="filter-field">
        <span>{t('collection.genre')}</span>
        <Select value={tag} onValueChange={onTag}>
          <SelectTrigger aria-label={t('collection.genre')}>
            <SelectValue placeholder={t('collection.genreAll')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_TAG}>{t('collection.genreAll')}</SelectItem>
            {tags.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="filter-field">
        <span>{t('collection.period')}</span>
        <Select value={periodId} onValueChange={onPeriod}>
          <SelectTrigger aria-label={t('collection.period')}>
            <SelectValue placeholder={t('collection.periodAny')} />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period) => (
              <SelectItem key={period.id} value={period.id}>
                {period.id === 'any' ? t('collection.periodAny') : period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
})

CollectionFilters.displayName = 'CollectionFilters'
