import { useEffect, useState } from 'react'
import { defaultBlocks, findCity, type BlockKey } from '../../data'
import { MINUTE_MS, useAsyncResource, useCopyFeedback, useNow } from '../../hooks'
import { getSeason, getThemedOccasion, getWish, hasTraining, seasonName, STRENGTH_ID, trainingReport } from '../../lib'
import { useTranslation } from '../../lib/i18n'
import { fetchHoliday } from '../../services/holidays'
import { fetchWeather } from '../../services/weather'
import { getDateForTimezone, useAnimalsStore, useDailyStore, useFavoritesStore, usePageViewMode, useTrainingStore } from '../../store'
import {
  BreedCard,
  DailyFooter,
  DesktopHint,
  ForecastStrip,
  HeroSection,
  OccasionCard,
  SettingsPanel,
  TodayCard,
  Topbar,
  TrainingCard,
  WeatherCard,
  WishCard,
} from './components'
import './DailyPage.css'

export const DailyPage = () => {
  const { lang, t } = useTranslation()
  const animalIndex = useDailyStore((state) => state.animalIndex)
  const cityId = useDailyStore((state) => state.cityId)
  const scope = useDailyStore((state) => state.scope)
  const themeMode = useDailyStore((state) => state.themeMode)
  const storedBlocks = useDailyStore((state) => state.blocks)
  const chooseForToday = useDailyStore((state) => state.chooseForToday)
  const setCity = useDailyStore((state) => state.setCity)
  const setScope = useDailyStore((state) => state.setScope)
  const setThemeMode = useDailyStore((state) => state.setThemeMode)
  const toggleBlock = useDailyStore((state) => state.toggleBlock)
  const startPage = useDailyStore((state) => state.startPage ?? '/today')
  const setStartPage = useDailyStore((state) => state.setStartPage)

  const animals = useAnimalsStore((state) => state.animals)
  const favorites = useFavoritesStore((state) => state.favorites)
  const addFavorite = useFavoritesStore((state) => state.addFavorite)
  const trainingDays = useTrainingStore((state) => state.days)
  const trainingSports = useTrainingStore((state) => state.sports)
  const toggleTrainingSport = useTrainingStore((state) => state.toggleSport)
  const { copied, copyFailed, copy } = useCopyFeedback()

  const now = useNow(MINUTE_MS)
  const { isNormal } = usePageViewMode('today')
  const [forecastOpen, setForecastOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const city = findCity(cityId)
  const currentDate = getDateForTimezone(city.timezone)
  const weather = useAsyncResource(`${city.latitude}|${city.longitude}|${city.timezone}|${currentDate}`, (signal) =>
    fetchWeather(city.latitude, city.longitude, city.timezone, signal),
  )
  const holiday = useAsyncResource(`${city.id}|${currentDate}`, (signal) => fetchHoliday(currentDate, city.id, signal))

  const blocks = { ...defaultBlocks, ...storedBlocks }
  const show = (key: BlockKey) => blocks[key]
  const availableAnimals = scope === 'home' ? animals.filter((item) => item.category === 'home') : animals
  const animal = availableAnimals[animalIndex] ?? availableAnimals[0]
  const isFavorite = favorites.some((favorite) => favorite.id === animal?.id)
  const wish = getWish(currentDate)
  const occasion = getThemedOccasion(currentDate)
  const currentSeason = getSeason(now, city.timezone)
  const season = seasonName(currentSeason, lang)
  const trainedToday = hasTraining(trainingDays, currentDate)
  const forecast = weather.data?.forecast ?? []
  const infoCards = [isNormal && show('animal'), show('today'), show('weather')].filter(Boolean).length

  useEffect(() => {
    chooseForToday(currentDate, scope)
  }, [chooseForToday, currentDate, scope])

  const toggleFavorite = () => {
    if (!animal) return
    if (isFavorite) useFavoritesStore.getState().removeFavorite(animal.id)
    else addFavorite(animal)
  }

  const copyTraining = () => copy(trainingReport(trainingDays, currentDate, city.name, trainingSports, lang))

  return (
    <main className="page-shell">
      <Topbar city={city} now={now} settingsOpen={settingsOpen} onToggleSettings={() => setSettingsOpen((open) => !open)} />

      {settingsOpen && (
        <SettingsPanel
          city={city}
          scope={scope}
          themeMode={themeMode}
          blocks={blocks}
          season={season}
          onClose={() => setSettingsOpen(false)}
          onCity={setCity}
          onScope={setScope}
          onTheme={setThemeMode}
          onToggleBlock={toggleBlock}
          startPage={startPage}
          onStartPage={setStartPage}
        />
      )}

      {show('animal') && animal && <HeroSection animal={animal} isFavorite={Boolean(isFavorite)} onToggleFavorite={toggleFavorite} />}

      {infoCards > 0 && (
        <section className={`info-grid cards-${infoCards}`} aria-label={t('daily.infoAria')}>
          {isNormal && show('animal') && animal && <BreedCard animal={animal} />}
          {show('today') && <TodayCard timezone={city.timezone} zone={city.zone} season={currentSeason} />}
          {show('weather') && (
            <WeatherCard
              cityName={city.name}
              weather={weather.data?.weather ?? null}
              forecast={forecast}
              failed={Boolean(weather.error)}
              open={forecastOpen}
              onToggle={() => setForecastOpen((open) => !open)}
            />
          )}
        </section>
      )}

      {isNormal && forecastOpen && show('weather') && forecast.length > 0 && <ForecastStrip forecast={forecast} />}

      {isNormal && show('training') && (
        <TrainingCard
          trainedToday={trainedToday}
          copied={copied}
          copyFailed={copyFailed}
          onToggle={() => toggleTrainingSport(currentDate, STRENGTH_ID)}
          onCopy={copyTraining}
        />
      )}

      {show('wish') && <WishCard wish={wish} />}

      {isNormal && show('occasion') && (
        <OccasionCard holiday={holiday.data ?? null} loading={holiday.loading} occasion={occasion} cityName={city.name} />
      )}

      <DesktopHint />
      <DailyFooter />
    </main>
  )
}
