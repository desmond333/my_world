import type { HTMLMotionProps } from 'motion/react'
import { motion } from 'motion/react'
import { DURATION, EASE } from '../../../lib/motion'
import { useMotionDose } from './motionDose'

export type RevealTier = 'base' | 'premium'

type RevealProps = HTMLMotionProps<'div'> & {
  delay?: number
  offset?: number
  tier?: RevealTier
}

export const Reveal = ({ delay = 0, offset = 24, tier = 'base', children, ...props }: RevealProps) => {
  const dose = useMotionDose()
  const enabled = tier === 'base' || dose === 'full'

  return (
    <motion.div
      initial={enabled ? { opacity: 0, y: offset } : false}
      animate={enabled ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: DURATION.slow, delay, ease: EASE.out }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
