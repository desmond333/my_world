import { useEffect, useRef, useState } from 'react'
import { RotateCw } from 'lucide-react'
import type { LotteryVariant } from '../../../lib'
import { sectorAngle } from '../../../lib'
import { useTranslation } from '../../../lib/i18n'

export type LotteryWheelProps = {
  variant: LotteryVariant
  angle: number
  spinning: boolean
  onSpin: () => void
}

export const LotteryWheel = ({ variant, angle, spinning, onSpin }: LotteryWheelProps) => {
  const { t } = useTranslation()
  const [flash, setFlash] = useState(false)
  const lastAngle = useRef(0)

  useEffect(() => {
    if (angle === lastAngle.current) return
    lastAngle.current = angle
    setFlash(true)
    const timer = window.setTimeout(() => setFlash(false), 700)
    return () => window.clearTimeout(timer)
  }, [angle])

  const win = sectorAngle(variant)

  return (
    <div className="lottery-wheel-wrap">
      <div className="lottery-pointer" aria-hidden="true" />
      <div className={`lottery-wheel-frame${flash ? ' is-flash' : ''}`}>
        <div
          className="lottery-wheel"
          style={{
            background: `conic-gradient(from 180deg, var(--accent) 0deg ${win}deg, var(--panel) ${win}deg 360deg)`,
            transform: `rotate(${angle}deg)`,
          }}
        >
          <div className="lottery-wheel-core">
            <RotateCw size={18} />
            <span>{spinning ? t('lottery.wheel.spinning') : t('lottery.wheel.spin')}</span>
          </div>
        </div>
      </div>
      <button type="button" className="add-button lottery-spin" onClick={onSpin} disabled={spinning}>
        {spinning ? t('lottery.wheel.spinningLong') : t('lottery.wheel.tryLuck')}
      </button>
    </div>
  )
}
