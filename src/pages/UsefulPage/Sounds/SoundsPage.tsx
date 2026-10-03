import { useEffect, useState } from 'react'
import { CloudRain, Flame, Moon, Music, Pause, Play } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import { getCurrentAmbientTrack, playAmbientSound, stopAmbientSound } from '../../../services'
import { ToggleGroup, ToggleGroupItem } from '../../../shared/ui'
import './SoundsPage.css'

type SoundScene = 'rain' | 'fire' | 'drone'

type SceneOption = {
  id: SoundScene
  icon: LucideIcon
  titleKey: string
  title: string
  hintFallback: string
}

const SCENES: SceneOption[] = [
  { id: 'rain', icon: CloudRain, titleKey: 'sounds.rain', title: 'Дождь', hintFallback: 'мягкий ливень за окном' },
  { id: 'fire', icon: Flame, titleKey: 'sounds.fire', title: 'Камин', hintFallback: 'треск дров и тепло' },
  { id: 'drone', icon: Moon, titleKey: 'sounds.drone', title: 'Медитация', hintFallback: 'глубокий низкий гул' },
]

export const SoundsPage = () => {
  const { t } = useTranslation()
  const [active, setActive] = useState<SoundScene | null>(() => getCurrentAmbientTrack())

  useEffect(() => () => stopAmbientSound(), [])

  const toggle = (id: SoundScene) => {
    if (active === id) {
      stopAmbientSound()
      setActive(null)
      return
    }
    const ok = playAmbientSound(id)
    setActive(ok ? id : null)
  }

  return (
    <div className="sounds-page">
      <section className="useful-head">
        <p className="eyebrow">
          <Music size={15} /> {t('sounds.kicker', 'Полезное')}
        </p>
        <h1>{t('sounds.title', 'Звуки')}</h1>
        <p className="intro">{t('sounds.intro', 'Фоновые звуковые сцены для работы, чтения и отдыха. Работают прямо в браузере.')}</p>
      </section>

      <ToggleGroup
        type="single"
        value={active ?? ''}
        onValueChange={(value) => {
          if (!value) {
            stopAmbientSound()
            setActive(null)
            return
          }
          toggle(value as SoundScene)
        }}
        className="sounds-grid"
        aria-label={t('sounds.title', 'Звуки')}
      >
        {SCENES.map((scene) => {
          const Icon = scene.icon
          const isOn = active === scene.id

          return (
            <ToggleGroupItem key={scene.id} value={scene.id} className="sound-card">
              <span className="sound-card-icon">
                <Icon size={24} />
              </span>
              <span className="sound-card-body">
                <strong>{t(scene.titleKey, scene.title)}</strong>
                <small>{t(`${scene.titleKey}.hint`, scene.hintFallback)}</small>
              </span>
              <span className="sound-card-play">{isOn ? <Pause size={16} /> : <Play size={16} />}</span>
              {isOn && (
                <span className="sound-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((bar) => (
                    <span key={bar} style={{ animationDelay: `${bar * 0.12}s` }} />
                  ))}
                </span>
              )}
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>

      {active && (
        <button
          type="button"
          className="sound-stop"
          onClick={() => {
            stopAmbientSound()
            setActive(null)
          }}
        >
          {t('sounds.stop', 'Остановить звук')}
        </button>
      )}
    </div>
  )
}
