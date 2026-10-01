import { Link } from 'react-router-dom'
import { creator } from '../../data'
import { useTranslation } from '../../lib/i18n'

export const CreatorNote = () => {
  const { t } = useTranslation()

  return (
    <span className="creator-note">
      <Link to="/creator">{t('footer.madeBy', undefined, { name: creator.name })}</Link>
    </span>
  )
}
