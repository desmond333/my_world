import { useCallback, useEffect, useRef, useState } from 'react'
import { Gift, Sparkles, Ticket, X } from 'lucide-react'
import {
  DEFAULT_VARIANT_ID,
  LOTTERY_VARIANTS,
  chanceText,
  draw,
  expectedWins,
  findVariant,
  landingAngle,
  oddsText,
  prizeText,
  withCount,
} from '../../../lib'
import { useLotteryStore } from '../../../store'
import { LotteryWheel } from './LotteryWheel'
import './Lottery.css'

const SPIN_MS = 3200
const BATCH = 100

const compact = (value: number) => value.toLocaleString('ru-RU', { maximumFractionDigits: value < 10 ? 2 : 0 })

export const LotteryPage = () => {
  const [id, setId] = useState(DEFAULT_VARIANT_ID)
  const [angle, setAngle] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<{ won: boolean; id: number } | null>(null)
  const stats = useLotteryStore((state) => state.stats)
  const record = useLotteryStore((state) => state.record)
  const reset = useLotteryStore((state) => state.reset)
  const timer = useRef(0)

  const variant = findVariant(id)
  const current = stats[id] ?? { spins: 0, wins: 0, earned: 0 }
  const expected = expectedWins(variant, current.spins)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const spin = useCallback(() => {
    if (spinning) return
    const won = draw(variant)
    setResult(null)
    setSpinning(true)
    setAngle((value) => value + landingAngle(variant, won))
    record(variant.id, won, variant.prize)
    timer.current = window.setTimeout(() => {
      setSpinning(false)
      setResult({ won, id: Date.now() })
    }, SPIN_MS)
  }, [record, spinning, variant])

  const batch = () => {
    if (spinning) return
    let wins = 0
    for (let step = 0; step < BATCH; step += 1) {
      const won = draw(variant)
      if (won) wins += 1
      record(variant.id, won, variant.prize)
    }
    setResult({ won: wins > 0, id: Date.now() })
  }

  return (
    <>
      <section className="extra-head">
        <p className="eyebrow">
          <Ticket size={15} /> дополнительно · лотерея
        </p>
        <h1>Лотерея</h1>
        <p className="intro">
          Три варианта с разными шансами. Крути колесо столько, сколько хочешь: оно честно, поэтому настоящую лотерею прочувствуешь быстро.
        </p>
      </section>

      <div className="lottery-variants">
        {LOTTERY_VARIANTS.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`lottery-variant${item.id === id ? ' is-on' : ''}`}
            onClick={() => {
              setId(item.id)
              setResult(null)
            }}
          >
            <span className="lottery-variant-label">{item.label}</span>
            <span className="lottery-variant-hint">{item.hint}</span>
            <span className="lottery-variant-prize">{prizeText(item.prize)}</span>
          </button>
        ))}
      </div>

      <section className="lottery-panel">
        <div className="lottery-stage">
          <LotteryWheel variant={variant} angle={angle} spinning={spinning} onSpin={spin} />
          {result && !spinning && (
            <p className={`lottery-result${result.won ? ' is-win' : ''}`} key={result.id}>
              {result.won ? (
                <>
                  <Sparkles size={16} /> Выигрыш! {prizeText(variant.prize)} — нечаянно, но честно.
                </>
              ) : (
                <>
                  <X size={16} /> Мимо. Шанс был {chanceText(variant)}, так что это нормально.
                </>
              )}
            </p>
          )}
        </div>

        <div className="lottery-facts">
          <dl className="lottery-odds">
            <div>
              <dt>Шанс</dt>
              <dd>{chanceText(variant)}</dd>
            </div>
            <div>
              <dt>Это значит</dt>
              <dd>{oddsText(variant)}</dd>
            </div>
            <div>
              <dt>Максимум</dt>
              <dd>{prizeText(variant.prize)}</dd>
            </div>
            <div>
              <dt>Номеров в билете</dt>
              <dd>{variant.ticket}</dd>
            </div>
          </dl>
          <p className="lottery-comment">{variant.comment}</p>

          <div className="lottery-stats">
            <div className="lottery-stat">
              <span className="lottery-stat-value">{compact(current.spins)}</span>
              <span className="lottery-stat-label">попыток</span>
            </div>
            <div className="lottery-stat">
              <span className="lottery-stat-value">{compact(current.wins)}</span>
              <span className="lottery-stat-label">выигрышей</span>
            </div>
            <div className="lottery-stat">
              <span className="lottery-stat-value">{prizeText(current.earned)}</span>
              <span className="lottery-stat-label">выиграно всего</span>
            </div>
          </div>

          <p className={`lottery-expect${current.wins > expected ? ' is-lucky' : ''}`}>
            <Gift size={15} /> При {compact(current.spins)} попытках математика ждала{' '}
            {withCount(Math.round(expected * 100) / 100, ['выигрыш', 'выигрыша', 'выигрышей'])}.
          </p>

          <div className="lottery-actions">
            <button type="button" className="mini-button" onClick={batch} disabled={spinning}>
              Проверить {BATCH} попыток
            </button>
            <button type="button" className="mini-button mini-button--ghost" onClick={reset} disabled={spinning}>
              Сбросить статистику
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
