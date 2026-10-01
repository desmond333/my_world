import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Check,
  CheckCircle2,
  CloudRain,
  Coins,
  Crown,
  CreditCard,
  Flame,
  Headphones,
  HelpCircle,
  Mail,
  Palette,
  Shield,
  ShoppingBag,
  Sparkles,
  Square,
  Swords,
  UserPlus,
  Volume2,
  Wand2,
  X,
  Zap,
} from 'lucide-react'
import { AppTopbar, CatPremiumAvatar } from '../../widgets'
import { useTranslation } from '../../lib/i18n'
import { PART_PRICES, type ShopItemKey, useDailyStore, useShopStore } from '../../store'
import { playAmbientSound, stopAmbientSound, getCurrentAmbientTrack } from '../../services'
import { playBattleHorn, playVictoryFanfare } from '../MiscPage/Lottery/battleSounds'
import './ShopPage.css'

type RealMoneyPack = {
  id: string
  coins: number
  priceRub: number
  priceUsd: number
  nameRu: string
  nameEn: string
  badgeRu?: string
  badgeEn?: string
  icon: string
}

const REAL_MONEY_PACKS: RealMoneyPack[] = [
  {
    id: 'pack-500',
    coins: 500,
    priceRub: 99,
    priceUsd: 0.99,
    nameRu: 'Кошель оруженосца',
    nameEn: 'Squire’s Purse',
    icon: '🪙',
  },
  {
    id: 'pack-2500',
    coins: 2500,
    priceRub: 299,
    priceUsd: 2.99,
    nameRu: 'Мешок золота',
    nameEn: 'Bag of Gold',
    badgeRu: 'Хит продаж 🔥',
    badgeEn: 'Popular 🔥',
    icon: '💰',
  },
  {
    id: 'pack-10000',
    coins: 10000,
    priceRub: 799,
    priceUsd: 7.99,
    nameRu: 'Казна императора',
    nameEn: 'Emperor’s Treasury',
    badgeRu: 'Выгода 👑',
    badgeEn: 'Best Value 👑',
    icon: '👑',
  },
]

export const ShopPage = () => {
  const { lang, t } = useTranslation()
  const navigate = useNavigate()

  const coins = useShopStore((state) => state.coins)
  const isUnlocked = useShopStore((state) => state.isUnlocked)
  const buyPart = useShopStore((state) => state.buyPart)
  const credit = useShopStore((state) => state.credit)
  const activeCatSkin = useShopStore((state) => state.activeCatSkin)
  const activeThemeSkin = useShopStore((state) => state.activeThemeSkin)
  const equipCatSkin = useShopStore((state) => state.equipCatSkin)
  const equipThemeSkin = useShopStore((state) => state.equipThemeSkin)
  const themeMode = useDailyStore((state) => state.themeMode)

  const isLight =
    (themeMode ?? 'system') === 'system'
      ? typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      : themeMode === 'light'

  const [activePack, setActivePack] = useState<RealMoneyPack | null>(null)
  const [purchaseSuccessNotice, setPurchaseSuccessNotice] = useState<string | null>(null)
  const [payModalProcessing, setPayModalProcessing] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<string | null>(() => getCurrentAmbientTrack())

  const isEn = lang === 'en'

  const handleBuyPart = async (key: ShopItemKey) => {
    const result = await buyPart(key)
    if (!result.success) {
      const message =
        result.error === 'insufficient'
          ? t('shop.not-enough-coins-for-this-purchase', 'Недостаточно монет для покупки.')
          : t('shop.purchase-failed-check-your-connection', 'Не удалось купить. Проверьте соединение.')
      setPurchaseSuccessNotice(message)
      setTimeout(() => setPurchaseSuccessNotice(null), 3000)
      return
    }

    playVictoryFanfare()
    let title = ''
    if (key === 'lottery') {
      title = t('shop.medieval-battle-lottery-unlocked', 'Средневековая лотерея разблокирована!')
    } else if (key === 'statham') {
      title = t('shop.jason-statham-section-unlocked', 'Раздел Джейсона Стэтхэма разблокирован!')
    } else if (key === 'cat_wizard') {
      title = t('shop.wizard-cat-costume-unlocked', 'Костюм Кота-Чародея открыт!')
      equipCatSkin('wizard')
    } else if (key === 'cat_cyber') {
      title = t('shop.cyber-cat-costume-unlocked', 'Костюм Кибер-Кота открыт!')
      equipCatSkin('cyber')
    } else if (key === 'theme_cyberpunk') {
      title = t('shop.cyberpunk-vip-theme-unlocked', 'VIP-тема Киберпанк активирована!')
      equipThemeSkin('cyberpunk')
    } else if (key === 'theme_midnight_gold') {
      title = t('shop.midnight-gold-vip-theme-unlocked', 'VIP-тема Королевское Золото активирована!')
      equipThemeSkin('midnight_gold')
    } else if (key === 'sound_lofi') {
      title = t('shop.lo-fi-ambient-sound-box-unlocked', 'Lo-Fi Шкатулка звуков открыта!')
    }

    setPurchaseSuccessNotice(title)
    setTimeout(() => setPurchaseSuccessNotice(null), 3000)
  }

  const handleSimulatePayment = () => {
    if (!activePack) return
    setPayModalProcessing(true)

    setTimeout(() => {
      credit(activePack.id, activePack.coins)
      playBattleHorn()
      setPayModalProcessing(false)
      const notice = t('shop.purchaseSuccess', undefined, { coins: activePack.coins.toLocaleString() })
      setActivePack(null)
      setPurchaseSuccessNotice(notice)
      setTimeout(() => setPurchaseSuccessNotice(null), 3500)
    }, 1200)
  }

  const handleAmbientPlay = (track: 'rain' | 'fire' | 'drone') => {
    if (currentTrack === track) {
      stopAmbientSound()
      setCurrentTrack(null)
    } else {
      const ok = playAmbientSound(track)
      if (ok) setCurrentTrack(track)
    }
  }

  const handleAmbientStop = () => {
    stopAmbientSound()
    setCurrentTrack(null)
  }

  return (
    <div className="page-shell">
      <AppTopbar />

      <main className="shop-page">
        {purchaseSuccessNotice && (
          <div className="shop-toast" role="status" aria-live="polite">
            <CheckCircle2 size={16} />
            <span>{purchaseSuccessNotice}</span>
          </div>
        )}

        {activePack && (
          <div className="shop-pay-modal-backdrop" role="dialog" aria-modal="true">
            <div className="shop-pay-card">
              <button type="button" className="shop-pay-close" onClick={() => !payModalProcessing && setActivePack(null)}>
                <X size={16} />
              </button>

              <div className="shop-pay-header">
                <span className="shop-pay-icon">{activePack.icon}</span>
                <h3>{isEn ? activePack.nameEn : activePack.nameRu}</h3>
                <div className="shop-pay-amount">
                  +{activePack.coins.toLocaleString()} {t('shop.coins')}
                </div>
              </div>

              <div className="shop-pay-details">
                <div className="shop-pay-row">
                  <span>{t('shop.price')}</span>
                  <strong>{isEn ? `$${activePack.priceUsd}` : `${activePack.priceRub} ₽`}</strong>
                </div>
                <div className="shop-pay-row">
                  <span>{t('shop.delivery')}</span>
                  <strong className="text-instant">{t('shop.instant')}</strong>
                </div>
                <div className="shop-pay-row">
                  <span>{t('shop.security')}</span>
                  <span>{t('shop.256-bit-encrypted-simulation', 'Защищённый шлюз')}</span>
                </div>
              </div>

              <button type="button" className="shop-pay-confirm-btn" onClick={handleSimulatePayment} disabled={payModalProcessing}>
                {payModalProcessing ? (
                  <span>{t('shop.processing')}</span>
                ) : (
                  <>
                    <CreditCard size={15} />
                    <span>{t('shop.payAndReceive', undefined, { usd: activePack.priceUsd, rub: activePack.priceRub })}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <header className="shop-head">
          <div className="shop-head-meta">
            <p className="eyebrow">
              <Crown size={15} /> {t('shop.royal-marketplace', 'королевская ярмарка')}
            </p>
            <div className="shop-balance-pill">
              <Coins size={18} className="shop-balance-coin" />
              <span>{t('shop.treasury')}</span>
              <strong>{coins.toLocaleString()} 🪙</strong>
            </div>
          </div>

          <h1>{t('shop.royal-market-shop', 'Королевский Магазин')}</h1>
          <p className="intro">
            {t(
              'shop.unlock-special-sections-unique-virtual-cat-costu',
              'Разблокируй разделы сайта, уникальные образы кота, VIP-темы оформления и расслабляющий Lo-Fi звук за золотые монеты.',
            )}
          </p>
        </header>

        <section className="shop-section">
          <div className="shop-section-head">
            <div className="section-title-wrap">
              <ShoppingBag size={18} className="section-icon" />
              <h2>{t('shop.unlockable-sections', 'Разделы сайта')}</h2>
            </div>
            <p className="section-desc">
              {t(
                'shop.each-exclusive-realm-costs-250-coins-once-unlock',
                'Каждый эксклюзивный раздел стоит 250 монет. После покупки он остаётся открыт навсегда.',
              )}
            </p>
          </div>

          <div className="shop-cards-grid">
            <div className={`shop-item-card ${isUnlocked('lottery') ? 'is-unlocked' : ''}`}>
              <div className="shop-item-badge">
                {isUnlocked('lottery') ? (
                  <span className="badge-bought">
                    <Check size={12} /> {t('shop.unlocked')}
                  </span>
                ) : (
                  <span className="badge-price">{PART_PRICES.lottery} 🪙</span>
                )}
              </div>

              <div className="shop-item-hero">
                <div className="shop-item-icon-box box-lottery">
                  <Swords size={28} />
                </div>
                <div>
                  <h3 className="shop-item-title">{t('shop.medieval-battle-lottery', 'Средневековая лотерея: Битва')}</h3>
                  <span className="shop-item-tag">{t('shop.emerald-dragon-vs-amethyst-raven', 'Зелёные vs Фиолетовые')}</span>
                </div>
              </div>

              <p className="shop-item-desc">
                {t(
                  'shop.tactical-clash-between-kingdoms-recruit-swordsme',
                  'Тактическое сражение королевств. Нанимай мечников, лучников, рыцарей и магов. Скрытые шансы и золотые боевые трофеи.',
                )}
              </p>

              <div className="shop-item-footer">
                {isUnlocked('lottery') ? (
                  <button type="button" className="shop-open-btn" onClick={() => navigate('/misc/lottery')}>
                    <span>{t('shop.enter-arena', 'Перейти в битву ⚔️')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="shop-buy-btn"
                    onClick={() => handleBuyPart('lottery')}
                    disabled={coins < PART_PRICES.lottery}
                  >
                    <Sparkles size={14} />
                    <span>{t('shop.unlockFor', undefined, { price: PART_PRICES.lottery })}</span>
                  </button>
                )}
              </div>
            </div>

            <div className={`shop-item-card ${isUnlocked('statham') ? 'is-unlocked' : ''}`}>
              <div className="shop-item-badge">
                {isUnlocked('statham') ? (
                  <span className="badge-bought">
                    <Check size={12} /> {t('shop.unlocked')}
                  </span>
                ) : (
                  <span className="badge-price">{PART_PRICES.statham} 🪙</span>
                )}
              </div>

              <div className="shop-item-hero">
                <div className="shop-item-icon-box box-statham">
                  <Flame size={28} />
                </div>
                <div>
                  <h3 className="shop-item-title">{t('shop.jason-statham-memes-quotes', 'Джейсон Стэйтем: Мемы и Цитаты')}</h3>
                  <span className="shop-item-tag">{t('shop.wisdom-soundboard-costumes', 'Цитаты, пацанский саундборд и образы')}</span>
                </div>
              </div>

              <p className="shop-item-desc">
                {t(
                  'shop.legendary-street-quotes-interactive-costumes-wit',
                  'Легендарные уличные цитаты, интерактивная примерка парика и носа Стэйтему, клоунометр, звуковые сигналы и коллекция мемов.',
                )}
              </p>

              <div className="shop-item-footer">
                {isUnlocked('statham') ? (
                  <button type="button" className="shop-open-btn" onClick={() => navigate('/misc/fun')}>
                    <span>{t('shop.open-statham', 'Открыть Стэйтема 🐺')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="shop-buy-btn"
                    onClick={() => handleBuyPart('statham')}
                    disabled={coins < PART_PRICES.statham}
                  >
                    <Sparkles size={14} />
                    <span>{t('shop.unlockFor', undefined, { price: PART_PRICES.statham })}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="shop-section">
          <div className="shop-section-head">
            <div className="section-title-wrap">
              <Wand2 size={18} className="section-icon" />
              <h2>{t('shop.cat-assistant-wardrobe', 'Гардероб Кота-Ассистента')}</h2>
            </div>
            <p className="section-desc">
              {t(
                'shop.equip-exclusive-animated-skins-for-your-virtual-',
                'Эксклюзивные анимированные скины для премиального аватара кота-помощника.',
              )}
            </p>
          </div>

          <div className="shop-cards-grid">
            <div className={`shop-item-card ${isUnlocked('cat_wizard') ? 'is-unlocked' : ''}`}>
              <div className="shop-item-badge">
                {isUnlocked('cat_wizard') ? (
                  <span className="badge-bought">
                    <Check size={12} /> {t('shop.unlocked')}
                  </span>
                ) : (
                  <span className="badge-price">{PART_PRICES.cat_wizard} 🪙</span>
                )}
              </div>

              <div className="shop-item-hero">
                <div className="shop-item-preview-cat">
                  <CatPremiumAvatar size={50} skin="wizard" />
                </div>
                <div>
                  <h3 className="shop-item-title">{t('shop.wizard-cat', 'Кот-Чародей 🧙‍♂️')}</h3>
                  <span className="shop-item-tag">{t('shop.magic-star-hat-celestial-glow', 'Волшебный колпак и звёздная аура')}</span>
                </div>
              </div>

              <p className="shop-item-desc">
                {t(
                  'shop.transforms-your-cat-assistant-into-an-ancient-so',
                  'Превращает кота-ассистента в древнего мага в остроконечном колпаке с золотыми звёздами и искрами.',
                )}
              </p>

              <div className="shop-item-footer">
                {isUnlocked('cat_wizard') ? (
                  <div className="shop-actions-split">
                    <button
                      type="button"
                      className={`shop-equip-btn ${activeCatSkin === 'wizard' ? 'is-active' : ''}`}
                      onClick={() => equipCatSkin(activeCatSkin === 'wizard' ? 'classic' : 'wizard')}
                    >
                      {activeCatSkin === 'wizard' ? (
                        <>
                          <Check size={14} /> <span>{t('shop.equipped')}</span>
                        </>
                      ) : (
                        <span>{t('shop.equip-costume', 'Надеть костюм')}</span>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="shop-buy-btn"
                    onClick={() => handleBuyPart('cat_wizard')}
                    disabled={coins < PART_PRICES.cat_wizard}
                  >
                    <Sparkles size={14} />
                    <span>{t('shop.unlockFor', undefined, { price: PART_PRICES.cat_wizard })}</span>
                  </button>
                )}
              </div>
            </div>

            <div className={`shop-item-card ${isUnlocked('cat_cyber') ? 'is-unlocked' : ''}`}>
              <div className="shop-item-badge">
                {isUnlocked('cat_cyber') ? (
                  <span className="badge-bought">
                    <Check size={12} /> {t('shop.unlocked')}
                  </span>
                ) : (
                  <span className="badge-price">{PART_PRICES.cat_cyber} 🪙</span>
                )}
              </div>

              <div className="shop-item-hero">
                <div className="shop-item-preview-cat">
                  <CatPremiumAvatar size={50} skin="cyber" />
                </div>
                <div>
                  <h3 className="shop-item-title">{t('shop.cyber-cat-2077', 'Кибер-Кот 🐱⚡')}</h3>
                  <span className="shop-item-tag">{t('shop.neon-cyan-visor-antenna', 'Неоновый визор и антенна')}</span>
                </div>
              </div>

              <p className="shop-item-desc">
                {t(
                  'shop.futuristic-cybernetic-enhancements-glowing-cyan-',
                  'Футуристический визор с неоновым интерфейсом, коммуникационная антенна и кибер-аура.',
                )}
              </p>

              <div className="shop-item-footer">
                {isUnlocked('cat_cyber') ? (
                  <div className="shop-actions-split">
                    <button
                      type="button"
                      className={`shop-equip-btn ${activeCatSkin === 'cyber' ? 'is-active' : ''}`}
                      onClick={() => equipCatSkin(activeCatSkin === 'cyber' ? 'classic' : 'cyber')}
                    >
                      {activeCatSkin === 'cyber' ? (
                        <>
                          <Check size={14} /> <span>{t('shop.equipped')}</span>
                        </>
                      ) : (
                        <span>{t('shop.equip-costume', 'Надеть костюм')}</span>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="shop-buy-btn"
                    onClick={() => handleBuyPart('cat_cyber')}
                    disabled={coins < PART_PRICES.cat_cyber}
                  >
                    <Sparkles size={14} />
                    <span>{t('shop.unlockFor', undefined, { price: PART_PRICES.cat_cyber })}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="shop-section">
          <div className="shop-section-head">
            <div className="section-title-wrap">
              <Palette size={18} className="section-icon" />
              <h2>{t('shop.vip-themes-color-schemes', 'Премиальные темы оформления')}</h2>
            </div>
            <p className="section-desc">
              {t(
                'shop.luxurious-palettes-for-the-entire-application-in',
                'Уникальные дизайнерские цветовые гаммы для всего интерфейса приложения.',
              )}
            </p>
          </div>

          <div className="shop-cards-grid">
            <div className={`shop-item-card ${isUnlocked('theme_cyberpunk') ? 'is-unlocked' : ''}`}>
              <div className="shop-item-badge">
                {isUnlocked('theme_cyberpunk') ? (
                  <span className="badge-bought">
                    <Check size={12} /> {t('shop.unlocked')}
                  </span>
                ) : (
                  <span className="badge-price">{PART_PRICES.theme_cyberpunk} 🪙</span>
                )}
              </div>

              <div className="shop-item-hero">
                <div className="shop-item-icon-box box-cyber">
                  <Zap size={28} />
                </div>
                <div>
                  <h3 className="shop-item-title">{t('shop.neon-cyberpunk', 'Неоновый Киберпанк')}</h3>
                  <div className="theme-palette-dots">
                    <span style={{ background: isLight ? '#f1f6fc' : '#090a14' }} title={t('shop.canvas')} />
                    <span style={{ background: isLight ? '#0077b6' : '#00f2fe' }} title={t('shop.cyan-accent', 'Циан')} />
                    <span style={{ background: isLight ? '#d40066' : '#ff007f' }} title={t('shop.magenta-accent', 'Маджента')} />
                  </div>
                </div>
              </div>

              <p className="shop-item-desc">
                {t(
                  'shop.dual-theme-adapts-to-light-dark-modes-clean-ice-',
                  'Двойная тема (адаптируется к светлому и тёмному режимам). Ледяной кибер-фон со светящимся цианом в светлом режиме и глубокий сапфир с неоном в тёмном.',
                )}
              </p>

              <div className="shop-item-footer">
                {isUnlocked('theme_cyberpunk') ? (
                  <button
                    type="button"
                    className={`shop-equip-btn ${activeThemeSkin === 'cyberpunk' ? 'is-active' : ''}`}
                    onClick={() => equipThemeSkin(activeThemeSkin === 'cyberpunk' ? 'default' : 'cyberpunk')}
                  >
                    {activeThemeSkin === 'cyberpunk' ? (
                      <>
                        <Check size={14} /> <span>{t('shop.theme-active', 'Тема активна')}</span>
                      </>
                    ) : (
                      <span>{t('shop.apply-cyberpunk', 'Применить тему')}</span>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="shop-buy-btn"
                    onClick={() => handleBuyPart('theme_cyberpunk')}
                    disabled={coins < PART_PRICES.theme_cyberpunk}
                  >
                    <Sparkles size={14} />
                    <span>{t('shop.unlockFor', undefined, { price: PART_PRICES.theme_cyberpunk })}</span>
                  </button>
                )}
              </div>
            </div>

            <div className={`shop-item-card ${isUnlocked('theme_midnight_gold') ? 'is-unlocked' : ''}`}>
              <div className="shop-item-badge">
                {isUnlocked('theme_midnight_gold') ? (
                  <span className="badge-bought">
                    <Check size={12} /> {t('shop.unlocked')}
                  </span>
                ) : (
                  <span className="badge-price">{PART_PRICES.theme_midnight_gold} 🪙</span>
                )}
              </div>

              <div className="shop-item-hero">
                <div className="shop-item-icon-box box-gold">
                  <Crown size={28} />
                </div>
                <div>
                  <h3 className="shop-item-title">{t('shop.midnight-gold', 'Королевское Золото')}</h3>
                  <div className="theme-palette-dots">
                    <span style={{ background: isLight ? '#faf6ed' : '#0d0c0a' }} title={t('shop.canvas')} />
                    <span style={{ background: isLight ? '#b38206' : '#ffd700' }} title={t('shop.gold-accent', 'Золото')} />
                    <span style={{ background: isLight ? '#c0631c' : '#e5a93c' }} title={t('shop.amber-accent', 'Янтарь')} />
                  </div>
                </div>
              </div>

              <p className="shop-item-desc">
                {t(
                  'shop.dual-theme-adapts-to-light-dark-modes-regal-cham',
                  'Двойная тема (адаптируется к светлому и тёмному режимам). Благородная слоновая кость в светлом режиме и обсидиановый фон с золотым тиснением в тёмном.',
                )}
              </p>

              <div className="shop-item-footer">
                {isUnlocked('theme_midnight_gold') ? (
                  <button
                    type="button"
                    className={`shop-equip-btn ${activeThemeSkin === 'midnight_gold' ? 'is-active' : ''}`}
                    onClick={() => equipThemeSkin(activeThemeSkin === 'midnight_gold' ? 'default' : 'midnight_gold')}
                  >
                    {activeThemeSkin === 'midnight_gold' ? (
                      <>
                        <Check size={14} /> <span>{t('shop.theme-active', 'Тема активна')}</span>
                      </>
                    ) : (
                      <span>{t('shop.apply-midnight-gold', 'Применить тему')}</span>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="shop-buy-btn"
                    onClick={() => handleBuyPart('theme_midnight_gold')}
                    disabled={coins < PART_PRICES.theme_midnight_gold}
                  >
                    <Sparkles size={14} />
                    <span>{t('shop.unlockFor', undefined, { price: PART_PRICES.theme_midnight_gold })}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="shop-section">
          <div className="shop-section-head">
            <div className="section-title-wrap">
              <Headphones size={18} className="section-icon" />
              <h2>{t('shop.lo-fi-focus-sound-box', 'Lo-Fi Звуковая шкатулка')}</h2>
            </div>
            <p className="section-desc">
              {t(
                'shop.synthesized-relaxing-ambient-sounds-for-producti',
                'Процедурные расслабляющие звуки для продуктивной работы, чтения и медитации.',
              )}
            </p>
          </div>

          <div className="shop-cards-grid">
            <div className={`shop-item-card lo-fi-card ${isUnlocked('sound_lofi') ? 'is-unlocked' : ''}`}>
              <div className="shop-item-badge">
                {isUnlocked('sound_lofi') ? (
                  <span className="badge-bought">
                    <Check size={12} /> {t('shop.unlocked')}
                  </span>
                ) : (
                  <span className="badge-price">{PART_PRICES.sound_lofi} 🪙</span>
                )}
              </div>

              <div className="shop-item-hero">
                <div className="shop-item-icon-box box-sound">
                  <Volume2 size={28} />
                </div>
                <div>
                  <h3 className="shop-item-title">{t('shop.procedural-soundscapes', 'Процедурный эмбиент-генератор')}</h3>
                  <span className="shop-item-tag">{t('shop.cozy-rain-fireplace-deep-drone', 'Уютный дождь, камин и космический гул')}</span>
                </div>
              </div>

              <p className="shop-item-desc">
                {t(
                  'shop.real-time-generated-procedural-audio-via-web-aud',
                  'Генерация звука в реальном времени прямо в браузере. Без расхода трафика, успокаивает ум и помогает сосредоточиться.',
                )}
              </p>

              <div className="shop-item-footer">
                {isUnlocked('sound_lofi') ? (
                  <div className="ambient-player-panel">
                    <div className="ambient-buttons-row">
                      <button
                        type="button"
                        className={`ambient-btn ${currentTrack === 'rain' ? 'is-playing' : ''}`}
                        onClick={() => handleAmbientPlay('rain')}
                      >
                        <CloudRain size={14} />
                        <span>{t('shop.rain')}</span>
                      </button>
                      <button
                        type="button"
                        className={`ambient-btn ${currentTrack === 'fire' ? 'is-playing' : ''}`}
                        onClick={() => handleAmbientPlay('fire')}
                      >
                        <Flame size={14} />
                        <span>{t('shop.fireplace')}</span>
                      </button>
                      <button
                        type="button"
                        className={`ambient-btn ${currentTrack === 'drone' ? 'is-playing' : ''}`}
                        onClick={() => handleAmbientPlay('drone')}
                      >
                        <Zap size={14} />
                        <span>{t('shop.drone')}</span>
                      </button>
                      {currentTrack && (
                        <button
                          type="button"
                          className="ambient-btn ambient-stop-btn"
                          onClick={handleAmbientStop}
                          title={t('shop.stop-audio', 'Остановить звук')}
                        >
                          <Square size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="shop-buy-btn"
                    onClick={() => handleBuyPart('sound_lofi')}
                    disabled={coins < PART_PRICES.sound_lofi}
                  >
                    <Sparkles size={14} />
                    <span>{t('shop.unlockFor', undefined, { price: PART_PRICES.sound_lofi })}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="shop-section">
          <div className="shop-section-head">
            <div className="section-title-wrap">
              <HelpCircle size={18} className="section-icon" />
              <h2>{t('shop.how-to-earn-coins', 'Как зарабатывать коины')}</h2>
            </div>
            <p className="section-desc">
              {t(
                'shop.grow-your-treasury-through-daily-habits-friendsh',
                'Пополняй казну регулярными привычками, дружбой и боевой славой.',
              )}
            </p>
          </div>

          <div className="earn-ways-grid">
            <div className="earn-way-card">
              <div className="earn-way-icon">
                <Zap size={20} />
              </div>
              <div className="earn-way-info">
                <strong>{t('shop.productivity-tasks', 'Продуктивность и дела')}</strong>
                <p>
                  {t(
                    'shop.check-off-tasks-10-achieve-goals-100-and-realize',
                    'Отмечай задачи (+10 🪙), достигай целей (+100 🪙) и исполняй мечты (+1000 🪙).',
                  )}
                </p>
                <Link to="/extra/productivity/task" className="earn-link">
                  {t('shop.go-to-tasks', 'В задачи →')}
                </Link>
              </div>
            </div>

            <div className="earn-way-card">
              <div className="earn-way-icon">
                <Mail size={20} />
              </div>
              <div className="earn-way-info">
                <strong>{t('shop.dream-diary-greetings', 'Приветствия в снах')}</strong>
                <p>
                  {t(
                    'shop.send-a-greeting-to-a-friend-in-the-dream-diary-o',
                    'Отправь приветствие другу в Дневнике снов. При следующем входе получи ответ и подарок +100 🪙.',
                  )}
                </p>
                <Link to="/notes" className="earn-link">
                  {t('shop.open-dream-diary', 'В дневник снов →')}
                </Link>
              </div>
            </div>

            <div className="earn-way-card">
              <div className="earn-way-icon">
                <Shield size={20} />
              </div>
              <div className="earn-way-info">
                <strong>{t('shop.arena-victories', 'Победы в лотерее')}</strong>
                <p>
                  {t(
                    'shop.assemble-troops-in-the-medieval-clash-winning-ar',
                    'Собирай армии в Битве Королевств. Армия-победитель приносит трофеи +35..+65 🪙.',
                  )}
                </p>
                <Link to="/misc/lottery" className="earn-link">
                  {t('shop.to-the-arena', 'На арену →')}
                </Link>
              </div>
            </div>

            <div className="earn-way-card">
              <div className="earn-way-icon">
                <UserPlus size={20} />
              </div>
              <div className="earn-way-info">
                <strong>{t('shop.invite-a-friend', 'Пригласи друга')}</strong>
                <p>
                  {t(
                    'shop.share-your-referral-code-when-a-friend-signs-up-',
                    'Поделись своим реферальным кодом. Когда друг зарегистрируется, ты получишь +250 🪙, а он +100 🪙.',
                  )}
                </p>
                <Link to="/auth" className="earn-link">
                  {t('shop.get-my-code', 'Мой код →')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="shop-section treasury-packs-section">
          <div className="shop-section-head">
            <div className="section-title-wrap">
              <Crown size={18} className="section-icon" />
              <h2>{t('shop.royal-treasury-vault', 'Королевская сокровищница')}</h2>
            </div>
            <p className="section-desc">
              {t(
                'shop.need-instant-resources-support-the-development-a',
                'Нужно больше золота? Поддержи развитие проекта и пополни запасы монет премиальными наборами.',
              )}
            </p>
          </div>

          <div className="packs-grid">
            {REAL_MONEY_PACKS.map((pack) => (
              <div key={pack.id} className={`pack-card ${pack.badgeRu ? 'has-badge' : ''}`}>
                {pack.badgeRu && <span className="pack-badge">{isEn ? pack.badgeEn : pack.badgeRu}</span>}

                <div className="pack-icon">{pack.icon}</div>
                <h3 className="pack-name">{isEn ? pack.nameEn : pack.nameRu}</h3>
                <div className="pack-coins">+{pack.coins.toLocaleString()} 🪙</div>

                <button type="button" className="pack-buy-btn" onClick={() => setActivePack(pack)}>
                  <CreditCard size={14} />
                  <span>{isEn ? `$${pack.priceUsd}` : `${pack.priceRub} ₽`}</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
