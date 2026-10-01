import { useCallback, useEffect, useRef, useState } from 'react'
import { Gift, Sparkles, X } from 'lucide-react'
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
import { useTranslation } from '../../../lib/i18n'
import { useLotteryStore } from '../../../store'
import { LotteryWheel } from './LotteryWheel'
import './Lottery.css'

const SPIN_MS = 3200
const BATCH = 100

export const LotteryDrawTab = () => {
  const { lang, t } = useTranslation()
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

  const compact = useCallback(
    (value: number) => value.toLocaleString(lang === 'en' ? 'en-US' : 'ru-RU', { maximumFractionDigits: value < 10 ? 2 : 0 }),
    [lang],
  )

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

  const winForms: [string, string, string] = lang === 'en' ? ['win', 'wins', 'wins'] : ['выигрыш', 'выигрыша', 'выигрышей']

  return (
    <>
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
            <span className="lottery-variant-label">{t(`lottery.variant.${item.id}`, item.label)}</span>
            <span className="lottery-variant-hint">{item.hint}</span>
            <span className="lottery-variant-prize">{prizeText(item.prize, lang)}</span>
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
                  <Sparkles size={16} /> {t('lottery.result.win', undefined, { prize: prizeText(variant.prize, lang) })}
                </>
              ) : (
                <>
                  <X size={16} /> {t('lottery.result.miss', undefined, { chance: chanceText(variant, lang) })}
                </>
              )}
            </p>
          )}
        </div>

        <div className="lottery-facts">
          <dl className="lottery-odds">
            <div>
              <dt>{t('lottery.oddsTitle')}</dt>
              <dd>{chanceText(variant, lang)}</dd>
            </div>
            <div>
              <dt>{t('lottery.meansTitle')}</dt>
              <dd>{oddsText(variant, lang)}</dd>
            </div>
            <div>
              <dt>{t('lottery.maxTitle')}</dt>
              <dd>{prizeText(variant.prize, lang)}</dd>
            </div>
            <div>
              <dt>{t('lottery.numbersTitle')}</dt>
              <dd>{variant.ticket}</dd>
            </div>
          </dl>
          <p className="lottery-comment">{t(`lottery.variant.${variant.id}.comment`, variant.comment)}</p>

          <div className="lottery-stats">
            <div className="lottery-stat">
              <span className="lottery-stat-value">{compact(current.spins)}</span>
              <span className="lottery-stat-label">{t('lottery.stat.spins')}</span>
            </div>
            <div className="lottery-stat">
              <span className="lottery-stat-value">{compact(current.wins)}</span>
              <span className="lottery-stat-label">{t('lottery.stat.wins')}</span>
            </div>
            <div className="lottery-stat">
              <span className="lottery-stat-value">{prizeText(current.earned, lang)}</span>
              <span className="lottery-stat-label">{t('lottery.stat.total')}</span>
            </div>
          </div>

          <p className={`lottery-expect${current.wins > expected ? ' is-lucky' : ''}`}>
            <Gift size={15} />{' '}
            {t('lottery.expect', undefined, {
              spins: compact(current.spins),
              wins: withCount(Math.round(expected * 100) / 100, winForms, lang),
            })}
          </p>

          <div className="lottery-actions">
            <button type="button" className="mini-button" onClick={batch} disabled={spinning}>
              {t('lottery.batch', undefined, { count: BATCH })}
            </button>
            <button type="button" className="mini-button mini-button--ghost" onClick={reset} disabled={spinning}>
              {t('lottery.reset')}
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
