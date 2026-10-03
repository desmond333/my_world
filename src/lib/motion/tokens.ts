import type { Easing } from 'motion/react'

export const EASE: Record<'out' | 'pop' | 'smooth', Easing> = {
  out: [0.16, 1, 0.3, 1],
  pop: [0.34, 1.56, 0.64, 1],
  smooth: [0.87, 0, 0.13, 1],
}

export const DURATION = {
  fast: 0.22,
  base: 0.4,
  slow: 0.65,
  page: 0.85,
} as const
