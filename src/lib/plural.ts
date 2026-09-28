const LAST_DIGIT = (value: number) => Math.abs(value) % 10
const LAST_TWO = (value: number) => Math.abs(value) % 100

export const plural = (value: number, forms: [string, string, string]) => {
  if (value === 1) return forms[0]
  const last = LAST_TWO(value)
  if (last >= 11 && last <= 19) return forms[2]
  if (LAST_DIGIT(value) >= 2 && LAST_DIGIT(value) <= 4) return forms[1]
  return forms[2]
}

export const withCount = (value: number, forms: [string, string, string]) => `${value} ${plural(value, forms)}`
