import { everydayOccasions, themedDays, wishes } from '../data'

const seedFromDate = (date: string) => date.split('-').reduce((sum, value) => sum + Number(value), 0)

export const getWish = (date: string) => wishes[seedFromDate(date) % wishes.length]

export const getThemedOccasion = (date: string) => {
  const [, month, day] = date.split('-').map(Number)
  const themed = themedDays[`${day}-${month}`]
  if (themed) return { title: themed, isThemed: true }
  return { title: everydayOccasions[seedFromDate(date) % everydayOccasions.length], isThemed: false }
}
