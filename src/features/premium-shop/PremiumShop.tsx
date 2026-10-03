import { useState, type ReactNode } from 'react'
import { Check, Crown, Languages, LayoutPanelTop, NotebookPen, Sparkles } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import { useFeature, useIsPremium } from '../../hooks'
import { PART_PRICES, useShopStore } from '../../store'
import { ScrollReveal, TiltCard, Button } from '../../shared/ui'
import type { FeatureId } from '../../lib/features'
import './PremiumShop.css'

const PREMIUM_FEATURES: FeatureId[] = ['motion.double', 'languages.advanced', 'notes.advanced', 'view.normal', 'finance.advice']

const FEATURE_ICONS: Partial<Record<FeatureId, ReactNode>> = {
  'motion.double': <Sparkles size={22} />,
  'languages.advanced': <Languages size={22} />,
  'notes.advanced': <NotebookPen size={22} />,
  'view.normal': <LayoutPanelTop size={22} />,
  'finance.advice': <Crown size={22} />,
}

const PremiumFeatureCard = ({ id }: { id: FeatureId }) => {
  const { t } = useTranslation()
  const isPremium = useIsPremium()
  const { owned, labelKey, descriptionKey, shopKey } = useFeature(id)
  const coins = useShopStore((state) => state.coins)
  const buyPart = useShopStore((state) => state.buyPart)
  const [status, setStatus] = useState<string | null>(null)

  const price = shopKey ? PART_PRICES[shopKey] : 0

  const purchase = async () => {
    if (!shopKey) return
    setStatus(null)
    const result = await buyPart(shopKey)
    if (result.success) return
    setStatus(result.error === 'insufficient' ? t('feature.insufficient') : t('feature.buyError'))
  }

  return (
    <TiltCard className={`premium-feature-card ${isPremium || owned ? 'is-unlocked' : ''}`}>
      <div className="premium-feature-head">
        <span className="premium-feature-icon">{FEATURE_ICONS[id] ?? <Sparkles size={22} />}</span>
        <div>
          <h3 className="premium-feature-title">{t(labelKey)}</h3>
          {descriptionKey && <p className="premium-feature-desc">{t(descriptionKey)}</p>}
        </div>
      </div>

      <div className="premium-feature-footer">
        {isPremium ? (
          <span className="premium-feature-badge">
            <Crown size={13} /> {t('feature.includedWithPremium')}
          </span>
        ) : owned ? (
          <span className="premium-feature-badge is-owned">
            <Check size={13} /> {t('feature.owned')}
          </span>
        ) : (
          <>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="premium-feature-buy"
              onClick={purchase}
              disabled={coins < price}
              leftIcon={<Sparkles size={14} />}
            >
              {t('shop.unlockFor', undefined, { price })}
            </Button>
            {status && <span className="premium-feature-status">{status}</span>}
          </>
        )}
      </div>
    </TiltCard>
  )
}

export const PremiumShop = () => {
  const { t } = useTranslation()

  return (
    <ScrollReveal className="shop-section premium-shop-section">
      <div className="shop-section-head">
        <div className="section-title-wrap">
          <Crown size={18} className="section-icon" />
          <h2>{t('feature.sectionTitle')}</h2>
        </div>
        <p className="section-desc">{t('feature.sectionDesc')}</p>
      </div>

      <div className="premium-feature-grid">
        {PREMIUM_FEATURES.map((id) => (
          <PremiumFeatureCard key={id} id={id} />
        ))}
      </div>
    </ScrollReveal>
  )
}
