import { Link } from 'react-router-dom'
import { ArrowLeft, Heart, Send } from 'lucide-react'
import { creator } from '../../data'
import { useTranslation } from '../../lib/i18n'
import { AppTopbar } from '../../components/AppTopbar/AppTopbar'
import './CreatorPage.css'

export const CreatorPage = () => {
  const { t } = useTranslation()

  return (
    <main className="page-shell">
      <AppTopbar />

      <section className="creator-head">
        <p className="eyebrow">
          <Heart size={15} /> {t('creator.eyebrow')}
        </p>
        <h1>{creator.name}</h1>
        <p className="intro">{t('creator.intro')}</p>
      </section>

      <section className="creator-card">
        <p className="creator-text">{t('creator.text')}</p>

        <div className="creator-actions">
          <a className="add-button creator-telegram" href={creator.telegram} target="_blank" rel="noopener noreferrer">
            <Send size={16} /> {t('creator.writeTelegram')}
          </a>
        </div>

        <p className="creator-note-line">{t('creator.thanks')}</p>
      </section>

      <Link className="creator-back" to="/">
        <ArrowLeft size={16} /> {t('creator.back')}
      </Link>
    </main>
  )
}
