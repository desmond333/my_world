import { useEffect, useRef, useState } from 'react'
import { RotateCw } from 'lucide-react'
import type { LotteryVariant } from '../../../lib'
import { sectorAngle } from '../../../lib'

export type LotteryWheelProps = {
  variant: LotteryVariant
  angle: number
  spinning: boolean
  onSpin: () => void
}

export const LotteryWheel = ({ variant, angle, spinning, onSpin }: LotteryWheelProps) => {
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
      <div
        className={`lottery-wheel${flash ? ' is-flash' : ''}`}
        style={{
          background: `conic-gradient(from 180deg, var(--accent) 0deg ${win}deg, var(--panel) ${win}deg 360deg)`,
          transform: `rotate(${angle}deg)`,
        }}
      >
        <div className="lottery-wheel-core">
          <RotateCw size={18} />
          <span>{spinning ? 'крутится' : 'крути'}</span>
        </div>
      </div>
      <button type="button" className="add-button lottery-spin" onClick={onSpin} disabled={spinning}>
        {spinning ? 'Крутится…' : 'Испытать удачу'}
      </button>
    </div>
  )
}
