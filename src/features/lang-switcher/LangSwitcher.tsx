import { useTranslation } from '../../lib/i18n'
import { ToggleGroup, ToggleGroupItem, Tooltip } from '../../shared/ui'

export const LangSwitcher = () => {
  const { lang, setLang, t } = useTranslation()

  return (
    <ToggleGroup
      type="single"
      value={lang}
      onValueChange={(val) => {
        if (val) setLang(val as typeof lang)
      }}
      className="lang-pill"
      aria-label={t('topbar.lang')}
    >
      <Tooltip content={t('topbar.langRu')}>
        <ToggleGroupItem value="ru" className="lang-pill-btn">
          RU
        </ToggleGroupItem>
      </Tooltip>
      <Tooltip content={t('topbar.langEn')}>
        <ToggleGroupItem value="en" className="lang-pill-btn">
          EN
        </ToggleGroupItem>
      </Tooltip>
    </ToggleGroup>
  )
}
