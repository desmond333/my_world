import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Coins, Lock, Shield, Sparkles, Ticket } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui'
import { useShopStore } from '../../../store'
import { LotteryBattleTab } from './LotteryBattleTab'
import { LotteryDrawTab } from './LotteryDrawTab'
import './Lottery.css'

export const LotteryPage = () => {
  const { t } = useTranslation()
  const [tab, setTab] = useState('draw')

  const isUnlocked = useShopStore((state) => state.isUnlocked('lottery'))
  const buyPart = useShopStore((state) => state.buyPart)
  const userCoins = useShopStore((state) => state.coins)

  if (!isUnlocked) {
    const canAfford = userCoins >= 250

    return (
      <div className="lottery-page lottery-locked-page">
        <div className="lottery-locked-card">
          <div className="lottery-locked-icon">
            <Lock size={32} />
            <Shield size={20} className="lottery-shield-badge" />
          </div>

          <h1>{t('lottery.lottery-of-luck', 'Лотерея удачи')}</h1>
          <p className="lottery-locked-intro">
            {t(
              'lottery.spin-the-wheel-flip-the-coin-and-clash-the-kingd',
              'Крути колесо, бросай монетку и сталкивай королевства. Открой доступ, чтобы испытать удачу и повести армии в бой!',
            )}
          </p>

          <div className="lottery-locked-pricing">
            <div className="locked-balance-pill">
              <span>{t('lottery.your-treasury', 'Твоя казна:')}</span>
              <strong>🪙 {userCoins}</strong>
            </div>
            <div className="locked-cost-pill">
              <span>{t('lottery.unlock-price', 'Цена открытия:')}</span>
              <strong>250 🪙</strong>
            </div>
          </div>

          <div className="lottery-locked-actions">
            {canAfford ? (
              <button type="button" className="lottery-unlock-btn" onClick={() => buyPart('lottery')}>
                <Sparkles size={16} />
                <span>{t('lottery.unlock-for-250-coins', 'Разблокировать за 250 🪙')}</span>
              </button>
            ) : (
              <p className="lottery-no-coins">
                {t(
                  'lottery.not-enough-coins-complete-tasks-or-earn-them-in-',
                  'Недостаточно коинов. Выполняй задачи или пополни казну в Магазине!',
                )}
              </p>
            )}

            <Link to="/shop" className="lottery-shop-link">
              <Coins size={15} />
              <span>{t('lottery.go-to-royal-shop', 'В Королевский магазин')}</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lottery-page">
      <header className="useful-head">
        <p className="eyebrow">
          <Ticket size={15} /> {t('lottery.eyebrow')}
        </p>
        <h1>{t('lottery.title')}</h1>
        <p className="intro">{t('lottery.intro')}</p>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="lottery-tabs">
        <TabsList className="lottery-tabs-list" aria-label={t('lottery.tabsAria')}>
          <TabsTrigger value="draw">
            <Sparkles size={14} /> {t('lottery.tab.draw')}
          </TabsTrigger>
          <TabsTrigger value="battle">
            <Shield size={14} /> {t('lottery.tab.battle')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draw">
          <LotteryDrawTab />
        </TabsContent>
        <TabsContent value="battle">
          <LotteryBattleTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
