import { Cake, X } from 'lucide-react'
import { blockOptions, cities, findCity } from '../../data'
import type { SettingsPanelProps } from './types'

export const SettingsPanel = ({
  city,
  scope,
  themeMode,
  blocks,
  season,
  onClose,
  onCity,
  onScope,
  onTheme,
  onToggleBlock,
  onOpenBirthday,
}: SettingsPanelProps) => (
  <section className="settings-panel" id="settings-panel" aria-label="Настройки">
    <div className="settings-heading">
      <div>
        <span className="card-kicker">твои настройки</span>
        <h2>Настроим этот день</h2>
      </div>
      <button className="close-button" onClick={onClose} aria-label="Закрыть настройки">
        <X size={18} />
      </button>
    </div>
    <div className="settings-fields">
      <label className="setting-field">
        <span>Где ты сейчас?</span>
        <select value={city.id} onChange={(event) => onCity(findCity(event.target.value))}>
          {cities.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="setting-field">
        <legend>Круг общения</legend>
        <div className="scope-options">
          <label className={scope === 'all' ? 'selected' : ''}>
            <input type="radio" name="scope" checked={scope === 'all'} onChange={() => onScope('all')} /> Все животные
          </label>
          <label className={scope === 'home' ? 'selected' : ''}>
            <input type="radio" name="scope" checked={scope === 'home'} onChange={() => onScope('home')} /> Домашние друзья
          </label>
        </div>
      </fieldset>
    </div>
    <fieldset className="setting-field blocks-field">
      <legend>Блоки на главной</legend>
      <div className="block-toggles">
        {blockOptions.map((option) => (
          <label className="switch-row" key={option.key}>
            <span className="switch-text">
              {option.label}
              <small>{option.hint}</small>
            </span>
            <input type="checkbox" checked={blocks[option.key]} onChange={() => onToggleBlock(option.key)} />
            <i className="switch" aria-hidden="true" />
          </label>
        ))}
      </div>
      <small className="theme-season-note">Выключи всё — и останется только сам день.</small>
    </fieldset>
    <fieldset className="setting-field theme-field">
      <legend>Настроение темы</legend>
      <div className="scope-options">
        <label className={themeMode === 'dark' ? 'selected' : ''}>
          <input type="radio" name="theme" checked={themeMode === 'dark'} onChange={() => onTheme('dark')} /> Тёмная
        </label>
        <label className={themeMode === 'light' ? 'selected' : ''}>
          <input type="radio" name="theme" checked={themeMode === 'light'} onChange={() => onTheme('light')} /> Светлая
        </label>
      </div>
      <small className="theme-season-note">{season} палитра</small>
    </fieldset>
    <button className="birthday-menu-button" onClick={onOpenBirthday}>
      <Cake size={16} /> Напомнить о днях рождения
    </button>
    <p className="settings-note">Выбор сохранится на этом устройстве. При смене круга сегодняшнее знакомство обновится.</p>
  </section>
)
