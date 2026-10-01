import { useTranslation } from '../../lib/i18n'

export const LangSwitcher = () => {
  const { lang, setLang, t } = useTranslation()

  return (
    <div className="lang-pill" role="group" aria-label={t('topbar.lang')}>
      <button
        type="button"
        className={`lang-pill-btn ${lang === 'ru' ? 'active' : ''}`}
        onClick={() => setLang('ru')}
        title={t('topbar.langRu')}
        aria-pressed={lang === 'ru'}
      >
        RU
      </button>
      <button
        type="button"
        className={`lang-pill-btn ${lang === 'en' ? 'active' : ''}`}
        onClick={() => setLang('en')}
        title={t('topbar.langEn')}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
    </div>
  )
}
