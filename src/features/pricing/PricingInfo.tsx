import { Link } from 'react-router-dom'
import { BadgeDollarSign, Crown, Sparkles, UserPlus } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import { ScrollReveal } from '../../shared/ui'
import './PricingInfo.css'

type PremiumPlan = {
  id: string
  nameKey: string
  price: number
  badgeKey?: string
}

const PREMIUM_PLANS: PremiumPlan[] = [
  { id: 'month', nameKey: 'pricing.plan.month', price: 5 },
  { id: 'year', nameKey: 'pricing.plan.year', price: 10, badgeKey: 'pricing.plan.yearBadge' },
  { id: 'lifetime', nameKey: 'pricing.plan.lifetime', price: 15, badgeKey: 'pricing.plan.lifetimeBadge' },
]

export const PricingInfo = () => {
  const { t } = useTranslation()

  return (
    <ScrollReveal className="shop-section pricing-section">
      <div className="shop-section-head">
        <div className="section-title-wrap">
          <BadgeDollarSign size={18} className="section-icon" />
          <h2>{t('pricing.title')}</h2>
        </div>
        <p className="section-desc">{t('pricing.desc')}</p>
      </div>

      <div className="pricing-rate">
        <BadgeDollarSign size={15} />
        <span>{t('pricing.rate')}</span>
      </div>

      <div className="pricing-premium">
        <div className="pricing-premium-head">
          <span className="pricing-premium-icon">
            <Crown size={18} />
          </span>
          <div>
            <strong>{t('pricing.premium.title')}</strong>
            <p>{t('pricing.premium.desc')}</p>
          </div>
        </div>

        <div className="pricing-plans">
          {PREMIUM_PLANS.map((plan) => (
            <div key={plan.id} className={`pricing-plan ${plan.badgeKey ? 'has-badge' : ''}`}>
              {plan.badgeKey && <span className="pricing-plan-badge">{t(plan.badgeKey)}</span>}
              <span className="pricing-plan-name">{t(plan.nameKey)}</span>
              <span className="pricing-plan-price">
                <small>$</small>
                {plan.price}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pricing-referral">
        <span className="pricing-referral-icon">
          <UserPlus size={18} />
        </span>
        <div className="pricing-referral-info">
          <strong>{t('pricing.referral.title')}</strong>
          <p>{t('pricing.referral.desc')}</p>
        </div>
        <Link to="/auth" className="pricing-referral-cta">
          <Sparkles size={14} />
          {t('pricing.referral.cta')}
        </Link>
      </div>

      <p className="pricing-note">{t('pricing.note')}</p>
    </ScrollReveal>
  )
}
