import { X } from 'lucide-react'
import { blockOptions, cities, findCity, startPageOptions } from '../../../data'
import { useTranslation } from '../../../lib/i18n'
import { extraSections } from '../../ExtraPage/sections'
import { RadioGroup, RadioGroupItem, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from '../../../shared/ui'
import { useDailyStore } from '../../../store'
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
  const hiddenSections = useDailyStore((state) => state.hiddenSections ?? [])
  const toggleSection = useDailyStore((state) => state.toggleSection)

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
        <div className="setting-field">
          <span>{t('settings.where')}</span>
          <Select value={city.id} onValueChange={(val) => onCity(findCity(val))}>
            <SelectTrigger aria-label={t('settings.where')}>
              <SelectValue placeholder={city.name} />
            </SelectTrigger>
            <SelectContent>
              {cities.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <fieldset className="setting-field">
          <legend>{t('settings.circle')}</legend>
          <RadioGroup value={scope} onValueChange={(val) => onScope(val as 'all' | 'home')} className="scope-options">
            <RadioGroupItem value="all" id="scope-all" label={t('settings.allAnimals')} />
            <RadioGroupItem value="home" id="scope-home" label={t('settings.homeFriends')} />
          </RadioGroup>
        </fieldset>
        <div className="setting-field">
          <span>{t('settings.startPage')}</span>
          <Select value={startPage} onValueChange={onStartPage}>
            <SelectTrigger aria-label={t('settings.startPage')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {startPageOptions.map((option) => (
                <SelectItem key={option.path} value={option.path}>
                  {t(option.key, option.fallback)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <small className="theme-season-note">{t('settings.startPageHint')}</small>
        </div>
      </div>
      <fieldset className="setting-field blocks-field">
        <legend>{t('settings.blocks')}</legend>
        <div className="block-toggles">
          {blockOptions.map((option) => (
            <Switch
              key={option.key}
              checked={blocks[option.key]}
              onCheckedChange={() => onToggleBlock(option.key)}
              label={t(`blocks.${option.key}.label`, option.label)}
              hint={t(`blocks.${option.key}.hint`, option.hint)}
            />
          ))}
        </div>
        <small className="theme-season-note">{t('settings.allOff')}</small>
      </fieldset>
      <fieldset className="setting-field blocks-field">
        <legend>{t('settings.sectionsVisibility.title')}</legend>
        <div className="block-toggles">
          {extraSections.map((section) => {
            const isVisible = !hiddenSections.includes(section.key)
            return (
              <Switch
                key={section.key}
                checked={isVisible}
                onCheckedChange={() => toggleSection(section.key)}
                label={t(`section.${section.key}`, section.label)}
                hint={t(`section.${section.key}.hint`, section.hint)}
              />
            )
          })}
        </div>
      </fieldset>
      <fieldset className="setting-field theme-field">
        <legend>{t('settings.theme')}</legend>
        <RadioGroup value={themeMode} onValueChange={(val) => onTheme(val as 'system' | 'light' | 'dark')} className="scope-options">
          <RadioGroupItem value="system" id="theme-system" label={t('settings.themeSystem')} />
          <RadioGroupItem value="light" id="theme-light" label={t('settings.themeLight')} />
          <RadioGroupItem value="dark" id="theme-dark" label={t('settings.themeDark')} />
        </RadioGroup>
        <small className="theme-season-note">
          {season} {t('settings.palette')}
        </small>
      </fieldset>
      <p className="settings-note">{t('settings.note')}</p>
    </section>
  )
}
