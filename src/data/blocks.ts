import type { BlockKey, Blocks } from './types'

export const blockOptions: { key: BlockKey; label: string; hint: string }[] = [
  { key: 'animal', label: 'Животное дня', hint: 'фотография, фраза и описание вида' },
  { key: 'today', label: 'Дата и время', hint: 'число, месяц, сезон и часы' },
  { key: 'weather', label: 'Погода', hint: 'сейчас, сегодня, завтра и неделя' },
  { key: 'wish', label: 'Пожелание дня', hint: 'мысль на удачу' },
  { key: 'occasion', label: 'Повод дня', hint: 'праздник или тематический день' },
  { key: 'training', label: 'Силовая тренировка', hint: 'отметка и календарь, по умолчанию выключено' },
]

export const defaultBlocks: Blocks = { animal: true, today: true, weather: true, wish: true, occasion: true, training: true }

export const startPageOptions: { path: string; key: string; fallback: string }[] = [
  { path: '/today', key: 'settings.start.today', fallback: 'Сегодня' },
  { path: '/useful/productivity/task', key: 'settings.start.tasks', fallback: 'Продуктивность — задачи' },
  { path: '/useful/productivity/goal', key: 'settings.start.goals', fallback: 'Продуктивность — цели' },
  { path: '/useful/productivity/status', key: 'settings.start.status', fallback: 'Продуктивность — статус' },
  { path: '/useful/training', key: 'settings.start.training', fallback: 'Тренировки' },
  { path: '/useful/finance', key: 'settings.start.finance', fallback: 'Финансы' },
  { path: '/useful/media/movies', key: 'settings.start.media', fallback: 'Медиа' },
  { path: '/useful/finance/subscriptions', key: 'settings.start.subscriptions', fallback: 'Подписки' },
  { path: '/useful/languages', key: 'settings.start.languages', fallback: 'Языки' },
  { path: '/useful/sounds', key: 'settings.start.sounds', fallback: 'Звуки' },
  { path: '/useful/fun', key: 'settings.start.fun', fallback: 'Веселье' },
  { path: '/favorites', key: 'settings.start.favorites', fallback: 'Избранное' },
]
