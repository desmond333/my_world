import { ChartNoAxesColumn } from 'lucide-react'
import { POINTS, monthKey, monthName, sortMonths, sumMonths } from '../../../../lib'
import { countText, useTranslation } from '../../../../lib/i18n'
import { useProductivityStore } from '../../../../store'

const KINDS = Object.keys(POINTS) as (keyof typeof POINTS)[]

export const StatusPage = () => {
  const { lang, t, locale } = useTranslation()
  const months = useProductivityStore((state) => state.months)
  const current = monthKey()
  const currentMonth = months[current]
  const total = sumMonths(months)
  const keys = sortMonths(months)

  return (
    <div className="status-panel">
      <div className="status-head">
        <h2>{t('productivity.status.title')}</h2>
        <p className="status-total">
          {total.points.toLocaleString(locale)}{' '}
          <span>{t('productivity.status.total', undefined, { count: countText('productivity.point', total.points, lang) })}</span>
        </p>
      </div>

      <div className="status-grid">
        {KINDS.map((kind) => (
          <div className="status-card" key={kind}>
            <span className="status-card-label">{t(`productivity.kind.${kind}`)}</span>
            <span className="status-card-points">+{POINTS[kind]}</span>
            <span className="status-card-count">
              {t('productivity.status.counts', undefined, {
                month: countText(`productivity.count.${kind}`, currentMonth?.counts[kind] ?? 0, lang),
                total: countText(`productivity.count.${kind}`, total.counts[kind], lang),
              })}
            </span>
          </div>
        ))}
      </div>

      <div className="status-months">
        <h3>{t('productivity.status.months')}</h3>
        {keys.length === 0 ? (
          <p className="point-empty">{t('productivity.status.empty')}</p>
        ) : (
          <ul className="status-month-list">
            {keys.map((key) => (
              <li className="status-month" key={key}>
                <span className="status-month-name">
                  {monthName(key, locale)}
                  {key === current && <em>{t('productivity.status.current')}</em>}
                </span>
                <span className="status-month-points">{months[key].points.toLocaleString(locale)}</span>
                <span className="status-month-counts">
                  {KINDS.map((kind) => countText(`productivity.count.${kind}`, months[key].counts[kind], lang)).join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="placeholder-note">
        <ChartNoAxesColumn size={15} /> {t('productivity.status.note')}
      </p>
    </div>
  )
}
