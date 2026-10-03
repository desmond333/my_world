import { createContext, useContext } from 'react'

export type MotionDose = 'base' | 'full'

export const MotionDoseContext = createContext<MotionDose>('base')

export const useMotionDose = (): MotionDose => useContext(MotionDoseContext)
