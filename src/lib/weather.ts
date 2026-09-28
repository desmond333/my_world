export const weatherLabel = (code: number) => {
  if (code === 0) return 'Ясно'
  if (code <= 2) return 'Переменная облачность'
  if (code === 3) return 'Облачно'
  if (code <= 48) return 'Туман'
  if (code <= 57) return 'Морось'
  if (code <= 67) return 'Дождь'
  if (code <= 77) return 'Снег'
  if (code <= 82) return 'Ливни'
  if (code <= 86) return 'Снегопад'
  return 'Гроза'
}
