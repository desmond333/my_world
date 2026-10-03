import type { HTMLMotionProps } from 'motion/react'
import { motion } from 'motion/react'
import { DURATION, EASE } from '../../../lib/motion'
import { useMotionDose } from './motionDose'

export type StaggerTier = 'base' | 'premium'

type StaggerProps = HTMLMotionProps<'div'> & {
  gap?: number
  delay?: number
  tier?: StaggerTier
}

export const Stagger = ({ gap = 0.09, delay = 0, tier = 'base', children, ...props }: StaggerProps) => {
  const dose = useMotionDose()
  const enabled = tier === 'base' || dose === 'full'

  return (
    <motion.div
      initial={enabled ? 'hidden' : false}
      animate={enabled ? 'show' : undefined}
      variants={enabled ? { show: { transition: { staggerChildren: gap, delayChildren: delay } } } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  )
}

type StaggerItemProps = HTMLMotionProps<'div'> & {
  tier?: StaggerTier
}

export const StaggerItem = ({ tier = 'base', children, ...props }: StaggerItemProps) => {
  const dose = useMotionDose()
  const enabled = tier === 'base' || dose === 'full'

  return (
    <motion.div
      variants={
        enabled
          ? {
              hidden: { opacity: 0, y: 24 },
              show: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE.out } },
            }
          : undefined
      }
      {...props}
    >
      {children}
    </motion.div>
  )
}
