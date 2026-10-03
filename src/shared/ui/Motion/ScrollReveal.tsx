import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { DURATION, EASE } from '../../../lib/motion'

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  offset?: number
}

export const ScrollReveal = ({ children, className, delay = 0, offset = 32 }: ScrollRevealProps) => {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: DURATION.slow, delay, ease: EASE.out }}
    >
      {children}
    </motion.div>
  )
}
