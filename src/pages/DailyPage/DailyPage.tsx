import { useEffect, useState } from 'react'
import { defaultBlocks, findCity, type BlockKey } from '../../data'
import { copyToClipboard, getSeason, getThemedOccasion, getWish, seasonName, trainingReport } from '../../lib'
import { fetchHoliday, type Holiday } from '../../services/holidays'
import { fetchWeather, type DayForecast, type Weather } from '../../services/weather'
import { getDateForTimezone, useAnimalsStore, useDailyStore, useFavoritesStore, useTrainingStore } from '../../store'
import { BirthdayModal } from '../../components/BirthdayModal/BirthdayModal'
import { BreedCard } from './BreedCard'
import { DailyFooter, DesktopHint } from './DailyFooter'
import { ForecastStrip } from './ForecastStrip'
import { HeroSection } from './HeroSection'
import { OccasionCard } from './OccasionCard'
import { SettingsPanel } from './SettingsPanel'
import { TodayCard } from './TodayCard'
import { Topbar } from './Topbar'
import { TrainingCard } from './TrainingCard'
import { WeatherCard } from './WeatherCard'
import { WishCard } from './WishCard'
import './DailyPage.css'

const COPY_FEEDBACK_MS = 2200

export const DailyPage = () => {
  const {
    animalIndex,
    cityId,
    scope,
    themeMode = 'dark',
    blocks: storedBlocks,
    chooseForToday,
    setCity,
    setScope,
    setThemeMode,
    toggleBlock,
  } = useDailyStore()
  const animals = useAnimalsStore((state) => state.animals)

  const [now, setNow] = useState(new Date())
  const [weather, setWeather] = useState<Weather | null>(null)
  const [forecast, setForecast] = useState<DayForecast[]>([])
  const [forecastOpen, setForecastOpen] = useState(false)
  const [weatherError, setWeatherError] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [birthdayOpen, setBirthdayOpen] = useState(false)
  const [holiday, setHoliday] = useState<Holiday | null>(null)
  const [holidayLoading, setHolidayLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)

  const favorites = useFavoritesStore((state) => state.favorites)
  const addFavorite = useFavoritesStore((state) => state.addFavorite)
  const trainingDays = useTrainingStore((state) => state.days)
  const toggleTraining = useTrainingStore((state) => state.toggleDay)

  const city = findCity(cityId)
  const currentDate = getDateForTimezone(city.timezone)
  const blocks = { ...defaultBlocks, ...storedBlocks }
  const show = (key: BlockKey) => blocks[key]
  const availableAnimals = scope === 'home' ? animals.filter((item) => item.category === 'home') : animals
  const animal = availableAnimals[animalIndex] ?? availableAnimals[0]
  const isFavorite = favorites.some((favorite) => favorite.id === animal.id)
  const wish = getWish(currentDate)
  const occasion = getThemedOccasion(currentDate)
  const currentSeason = getSeason(now, city.timezone)
  const season = seasonName(currentSeason)
  const trainedToday = Boolean(trainingDays[currentDate])
  const infoCards = [show('animal'), show('today'), show('weather')].filter(Boolean).length

  const toggleFavorite = () => {
    if (isFavorite) useFavoritesStore.getState().removeFavorite(animal.id)
    else addFavorite(animal)
  }

  const copyTraining = async () => {
    const ok = await copyToClipboard(trainingReport(trainingDays, currentDate, city.name))
    setCopyFailed(!ok)
    setCopied(ok)
    window.setTimeout(() => {
      setCopied(false)
      setCopyFailed(false)
    }, COPY_FEEDBACK_MS)
  }

  useEffect(() => {
    chooseForToday(currentDate, scope)
  }, [chooseForToday, currentDate, scope])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    setWeather(null)
    setForecast([])
    setWeatherError(false)
    const controller = new AbortController()
    fetchWeather(city.latitude, city.longitude, city.timezone, controller.signal)
      .then((result) => {
        setWeather(result.weather)
        setForecast(result.forecast)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setWeatherError(true)
      })
    return () => controller.abort()
  }, [city.latitude, city.longitude, city.timezone, currentDate])

  useEffect(() => {
    const controller = new AbortController()
    setHolidayLoading(true)
    setHoliday(null)
    fetchHoliday(currentDate, city.id, controller.signal)
      .then(setHoliday)
      .catch(() => setHoliday(null))
      .finally(() => setHolidayLoading(false))
    return () => controller.abort()
  }, [city.id, currentDate])

  return (
    <main className="page-shell">
      <Topbar
        city={city}
        now={now}
        trainingCount={Object.keys(trainingDays).length}
        favoritesCount={favorites.length}
        settingsOpen={settingsOpen}
        onToggleSettings={() => setSettingsOpen((open) => !open)}
      />

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
          onOpenBirthday={() => setBirthdayOpen(true)}
        />
      )}

      {show('animal') && <HeroSection animal={animal} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />}

      {infoCards > 0 && (
        <section className={`info-grid cards-${infoCards}`} aria-label="Информация о сегодняшнем дне">
          {show('animal') && <BreedCard animal={animal} />}
          {show('today') && <TodayCard now={now} timezone={city.timezone} zone={city.zone} season={currentSeason} />}
          {show('weather') && (
            <WeatherCard
              cityName={city.name}
              weather={weather}
              forecast={forecast}
              failed={weatherError}
              open={forecastOpen}
              onToggle={() => setForecastOpen((open) => !open)}
            />
          )}
        </section>
      )}

      {forecastOpen && show('weather') && forecast.length > 0 && <ForecastStrip forecast={forecast} />}

      {show('training') && (
        <TrainingCard
          trainedToday={trainedToday}
          copied={copied}
          copyFailed={copyFailed}
          onToggle={() => toggleTraining(currentDate)}
          onCopy={copyTraining}
        />
      )}

      {show('wish') && <WishCard wish={wish} />}

      {show('occasion') && <OccasionCard holiday={holiday} loading={holidayLoading} occasion={occasion} cityName={city.name} />}

      <DesktopHint />
      <DailyFooter />
      {birthdayOpen && <BirthdayModal onClose={() => setBirthdayOpen(false)} />}
    </main>
  )
}
