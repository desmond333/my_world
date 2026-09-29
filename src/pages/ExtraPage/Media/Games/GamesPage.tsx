import { Gamepad2 } from 'lucide-react'
import { ComingSoon } from '../../../../components/ComingSoon/ComingSoon'
import { useTranslation } from '../../../../lib/i18n'

export const GamesPage = () => {
  const { t } = useTranslation()

  return <ComingSoon icon={Gamepad2} kicker={t('media.games.kicker')} heading={t('media.tab.games')} description={t('media.games.desc')} />
}
