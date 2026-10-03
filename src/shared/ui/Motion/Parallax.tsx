import { useRef, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useMotionDose } from './motionDose'

type ParallaxProps = {
  children: ReactNode
  className?: string
  speed?: number
  axis?: 'y' | 'x'
}

export const Parallax = ({ children, className, speed = 0.15, axis = 'y' }: ParallaxProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const dose = useMotionDose()
  const enabled = !reduced && dose === 'full'

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const shift = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}px`, `${speed * 100}px`])
  const smooth = useSpring(shift, { stiffness: 140, damping: 26, mass: 0.4 })

  return (
    <div ref={ref} className={className}>
      <motion.div className="ui-parallax-layer" style={enabled ? (axis === 'y' ? { y: smooth } : { x: smooth }) : undefined}>
        {children}
      </motion.div>
    </div>
  )
}
