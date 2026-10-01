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
  const { lang } = useTranslation()
  const navigate = useNavigate()

  const coins = useShopStore((state) => state.coins)
  const isUnlocked = useShopStore((state) => state.isUnlocked)
  const buyPart = useShopStore((state) => state.buyPart)
  const addCoins = useShopStore((state) => state.addCoins)
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

  const handleBuyPart = (key: ShopItemKey) => {
    const success = buyPart(key)
    if (success) {
      playVictoryFanfare()
      let title = ''
      if (key === 'lottery') {
        title = isEn ? 'Medieval Battle Lottery unlocked!' : 'Средневековая лотерея разблокирована!'
      } else if (key === 'statham') {
        title = isEn ? 'Jason Statham section unlocked!' : 'Раздел Джейсона Стэтхэма разблокирован!'
      } else if (key === 'cat_wizard') {
        title = isEn ? 'Wizard Cat costume unlocked!' : 'Костюм Кота-Чародея открыт!'
        equipCatSkin('wizard')
      } else if (key === 'cat_cyber') {
        title = isEn ? 'Cyber Cat costume unlocked!' : 'Костюм Кибер-Кота открыт!'
        equipCatSkin('cyber')
      } else if (key === 'theme_cyberpunk') {
        title = isEn ? 'Cyberpunk VIP theme unlocked!' : 'VIP-тема Киберпанк активирована!'
        equipThemeSkin('cyberpunk')
      } else if (key === 'theme_midnight_gold') {
        title = isEn ? 'Midnight Gold VIP theme unlocked!' : 'VIP-тема Королевское Золото активирована!'
        equipThemeSkin('midnight_gold')
      } else if (key === 'sound_lofi') {
        title = isEn ? 'Lo-Fi Ambient Sound Box unlocked!' : 'Lo-Fi Шкатулка звуков открыта!'
      }

      setPurchaseSuccessNotice(title)
      setTimeout(() => setPurchaseSuccessNotice(null), 3000)
    }
  }

  const handleSimulatePayment = () => {
    if (!activePack) return
    setPayModalProcessing(true)

    setTimeout(() => {
      addCoins(activePack.coins)
      playBattleHorn()
      setPayModalProcessing(false)
      const notice = isEn
        ? `Successfully purchased +${activePack.coins.toLocaleString()} Coins!`
        : `Казна пополнена на +${activePack.coins.toLocaleString()} 🪙!`
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
                  +{activePack.coins.toLocaleString()} {isEn ? 'Coins' : 'монет'}
                </div>
              </div>

              <div className="shop-pay-details">
                <div className="shop-pay-row">
                  <span>{isEn ? 'Price:' : 'Стоимость:'}</span>
                  <strong>{isEn ? `$${activePack.priceUsd}` : `${activePack.priceRub} ₽`}</strong>
                </div>
                <div className="shop-pay-row">
                  <span>{isEn ? 'Delivery:' : 'Доставка:'}</span>
                  <strong className="text-instant">{isEn ? 'Instant' : 'Мгновенно'}</strong>
                </div>
                <div className="shop-pay-row">
                  <span>{isEn ? 'Security:' : 'Безопасность:'}</span>
                  <span>{isEn ? '256-bit encrypted simulation' : 'Защищённый шлюз'}</span>
                </div>
              </div>

              <button type="button" className="shop-pay-confirm-btn" onClick={handleSimulatePayment} disabled={payModalProcessing}>
                {payModalProcessing ? (
                  <span>{isEn ? 'Processing...' : 'Обработка платежа...'}</span>
                ) : (
                  <>
                    <CreditCard size={15} />
                    <span>
                      {isEn ? `Pay $${activePack.priceUsd} & Receive Coins 🪙` : `Оплатить ${activePack.priceRub} ₽ и забрать 🪙`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <header className="shop-head">
          <div className="shop-head-meta">
            <p className="eyebrow">
              <Crown size={15} /> {isEn ? 'royal marketplace' : 'королевская ярмарка'}
            </p>
            <div className="shop-balance-pill">
              <Coins size={18} className="shop-balance-coin" />
              <span>{isEn ? 'Treasury:' : 'В казне:'}</span>
              <strong>{coins.toLocaleString()} 🪙</strong>
            </div>
          </div>

          <h1>{isEn ? 'Royal Market & Shop' : 'Королевский Магазин'}</h1>
          <p className="intro">
            {isEn
              ? 'Unlock special sections, unique virtual cat costumes, VIP themes, and ambient audio with your treasury coins.'
              : 'Разблокируй разделы сайта, уникальные образы кота, VIP-темы оформления и расслабляющий Lo-Fi звук за золотые монеты.'}
          </p>
        </header>

        <section className="shop-section">
          <div className="shop-section-head">
            <div className="section-title-wrap">
              <ShoppingBag size={18} className="section-icon" />
              <h2>{isEn ? 'Unlockable Sections' : 'Разделы сайта'}</h2>
            </div>
            <p className="section-desc">
              {isEn
                ? 'Each exclusive realm costs 250 coins. Once unlocked, it remains accessible forever.'
                : 'Каждый эксклюзивный раздел стоит 250 монет. После покупки он остаётся открыт навсегда.'}
            </p>
          </div>

          <div className="shop-cards-grid">
            <div className={`shop-item-card ${isUnlocked('lottery') ? 'is-unlocked' : ''}`}>
              <div className="shop-item-badge">
                {isUnlocked('lottery') ? (
                  <span className="badge-bought">
                    <Check size={12} /> {isEn ? 'Unlocked' : 'Открыто'}
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
                  <h3 className="shop-item-title">{isEn ? 'Medieval Battle Lottery' : 'Средневековая лотерея: Битва'}</h3>
                  <span className="shop-item-tag">{isEn ? 'Emerald Dragon vs Amethyst Raven' : 'Зелёные vs Фиолетовые'}</span>
                </div>
              </div>

              <p className="shop-item-desc">
                {isEn
                  ? 'Tactical clash between kingdoms. Recruit swordsmen, archers, knights and siege mages. Hidden odds and golden victory plunder.'
                  : 'Тактическое сражение королевств. Нанимай мечников, лучников, рыцарей и магов. Скрытые шансы и золотые боевые трофеи.'}
              </p>

              <div className="shop-item-footer">
                {isUnlocked('lottery') ? (
                  <button type="button" className="shop-open-btn" onClick={() => navigate('/misc/lottery')}>
                    <span>{isEn ? 'Enter Arena ⚔️' : 'Перейти в битву ⚔️'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="shop-buy-btn"
                    onClick={() => handleBuyPart('lottery')}
                    disabled={coins < PART_PRICES.lottery}
                  >
                    <Sparkles size={14} />
                    <span>{isEn ? `Unlock for ${PART_PRICES.lottery} 🪙` : `Купить за ${PART_PRICES.lottery} 🪙`}</span>
                  </button>
                )}
              </div>
            </div>

            <div className={`shop-item-card ${isUnlocked('statham') ? 'is-unlocked' : ''}`}>
              <div className="shop-item-badge">
                {isUnlocked('statham') ? (
                  <span className="badge-bought">
                    <Check size={12} /> {isEn ? 'Unlocked' : 'Открыто'}
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
                  <h3 className="shop-item-title">{isEn ? 'Jason Statham: Memes & Quotes' : 'Джейсон Стэйтем: Мемы и Цитаты'}</h3>
                  <span className="shop-item-tag">{isEn ? 'Wisdom, soundboard & costumes' : 'Цитаты, пацанский саундборд и образы'}</span>
                </div>
              </div>

              <p className="shop-item-desc">
                {isEn
                  ? 'Legendary street quotes, interactive costumes with wig and red clown nose, clown-meter, soundboard and funny memes.'
                  : 'Легендарные уличные цитаты, интерактивная примерка парика и носа Стэйтему, клоунометр, звуковые сигналы и коллекция мемов.'}
              </p>

              <div className="shop-item-footer">
                {isUnlocked('statham') ? (
                  <button type="button" className="shop-open-btn" onClick={() => navigate('/misc/fun')}>
                    <span>{isEn ? 'Open Statham 🐺' : 'Открыть Стэйтема 🐺'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="shop-buy-btn"
                    onClick={() => handleBuyPart('statham')}
                    disabled={coins < PART_PRICES.statham}
                  >
                    <Sparkles size={14} />
                    <span>{isEn ? `Unlock for ${PART_PRICES.statham} 🪙` : `Купить за ${PART_PRICES.statham} 🪙`}</span>
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
              <h2>{isEn ? 'Cat Assistant Wardrobe' : 'Гардероб Кота-Ассистента'}</h2>
            </div>
            <p className="section-desc">
              {isEn
                ? 'Equip exclusive animated skins for your virtual cat avatar in normal mode.'
                : 'Эксклюзивные анимированные скины для премиального аватара кота-помощника.'}
            </p>
          </div>

          <div className="shop-cards-grid">
            <div className={`shop-item-card ${isUnlocked('cat_wizard') ? 'is-unlocked' : ''}`}>
              <div className="shop-item-badge">
                {isUnlocked('cat_wizard') ? (
                  <span className="badge-bought">
                    <Check size={12} /> {isEn ? 'Unlocked' : 'Открыто'}
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
                  <h3 className="shop-item-title">{isEn ? 'Wizard Cat' : 'Кот-Чародей 🧙‍♂️'}</h3>
                  <span className="shop-item-tag">{isEn ? 'Magic star hat & celestial glow' : 'Волшебный колпак и звёздная аура'}</span>
                </div>
              </div>

              <p className="shop-item-desc">
                {isEn
                  ? 'Transforms your cat assistant into an ancient sorcerer with a star-crested conical hat and mystical sparkle effects.'
                  : 'Превращает кота-ассистента в древнего мага в остроконечном колпаке с золотыми звёздами и искрами.'}
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
                          <Check size={14} /> <span>{isEn ? 'Equipped' : 'Надето'}</span>
                        </>
                      ) : (
                        <span>{isEn ? 'Equip Costume' : 'Надеть костюм'}</span>
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
                    <span>{isEn ? `Unlock for ${PART_PRICES.cat_wizard} 🪙` : `Купить за ${PART_PRICES.cat_wizard} 🪙`}</span>
                  </button>
                )}
              </div>
            </div>

            <div className={`shop-item-card ${isUnlocked('cat_cyber') ? 'is-unlocked' : ''}`}>
              <div className="shop-item-badge">
                {isUnlocked('cat_cyber') ? (
                  <span className="badge-bought">
                    <Check size={12} /> {isEn ? 'Unlocked' : 'Открыто'}
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
                  <h3 className="shop-item-title">{isEn ? 'Cyber-Cat 2077' : 'Кибер-Кот 🐱⚡'}</h3>
                  <span className="shop-item-tag">{isEn ? 'Neon cyan visor & antenna' : 'Неоновый визор и антенна'}</span>
                </div>
              </div>

              <p className="shop-item-desc">
                {isEn
                  ? 'Futuristic cybernetic enhancements: glowing cyan tactical HUD visor, ear communications antenna, and cyber aura.'
                  : 'Футуристический визор с неоновым интерфейсом, коммуникационная антенна и кибер-аура.'}
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
                          <Check size={14} /> <span>{isEn ? 'Equipped' : 'Надето'}</span>
                        </>
                      ) : (
                        <span>{isEn ? 'Equip Costume' : 'Надеть костюм'}</span>
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
                    <span>{isEn ? `Unlock for ${PART_PRICES.cat_cyber} 🪙` : `Купить за ${PART_PRICES.cat_cyber} 🪙`}</span>
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
              <h2>{isEn ? 'VIP Themes & Color Schemes' : 'Премиальные темы оформления'}</h2>
            </div>
            <p className="section-desc">
              {isEn
                ? 'Luxurious palettes for the entire application interface.'
                : 'Уникальные дизайнерские цветовые гаммы для всего интерфейса приложения.'}
            </p>
          </div>

          <div className="shop-cards-grid">
            <div className={`shop-item-card ${isUnlocked('theme_cyberpunk') ? 'is-unlocked' : ''}`}>
              <div className="shop-item-badge">
                {isUnlocked('theme_cyberpunk') ? (
                  <span className="badge-bought">
                    <Check size={12} /> {isEn ? 'Unlocked' : 'Открыто'}
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
                  <h3 className="shop-item-title">{isEn ? 'Neon Cyberpunk' : 'Неоновый Киберпанк'}</h3>
                  <div className="theme-palette-dots">
                    <span style={{ background: isLight ? '#f1f6fc' : '#090a14' }} title={isEn ? 'Canvas' : 'Фон'} />
                    <span style={{ background: isLight ? '#0077b6' : '#00f2fe' }} title={isEn ? 'Cyan Accent' : 'Циан'} />
                    <span style={{ background: isLight ? '#d40066' : '#ff007f' }} title={isEn ? 'Magenta Accent' : 'Маджента'} />
                  </div>
                </div>
              </div>

              <p className="shop-item-desc">
                {isEn
                  ? 'Dual theme (adapts to light & dark modes). Clean ice-cyber canvas with electric cyan in light mode; deep sapphire with glowing neon in dark mode.'
                  : 'Двойная тема (адаптируется к светлому и тёмному режимам). Ледяной кибер-фон со светящимся цианом в светлом режиме и глубокий сапфир с неоном в тёмном.'}
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
                        <Check size={14} /> <span>{isEn ? 'Theme Active' : 'Тема активна'}</span>
                      </>
                    ) : (
                      <span>{isEn ? 'Apply Cyberpunk' : 'Применить тему'}</span>
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
                    <span>{isEn ? `Unlock for ${PART_PRICES.theme_cyberpunk} 🪙` : `Купить за ${PART_PRICES.theme_cyberpunk} 🪙`}</span>
                  </button>
                )}
              </div>
            </div>

            <div className={`shop-item-card ${isUnlocked('theme_midnight_gold') ? 'is-unlocked' : ''}`}>
              <div className="shop-item-badge">
                {isUnlocked('theme_midnight_gold') ? (
                  <span className="badge-bought">
                    <Check size={12} /> {isEn ? 'Unlocked' : 'Открыто'}
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
                  <h3 className="shop-item-title">{isEn ? 'Midnight Gold' : 'Королевское Золото'}</h3>
                  <div className="theme-palette-dots">
                    <span style={{ background: isLight ? '#faf6ed' : '#0d0c0a' }} title={isEn ? 'Canvas' : 'Фон'} />
                    <span style={{ background: isLight ? '#b38206' : '#ffd700' }} title={isEn ? 'Gold Accent' : 'Золото'} />
                    <span style={{ background: isLight ? '#c0631c' : '#e5a93c' }} title={isEn ? 'Amber Accent' : 'Янтарь'} />
                  </div>
                </div>
              </div>

              <p className="shop-item-desc">
                {isEn
                  ? 'Dual theme (adapts to light & dark modes). Regal champagne ivory in light mode; obsidian black with imperial gold illumination in dark mode.'
                  : 'Двойная тема (адаптируется к светлому и тёмному режимам). Благородная слоновая кость в светлом режиме и обсидиановый фон с золотым тиснением в тёмном.'}
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
                        <Check size={14} /> <span>{isEn ? 'Theme Active' : 'Тема активна'}</span>
                      </>
                    ) : (
                      <span>{isEn ? 'Apply Midnight Gold' : 'Применить тему'}</span>
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
                    <span>
                      {isEn ? `Unlock for ${PART_PRICES.theme_midnight_gold} 🪙` : `Купить за ${PART_PRICES.theme_midnight_gold} 🪙`}
                    </span>
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
              <h2>{isEn ? 'Lo-Fi Focus Sound Box' : 'Lo-Fi Звуковая шкатулка'}</h2>
            </div>
            <p className="section-desc">
              {isEn
                ? 'Synthesized relaxing ambient sounds for productivity, reading, and deep concentration.'
                : 'Процедурные расслабляющие звуки для продуктивной работы, чтения и медитации.'}
            </p>
          </div>

          <div className="shop-cards-grid">
            <div className={`shop-item-card lo-fi-card ${isUnlocked('sound_lofi') ? 'is-unlocked' : ''}`}>
              <div className="shop-item-badge">
                {isUnlocked('sound_lofi') ? (
                  <span className="badge-bought">
                    <Check size={12} /> {isEn ? 'Unlocked' : 'Открыто'}
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
                  <h3 className="shop-item-title">{isEn ? 'Procedural Soundscapes' : 'Процедурный эмбиент-генератор'}</h3>
                  <span className="shop-item-tag">
                    {isEn ? 'Cozy Rain, Fireplace & Deep Drone' : 'Уютный дождь, камин и космический гул'}
                  </span>
                </div>
              </div>

              <p className="shop-item-desc">
                {isEn
                  ? 'Real-time generated procedural audio via Web Audio API. Zero internet traffic, pure relaxation, and focus booster.'
                  : 'Генерация звука в реальном времени прямо в браузере. Без расхода трафика, успокаивает ум и помогает сосредоточиться.'}
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
                        <span>{isEn ? 'Rain' : 'Дождь'}</span>
                      </button>
                      <button
                        type="button"
                        className={`ambient-btn ${currentTrack === 'fire' ? 'is-playing' : ''}`}
                        onClick={() => handleAmbientPlay('fire')}
                      >
                        <Flame size={14} />
                        <span>{isEn ? 'Fireplace' : 'Камин'}</span>
                      </button>
                      <button
                        type="button"
                        className={`ambient-btn ${currentTrack === 'drone' ? 'is-playing' : ''}`}
                        onClick={() => handleAmbientPlay('drone')}
                      >
                        <Zap size={14} />
                        <span>{isEn ? 'Drone' : 'Медитация'}</span>
                      </button>
                      {currentTrack && (
                        <button
                          type="button"
                          className="ambient-btn ambient-stop-btn"
                          onClick={handleAmbientStop}
                          title={isEn ? 'Stop audio' : 'Остановить звук'}
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
                    <span>{isEn ? `Unlock for ${PART_PRICES.sound_lofi} 🪙` : `Купить за ${PART_PRICES.sound_lofi} 🪙`}</span>
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
              <h2>{isEn ? 'How to Earn Coins' : 'Как зарабатывать коины'}</h2>
            </div>
            <p className="section-desc">
              {isEn
                ? 'Grow your treasury through daily habits, friendship, and battlefield glory.'
                : 'Пополняй казну регулярными привычками, дружбой и боевой славой.'}
            </p>
          </div>

          <div className="earn-ways-grid">
            <div className="earn-way-card">
              <div className="earn-way-icon">
                <Zap size={20} />
              </div>
              <div className="earn-way-info">
                <strong>{isEn ? 'Productivity & Tasks' : 'Продуктивность и дела'}</strong>
                <p>
                  {isEn
                    ? 'Check off tasks (+10 🪙), achieve goals (+100 🪙), and realize dreams (+1,000 🪙).'
                    : 'Отмечай задачи (+10 🪙), достигай целей (+100 🪙) и исполняй мечты (+1000 🪙).'}
                </p>
                <Link to="/extra/productivity/task" className="earn-link">
                  {isEn ? 'Go to tasks →' : 'В задачи →'}
                </Link>
              </div>
            </div>

            <div className="earn-way-card">
              <div className="earn-way-icon">
                <Mail size={20} />
              </div>
              <div className="earn-way-info">
                <strong>{isEn ? 'Dream Diary Greetings' : 'Приветствия в снах'}</strong>
                <p>
                  {isEn
                    ? 'Send a greeting to a friend in the Dream Diary. On your next visit, receive their reply and a +100 🪙 gift.'
                    : 'Отправь приветствие другу в Дневнике снов. При следующем входе получи ответ и подарок +100 🪙.'}
                </p>
                <Link to="/notes" className="earn-link">
                  {isEn ? 'Open Dream Diary →' : 'В дневник снов →'}
                </Link>
              </div>
            </div>

            <div className="earn-way-card">
              <div className="earn-way-icon">
                <Shield size={20} />
              </div>
              <div className="earn-way-info">
                <strong>{isEn ? 'Arena Victories' : 'Победы в лотерее'}</strong>
                <p>
                  {isEn
                    ? 'Assemble troops in the Medieval Clash. Winning army plunders +35..+65 🪙 into your treasury.'
                    : 'Собирай армии в Битве Королевств. Армия-победитель приносит трофеи +35..+65 🪙.'}
                </p>
                <Link to="/misc/lottery" className="earn-link">
                  {isEn ? 'To the arena →' : 'На арену →'}
                </Link>
              </div>
            </div>

            <div className="earn-way-card">
              <div className="earn-way-icon">
                <UserPlus size={20} />
              </div>
              <div className="earn-way-info">
                <strong>{isEn ? 'Invite a Friend' : 'Пригласи друга'}</strong>
                <p>
                  {isEn
                    ? 'Share your referral code. When a friend signs up, you get +250 🪙 and they get +100 🪙.'
                    : 'Поделись своим реферальным кодом. Когда друг зарегистрируется, ты получишь +250 🪙, а он +100 🪙.'}
                </p>
                <Link to="/auth" className="earn-link">
                  {isEn ? 'Get my code →' : 'Мой код →'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="shop-section treasury-packs-section">
          <div className="shop-section-head">
            <div className="section-title-wrap">
              <Crown size={18} className="section-icon" />
              <h2>{isEn ? 'Royal Treasury Vault' : 'Королевская сокровищница'}</h2>
            </div>
            <p className="section-desc">
              {isEn
                ? 'Need instant resources? Support the development and expand your coin reserve with luxury bundles.'
                : 'Нужно больше золота? Поддержи развитие проекта и пополни запасы монет премиальными наборами.'}
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
