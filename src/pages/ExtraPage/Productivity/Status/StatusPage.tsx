import { ChartNoAxesColumn } from 'lucide-react'
import { KIND_FORMS, KIND_TITLES, POINTS, monthKey, monthName, plural, sortMonths, sumMonths, withCount } from '../../../../lib'
import { useProductivityStore } from '../../../../store'

const KINDS = Object.keys(POINTS) as (keyof typeof POINTS)[]

export const StatusPage = () => {
  const months = useProductivityStore((state) => state.months)
  const current = monthKey()
  const currentMonth = months[current]
  const total = sumMonths(months)
  const keys = sortMonths(months)

  return (
    <div className="status-panel">
      <div className="status-head">
        <h2>Баллы</h2>
        <p className="status-total">
          {total.points.toLocaleString('ru-RU')} <span>{plural(total.points, ['балл', 'балла', 'баллов'])} всего</span>
        </p>
      </div>

      <div className="status-grid">
        {KINDS.map((kind) => (
          <div className="status-card" key={kind}>
            <span className="status-card-label">{KIND_TITLES[kind]}</span>
            <span className="status-card-points">+{POINTS[kind]}</span>
            <span className="status-card-count">
              {withCount(currentMonth?.counts[kind] ?? 0, KIND_FORMS[kind])} в этом месяце ·{' '}
              {withCount(total.counts[kind], KIND_FORMS[kind])} всего
            </span>
          </div>
        ))}
      </div>

      <div className="status-months">
        <h3>По месяцам</h3>
        {keys.length === 0 ? (
          <p className="point-empty">Пока нет выполненных дел. Баллы появятся здесь автоматически.</p>
        ) : (
          <ul className="status-month-list">
            {keys.map((key) => (
              <li className="status-month" key={key}>
                <span className="status-month-name">
                  {monthName(key)}
                  {key === current && <em>текущий</em>}
                </span>
                <span className="status-month-points">{months[key].points.toLocaleString('ru-RU')}</span>
                <span className="status-month-counts">
                  {KINDS.map((kind) => withCount(months[key].counts[kind], KIND_FORMS[kind])).join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="placeholder-note">
        <ChartNoAxesColumn size={15} /> В начале месяца прошлый месяц остаётся в списке и больше не меняется.
      </p>
    </div>
  )
}
