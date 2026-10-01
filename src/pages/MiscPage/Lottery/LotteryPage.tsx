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
  const { lang, t } = useTranslation()
  const [tab, setTab] = useState('draw')

  const isUnlocked = useShopStore((state) => state.isUnlocked('lottery'))
  const buyPart = useShopStore((state) => state.buyPart)
  const userCoins = useShopStore((state) => state.coins)

  const isEn = lang === 'en'

  if (!isUnlocked) {
    const canAfford = userCoins >= 250

    return (
      <div className="lottery-page lottery-locked-page">
        <div className="lottery-locked-card">
          <div className="lottery-locked-icon">
            <Lock size={32} />
            <Shield size={20} className="lottery-shield-badge" />
          </div>

          <h1>{isEn ? 'Lottery of Luck' : 'Лотерея удачи'}</h1>
          <p className="lottery-locked-intro">
            {isEn
              ? 'Spin the wheel, flip the coin and clash the kingdoms. Unlock full access to try your luck and lead armies into battle!'
              : 'Крути колесо, бросай монетку и сталкивай королевства. Открой доступ, чтобы испытать удачу и повести армии в бой!'}
          </p>

          <div className="lottery-locked-pricing">
            <div className="locked-balance-pill">
              <span>{isEn ? 'Your Treasury:' : 'Твоя казна:'}</span>
              <strong>🪙 {userCoins}</strong>
            </div>
            <div className="locked-cost-pill">
              <span>{isEn ? 'Unlock Price:' : 'Цена открытия:'}</span>
              <strong>250 🪙</strong>
            </div>
          </div>

          <div className="lottery-locked-actions">
            {canAfford ? (
              <button type="button" className="lottery-unlock-btn" onClick={() => buyPart('lottery')}>
                <Sparkles size={16} />
                <span>{isEn ? 'Unlock for 250 Coins 🪙' : 'Разблокировать за 250 🪙'}</span>
              </button>
            ) : (
              <p className="lottery-no-coins">
                {isEn
                  ? 'Not enough coins. Complete tasks or earn them in the shop!'
                  : 'Недостаточно коинов. Выполняй задачи или пополни казну в Магазине!'}
              </p>
            )}

            <Link to="/shop" className="lottery-shop-link">
              <Coins size={15} />
              <span>{isEn ? 'Go to Royal Shop' : 'В Королевский магазин'}</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lottery-page">
      <header className="extra-head">
        <p className="eyebrow">
          <Ticket size={15} /> {t('lottery.eyebrow')}
        </p>
        <h1>{t('lottery.title')}</h1>
        <p className="intro">{t('lottery.intro')}</p>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="lottery-tabs">
        <TabsList className="lottery-tabs-list" aria-label={t('lottery.tabsAria')}>
          <TabsTrigger value="draw" className={`lottery-tab-btn ${tab === 'draw' ? 'active' : ''}`}>
            <Sparkles size={14} /> {t('lottery.tab.draw')}
          </TabsTrigger>
          <TabsTrigger value="battle" className={`lottery-tab-btn ${tab === 'battle' ? 'active' : ''}`}>
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
