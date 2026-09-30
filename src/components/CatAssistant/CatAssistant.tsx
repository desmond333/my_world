import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, Crown, EyeOff } from 'lucide-react'
import { storage } from '../../lib'
import { useTranslation } from '../../lib/i18n'
import { useAvatarViewMode } from '../../store'
import { CatFace } from './CatFace'
import { CatPremiumAvatar } from './CatPremiumAvatar'
import { CatPremiumPanel } from './CatPremiumPanel'
import { playCatMeow, playCatPurr } from './catAudio'
import './CatAssistant.css'

const HIDDEN_KEY = 'myworld_cat_hidden'

type CatTarget = { path: string; key: string; hint: string }

export const CatAssistant = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { mode: avatarMode, isNormal, toggleMode: toggleAvatarMode } = useAvatarViewMode()

  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(() => storage.get<boolean>(HIDDEN_KEY, false))
  const [isPetting, setIsPetting] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const targets: CatTarget[] = [
    { path: '/today', key: 'nav.today', hint: 'animalPage.sourceWiki' },
    { path: '/favorites', key: 'nav.favorites', hint: 'favorites.footerNote' },
    { path: '/notes', key: 'nav.notes', hint: 'notes.intro.notes' },
    { path: '/shop', key: 'nav.shop', hint: 'section.lottery.hint' },
    { path: '/extra/productivity/task', key: 'section.productivity', hint: 'section.productivity.hint' },
    { path: '/extra/training', key: 'section.training', hint: 'section.training.hint' },
    { path: '/extra/finance', key: 'section.finance', hint: 'section.finance.hint' },
    { path: '/extra/media/movies', key: 'section.media', hint: 'section.media.hint' },
    { path: '/misc/subscriptions', key: 'section.subscriptions', hint: 'section.subscriptions.hint' },
    { path: '/misc/languages', key: 'section.languages', hint: 'section.languages.hint' },
    { path: '/misc/fun', key: 'section.fun', hint: 'section.fun.hint' },
    { path: '/settings', key: 'topbar.settings', hint: 'settings.kicker' },
  ]

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handlePetAction = () => {
    setIsPetting(true)
    playCatPurr()
    setTimeout(() => setIsPetting(false), 1600)
  }

  const handleToggleClick = () => {
    const nextState = !open
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
          storage.set(HIDDEN_KEY, false)
        }}
        title={t('cat.show')}
        aria-label={t('cat.show')}
      >
        {isNormal ? <CatPremiumAvatar size={34} showCrown={false} /> : <CatFace size={26} />}
      </button>
    )
  }

  return (
    <div className={`cat-assistant ${open ? 'is-open' : ''} ${isNormal ? 'is-premium' : 'is-simple'}`} ref={rootRef}>
      {open &&
        (isNormal ? (
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
          <div className="cat-panel" role="dialog" aria-label={t('cat.aria')}>
            <div className="cat-panel-simple-head">
              <p className="cat-panel__hello">{t('cat.hello')}</p>
              <button type="button" className="cat-upgrade-btn" onClick={toggleAvatarMode} title={t('cat.mode.tooltip')}>
                <Crown size={12} />
                <span>{t('cat.mode.normal')}</span>
              </button>
            </div>
            <ul className="cat-panel__list">
              {targets.map((target) => {
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
        ))}

      <button
        type="button"
        ref={buttonRef}
        className={`cat-button ${isNormal ? 'is-premium' : ''}`}
        onClick={handleToggleClick}
        aria-expanded={open}
        aria-label={open ? t('cat.close') : t('cat.open')}
        title={t('cat.hint')}
      >
        {isNormal ? (
          <CatPremiumAvatar size={60} mood={open ? 'happy' : isPetting ? 'purr' : 'idle'} isPetting={isPetting} />
        ) : (
          <CatFace size={46} mood={open ? 'happy' : 'idle'} />
        )}
      </button>

      <button
        type="button"
        className="cat-hide"
        onClick={() => {
          setHidden(true)
          storage.set(HIDDEN_KEY, true)
        }}
        title={t('cat.hide')}
        aria-label={t('cat.hide')}
      >
        <EyeOff size={12} />
      </button>
    </div>
  )
}
