import { useEffect } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useMotionDose } from './motionDose'

type AnimatedNumberProps = {
  value: number
  className?: string
  format?: (value: number) => string
  tier?: 'base' | 'premium'
}

const formatValue = (value: number, format?: (value: number) => string) => (format ? format(value) : Math.round(value).toLocaleString())

export const AnimatedNumber = ({ value, className, format, tier = 'base' }: AnimatedNumberProps) => {
  const reduced = useReducedMotion()
  const dose = useMotionDose()
  const source = useMotionValue(value)
  const spring = useSpring(source, { stiffness: 110, damping: 22, mass: 0.7 })
  const display = useTransform(spring, (latest) => formatValue(latest, format))

  useEffect(() => {
    source.set(value)
  }, [source, value])

  const enabled = !reduced && (tier === 'base' || dose === 'full')

  if (!enabled) {
    return <span className={className}>{formatValue(value, format)}</span>
  }

  return (
    <motion.span className={className} aria-label={String(value)}>
      {display}
    </motion.span>
  )
}
