export type MotionDose = 'base' | 'full'
export type MotionKind = 'js' | 'css'

export type MotionEntry = {
  id: string
  label: string
  dose: MotionDose
  kind: MotionKind
}

export const MOTION_CATALOG: MotionEntry[] = [
  { id: 'page-fade', label: 'Fade перехода страницы', dose: 'base', kind: 'js' },
  { id: 'page-parts', label: 'Каскад секций страницы', dose: 'base', kind: 'css' },
  { id: 'tab-content', label: 'Появление панели вкладки', dose: 'base', kind: 'css' },
  { id: 'accordion', label: 'Плавный аккордеон', dose: 'base', kind: 'css' },
  { id: 'coin-number', label: 'Пружинный счётчик', dose: 'base', kind: 'js' },
  { id: 'reveal', label: 'Reveal (JS-примитив)', dose: 'base', kind: 'js' },
  { id: 'scroll-reveal', label: 'Появление по скроллу', dose: 'base', kind: 'js' },
  { id: 'tilt', label: '3D-наклон карточек', dose: 'base', kind: 'js' },
  { id: 'parallax', label: 'Параллакс слоя', dose: 'full', kind: 'js' },
  { id: 'tab-pop', label: 'Пружина активной вкладки', dose: 'full', kind: 'css' },
  { id: 'stagger', label: 'Stagger (JS-примитив)', dose: 'full', kind: 'js' },
  { id: 'grid-stagger', label: 'Каскад карточек', dose: 'full', kind: 'css' },
  { id: 'hover-lift', label: 'Hover-подъём карточек', dose: 'full', kind: 'css' },
  { id: 'hover-pack', label: 'Hover наборов и тарифов', dose: 'full', kind: 'css' },
  { id: 'shimmer', label: 'Shimmer премиум-бейджей', dose: 'full', kind: 'css' },
  { id: 'coin-pulse', label: 'Пульс баланса коинов', dose: 'full', kind: 'css' },
]

export const motionCounts = () => {
  const base = MOTION_CATALOG.filter((item) => item.dose === 'base').length
  const full = MOTION_CATALOG.filter((item) => item.dose === 'full').length
  return { base, full, total: base + full }
}
