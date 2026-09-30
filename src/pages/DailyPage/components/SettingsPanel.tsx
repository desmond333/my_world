import { X } from 'lucide-react'
import { blockOptions, cities, findCity, startPageOptions } from '../../../data'
import { useTranslation } from '../../../lib/i18n'
import type { SettingsPanelProps } from '../types'

export const SettingsPanel = ({
  city,
  scope,
  themeMode,
  blocks,
  season,
  startPage,
  onClose,
  onCity,
  onScope,
  onTheme,
  onToggleBlock,
  onStartPage,
}: SettingsPanelProps) => {
  const { t } = useTranslation()

  return (
    <section className="settings-panel" id="settings-panel" aria-label={t('settings.title')}>
      <div className="settings-heading">
        <div>
          <span className="card-kicker">{t('settings.kicker')}</span>
          <h2>{t('settings.title')}</h2>
        </div>
        <button className="close-button" onClick={onClose} aria-label={t('settings.close')}>
          <X size={18} />
        </button>
      </div>
      <div className="settings-fields">
        <label className="setting-field">
          <span>{t('settings.where')}</span>
          <select value={city.id} onChange={(event) => onCity(findCity(event.target.value))}>
            {cities.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="setting-field">
          <legend>{t('settings.circle')}</legend>
          <div className="scope-options">
            <label className={scope === 'all' ? 'selected' : ''}>
              <input type="radio" name="scope" checked={scope === 'all'} onChange={() => onScope('all')} /> {t('settings.allAnimals')}
            </label>
            <label className={scope === 'home' ? 'selected' : ''}>
              <input type="radio" name="scope" checked={scope === 'home'} onChange={() => onScope('home')} /> {t('settings.homeFriends')}
            </label>
          </div>
        </fieldset>
        <label className="setting-field">
          <span>{t('settings.startPage')}</span>
          <select value={startPage} onChange={(event) => onStartPage(event.target.value)}>
            {startPageOptions.map((option) => (
              <option key={option.path} value={option.path}>
                {t(option.key, option.fallback)}
              </option>
            ))}
          </select>
          <small className="theme-season-note">{t('settings.startPageHint')}</small>
        </label>
      </div>
      <fieldset className="setting-field blocks-field">
        <legend>{t('settings.blocks')}</legend>
        <div className="block-toggles">
          {blockOptions.map((option) => (
            <label className="switch-row" key={option.key}>
              <span className="switch-text">
                {t(`blocks.${option.key}.label`, option.label)}
                <small>{t(`blocks.${option.key}.hint`, option.hint)}</small>
              </span>
              <input type="checkbox" checked={blocks[option.key]} onChange={() => onToggleBlock(option.key)} />
              <i className="switch" aria-hidden="true" />
            </label>
          ))}
        </div>
        <small className="theme-season-note">{t('settings.allOff')}</small>
      </fieldset>
      <fieldset className="setting-field theme-field">
        <legend>{t('settings.theme')}</legend>
        <div className="scope-options">
          <label className={themeMode === 'system' ? 'selected' : ''}>
            <input type="radio" name="theme" checked={themeMode === 'system'} onChange={() => onTheme('system')} />{' '}
            {t('settings.themeSystem')}
          </label>
          <label className={themeMode === 'light' ? 'selected' : ''}>
            <input type="radio" name="theme" checked={themeMode === 'light'} onChange={() => onTheme('light')} /> {t('settings.themeLight')}
          </label>
          <label className={themeMode === 'dark' ? 'selected' : ''}>
            <input type="radio" name="theme" checked={themeMode === 'dark'} onChange={() => onTheme('dark')} /> {t('settings.themeDark')}
          </label>
        </div>
        <small className="theme-season-note">
          {season} {t('settings.palette')}
        </small>
      </fieldset>
      <p className="settings-note">{t('settings.note')}</p>
    </section>
  )
}
