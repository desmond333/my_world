import { useState } from 'react'
import { STORAGE_KEYS } from '../../lib/storage'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, Crown, EyeOff } from 'lucide-react'
import { usePersistentState } from '../../hooks'
import { useTranslation } from '../../lib/i18n'
import { useAvatarViewMode, useDailyStore } from '../../store'
import { Popover, PopoverContent, PopoverTrigger } from '../../shared/ui'
import { CatFace } from './CatFace'
import { CatPremiumAvatar } from './CatPremiumAvatar'
import { CatPremiumPanel } from './CatPremiumPanel'
import { playCatMeow, playCatPurr } from './catAudio'
import './CatAssistant.css'

const HIDDEN_KEY = STORAGE_KEYS.catHidden

type CatTarget = { path: string; key: string; hint: string }

export const CatAssistant = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { mode: avatarMode, isNormal, toggleMode: toggleAvatarMode } = useAvatarViewMode()
  const hiddenSections = useDailyStore((state) => state.hiddenSections ?? [])

  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = usePersistentState<boolean>(HIDDEN_KEY, false)
  const [isPetting, setIsPetting] = useState(false)

  const targets: CatTarget[] = [
    { path: '/today', key: 'nav.today', hint: 'animalPage.sourceWiki' },
    { path: '/favorites', key: 'nav.favorites', hint: 'favorites.footerNote' },
    { path: '/notes', key: 'nav.notes', hint: 'notes.intro.notes' },
    { path: '/shop', key: 'nav.shop', hint: 'section.lottery.hint' },
    { path: '/useful/productivity/task', key: 'section.productivity', hint: 'section.productivity.hint' },
    { path: '/useful/training', key: 'section.training', hint: 'section.training.hint' },
    { path: '/useful/finance', key: 'section.finance', hint: 'section.finance.hint' },
    { path: '/useful/media/movies', key: 'section.media', hint: 'section.media.hint' },
    { path: '/useful/finance/subscriptions', key: 'section.subscriptions', hint: 'section.subscriptions.hint' },
    { path: '/useful/languages', key: 'section.languages', hint: 'section.languages.hint' },
    { path: '/useful/fun', key: 'section.fun', hint: 'section.fun.hint' },
    { path: '/settings', key: 'topbar.settings', hint: 'settings.kicker' },
  ]

  const visibleTargets = targets.filter((target) => {
    const match = target.path.match(/\/(useful|misc)\/([^/]+)/)
    if (match) {
      return !hiddenSections.includes(match[2])
    }
    return true
  })

  const handlePetAction = () => {
    setIsPetting(true)
    playCatPurr()
    setTimeout(() => setIsPetting(false), 1600)
  }

  const handleOpenChange = (nextState: boolean) => {
    setOpen(nextState)
    if (nextState) {
      playCatMeow()
    }
  }

  if (hidden) {
    return (
      <button
        type="button"
        className={`cat-restore ${isNormal ? 'is-premium' : ''}`}
        onClick={() => {
          setHidden(false)
        }}
        title={t('cat.show')}
        aria-label={t('cat.show')}
      >
        {isNormal ? <CatPremiumAvatar size={34} showCrown={false} /> : <CatFace size={26} />}
      </button>
    )
  }

  return (
    <div className={`cat-assistant ${open ? 'is-open' : ''} ${isNormal ? 'is-premium' : 'is-simple'}`}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`cat-button ${isNormal ? 'is-premium' : ''}`}
            aria-label={open ? t('cat.close') : t('cat.open')}
            title={t('cat.hint')}
          >
            {isNormal ? (
              <CatPremiumAvatar size={60} mood={open ? 'happy' : isPetting ? 'purr' : 'idle'} isPetting={isPetting} />
            ) : (
              <CatFace size={46} mood={open ? 'happy' : 'idle'} />
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent align="end" side="top" sideOffset={10} className="cat-popover-content" aria-label={t('cat.aria')}>
          {isNormal ? (
            <CatPremiumPanel
              targets={targets}
              activePath={location.pathname}
              currentMode={avatarMode}
              onToggleMode={toggleAvatarMode}
              onClose={() => setOpen(false)}
              onPet={handlePetAction}
              isPetting={isPetting}
            />
          ) : (
            <div className="cat-panel">
              <div className="cat-panel-simple-head">
                <p className="cat-panel__hello">{t('cat.hello')}</p>
                <button type="button" className="cat-upgrade-btn" onClick={toggleAvatarMode} title={t('cat.mode.tooltip')}>
                  <Crown size={12} />
                  <span>{t('cat.mode.normal')}</span>
                </button>
              </div>
              <ul className="cat-panel__list">
                {visibleTargets.map((target) => {
                  const active = target.path === location.pathname
                  return (
                    <li key={target.path}>
                      <button
                        type="button"
                        className={`cat-panel__item ${active ? 'is-active' : ''}`}
                        onClick={() => {
                          setOpen(false)
                          navigate(target.path)
                        }}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span className="cat-panel__label">{t(target.key)}</span>
                        <span className="cat-panel__hint">{t(target.hint)}</span>
                        <ChevronRight size={13} className="cat-panel__arrow" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <button
        type="button"
        className="cat-hide"
        onClick={() => {
          setOpen(false)
          setHidden(true)
        }}
        title={t('cat.hide')}
        aria-label={t('cat.hide')}
      >
        <EyeOff size={12} />
      </button>
    </div>
  )
}
