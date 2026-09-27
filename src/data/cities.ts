import type { City } from './types'

export const cities: City[] = [
  { id: 'moscow', name: 'Москва', timezone: 'Europe/Moscow', latitude: 55.7558, longitude: 37.6173, zone: 'МСК' },
  { id: 'tbilisi', name: 'Тбилиси', timezone: 'Asia/Tbilisi', latitude: 41.7151, longitude: 44.8271, zone: 'ТБЛ' },
  { id: 'achinsk', name: 'Ачинск', timezone: 'Asia/Krasnoyarsk', latitude: 56.2694, longitude: 90.4993, zone: 'АЧН' },
  { id: 'cherepovets', name: 'Череповец', timezone: 'Europe/Moscow', latitude: 59.1269, longitude: 37.9092, zone: 'ЧРП' },
  { id: 'dorogobuzh', name: 'Дорогобуж', timezone: 'Europe/Moscow', latitude: 54.9138, longitude: 33.3004, zone: 'ДРБ' },
  { id: 'spb', name: 'Санкт-Петербург', timezone: 'Europe/Moscow', latitude: 59.9343, longitude: 30.3351, zone: 'СПБ' },
  { id: 'kazan', name: 'Казань', timezone: 'Europe/Moscow', latitude: 55.7961, longitude: 49.1064, zone: 'КЗН' },
  { id: 'yekaterinburg', name: 'Екатеринбург', timezone: 'Asia/Yekaterinburg', latitude: 56.8389, longitude: 60.6057, zone: 'ЕКБ' },
  { id: 'novosibirsk', name: 'Новосибирск', timezone: 'Asia/Novosibirsk', latitude: 55.0084, longitude: 82.9357, zone: 'НСК' },
]

export const findCity = (id: string) => cities.find((city) => city.id === id) ?? cities[0]
