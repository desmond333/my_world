import type { BlockKey, Blocks } from './types'

export const blockOptions: { key: BlockKey; label: string; hint: string }[] = [
  { key: 'animal', label: 'Животное дня', hint: 'фотография, фраза и описание вида' },
  { key: 'today', label: 'Дата и время', hint: 'число, месяц, сезон и часы' },
  { key: 'weather', label: 'Погода', hint: 'сейчас, сегодня, завтра и неделя' },
  { key: 'wish', label: 'Пожелание дня', hint: 'мысль на удачу' },
  { key: 'occasion', label: 'Повод дня', hint: 'праздник или тематический день' },
  { key: 'training', label: 'Силовая тренировка', hint: 'отметка и календарь, по умолчанию выключено' },
]

export const defaultBlocks: Blocks = { animal: true, today: true, weather: true, wish: true, occasion: true, training: false }
