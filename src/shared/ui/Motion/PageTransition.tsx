import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { DURATION, EASE } from '../../../lib/motion'

type PageTransitionProps = {
  children: ReactNode
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className="page-transition">{children}</div>
  }

  return (
    <motion.div
      className="page-transition"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.base, ease: EASE.out }}
    >
      {children}
    </motion.div>
  )
}
