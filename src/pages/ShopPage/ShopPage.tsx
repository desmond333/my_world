import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  CheckCircle2,
  Coins,
  Crown,
  Flame,
  Heart,
  Leaf,
  Palette,
  ShoppingBag,
  Snowflake,
  Sparkles,
  Sun,
  Swords,
  Wand2,
  Zap,
} from 'lucide-react'
import { AppTopbar, CatPremiumAvatar } from '../../widgets'
import { PricingInfo, PremiumShop } from '../../features'
import { VIP_THEMES } from '../../lib'
import { useTranslation } from '../../lib/i18n'
import { PART_PRICES, type ShopItemKey, type ThemeSkinId, useDailyStore, useShopStore } from '../../store'
import { playVictoryFanfare } from '../../lib/audio/battleSounds'
import { Badge } from '../../shared/ui'
import './ShopPage.css'

const THEME_ICONS: Record<string, typeof Zap> = {
  zap: Zap,
  crown: Crown,
  leaf: Leaf,
  sun: Sun,
  snowflake: Snowflake,
  wand: Wand2,
  heart: Heart,
}

export const ShopPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const coins = useShopStore((state) => state.coins)
  const isUnlocked = useShopStore((state) => state.isUnlocked)
  const buyPart = useShopStore((state) => state.buyPart)
  const activeCatSkin = useShopStore((state) => state.activeCatSkin)
  const activeThemeSkin = useShopStore((state) => state.activeThemeSkin)
  const equipCatSkin = useShopStore((state) => state.equipCatSkin)
  const equipThemeSkin = useShopStore((state) => state.equipThemeSkin)
  const themeMode = useDailyStore((state) => state.themeMode)

  const isLight =
    (themeMode ?? 'system') === 'system'
      ? typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      : themeMode === 'light'

  const [purchaseSuccessNotice, setPurchaseSuccessNotice] = useState<string | null>(null)

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
    } else if (key.startsWith('theme_')) {
      const vip = VIP_THEMES.find((item) => item.shopKey === key)
      if (vip) {
        title = t('shop.vipThemeUnlocked', `VIP-тема «${vip.fallback}» активирована!`)
        equipThemeSkin(vip.skin as ThemeSkinId)
      }
    }

    setPurchaseSuccessNotice(title)
    setTimeout(() => setPurchaseSuccessNotice(null), 3000)
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
                  <Badge variant="success" size="sm" icon={<Check size={12} />}>
                    {t('shop.unlocked')}
                  </Badge>
                ) : (
                  <Badge variant="price" size="sm" icon={<Coins size={12} />}>
                    {PART_PRICES.lottery} 🪙
                  </Badge>
                )}
              </div>

              <div className="shop-item-hero">
                <div className="shop-item-icon-box box-lottery">
                  <Swords size={28} />
                </div>
                <div>
                  <h3 className="shop-item-title">{t('shop.medieval-battle-lottery', 'Средневековая лотерея: Битва')}</h3>
                  <Badge variant="outline" size="sm">
                    {t('shop.emerald-dragon-vs-amethyst-raven', 'Зелёные vs Фиолетовые')}
                  </Badge>
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
                  <button type="button" className="shop-open-btn" onClick={() => navigate('/useful/lottery')}>
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
                  <Badge variant="success" size="sm" icon={<Check size={12} />}>
                    {t('shop.unlocked')}
                  </Badge>
                ) : (
                  <Badge variant="price" size="sm" icon={<Coins size={12} />}>
                    {PART_PRICES.statham} 🪙
                  </Badge>
                )}
              </div>

              <div className="shop-item-hero">
                <div className="shop-item-icon-box box-statham">
                  <Flame size={28} />
                </div>
                <div>
                  <h3 className="shop-item-title">{t('shop.jason-statham-memes-quotes', 'Джейсон Стэйтем: Мемы и Цитаты')}</h3>
                  <Badge variant="outline" size="sm">
                    {t('shop.wisdom-soundboard-costumes', 'Цитаты, пацанский саундборд и образы')}
                  </Badge>
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
                  <button type="button" className="shop-open-btn" onClick={() => navigate('/useful/fun')}>
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

        <PremiumShop />

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
                  <Badge variant="success" size="sm" icon={<Check size={12} />}>
                    {t('shop.unlocked')}
                  </Badge>
                ) : (
                  <Badge variant="price" size="sm" icon={<Coins size={12} />}>
                    {PART_PRICES.cat_wizard} 🪙
                  </Badge>
                )}
              </div>

              <div className="shop-item-hero">
                <div className="shop-item-preview-cat">
                  <CatPremiumAvatar size={50} skin="wizard" />
                </div>
                <div>
                  <h3 className="shop-item-title">{t('shop.wizard-cat', 'Кот-Чародей 🧙‍♂️')}</h3>
                  <Badge variant="outline" size="sm">
                    {t('shop.magic-star-hat-celestial-glow', 'Волшебный колпак и звёздная аура')}
                  </Badge>
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
                  <Badge variant="success" size="sm" icon={<Check size={12} />}>
                    {t('shop.unlocked')}
                  </Badge>
                ) : (
                  <Badge variant="price" size="sm" icon={<Coins size={12} />}>
                    {PART_PRICES.cat_cyber} 🪙
                  </Badge>
                )}
              </div>

              <div className="shop-item-hero">
                <div className="shop-item-preview-cat">
                  <CatPremiumAvatar size={50} skin="cyber" />
                </div>
                <div>
                  <h3 className="shop-item-title">{t('shop.cyber-cat-2077', 'Кибер-Кот 🐱⚡')}</h3>
                  <Badge variant="outline" size="sm">
                    {t('shop.neon-cyan-visor-antenna', 'Неоновый визор и антенна')}
                  </Badge>
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
            {VIP_THEMES.map((vip) => {
              const Icon = THEME_ICONS[vip.icon] ?? Sparkles
              const unlocked = isUnlocked(vip.shopKey as ShopItemKey)
              const isActive = activeThemeSkin === vip.skin

              return (
                <div key={vip.skin} className={`shop-item-card ${unlocked ? 'is-unlocked' : ''}`}>
                  <div className="shop-item-badge">
                    {unlocked ? (
                      <Badge variant="success" size="sm" icon={<Check size={12} />}>
                        {t('shop.unlocked')}
                      </Badge>
                    ) : (
                      <Badge variant="price" size="sm" icon={<Coins size={12} />}>
                        {vip.price} 🪙
                      </Badge>
                    )}
                  </div>

                  <div className="shop-item-hero">
                    <div className={`shop-item-icon-box ${vip.boxClass}`}>
                      <Icon size={28} />
                    </div>
                    <div>
                      <h3 className="shop-item-title">{t(vip.titleKey, vip.titleFallback)}</h3>
                      <div className="theme-palette-dots">
                        <span style={{ background: isLight ? vip.preview.light.bg : vip.preview.dark.bg }} title={t('shop.canvas')} />
                        <span style={{ background: isLight ? vip.preview.light.accent : vip.preview.dark.accent }} title={vip.fallback} />
                        <span style={{ background: isLight ? vip.secondary.light : vip.secondary.dark }} title={vip.fallback} />
                      </div>
                    </div>
                  </div>

                  <p className="shop-item-desc">{t(vip.descKey, vip.descFallback)}</p>

                  <div className="shop-item-footer">
                    {unlocked ? (
                      <button
                        type="button"
                        className={`shop-equip-btn ${isActive ? 'is-active' : ''}`}
                        onClick={() => equipThemeSkin(isActive ? 'default' : (vip.skin as ThemeSkinId))}
                      >
                        {isActive ? (
                          <>
                            <Check size={14} /> <span>{t('shop.theme-active', 'Тема активна')}</span>
                          </>
                        ) : (
                          <span>{t('shop.apply-theme', 'Применить тему')}</span>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="shop-buy-btn"
                        onClick={() => handleBuyPart(vip.shopKey as ShopItemKey)}
                        disabled={coins < vip.price}
                      >
                        <Sparkles size={14} />
                        <span>{t('shop.unlockFor', undefined, { price: vip.price })}</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <PricingInfo />
      </main>
    </div>
  )
}
