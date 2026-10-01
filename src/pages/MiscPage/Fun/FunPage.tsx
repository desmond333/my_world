import { useCallback, useState } from 'react'
import { STORAGE_KEYS } from '../../../lib/storage'
import { Link } from 'react-router-dom'
import { Award, Coins, Crown, Dices, Flame, Laugh, Lock, MessageCircle, RefreshCw, Sparkles, Ticket, Volume2 } from 'lucide-react'
import { storage } from '../../../lib'
import { useTranslation } from '../../../lib/i18n'
import { useShopStore } from '../../../store'
import {
  CLOWN_HONK_WORDS,
  CLOWN_STATUSES,
  CIRCUS_MOVES,
  COSTUME_LABELS,
  FUNNY_MEMES,
  getClownMeterVerdict,
  LOTTERY_PRIZES,
  STATHAM_BASE_PUNCHLINES,
  STATHAM_IMAGE,
  STATHAM_QUOTES,
  type LotteryPrize,
  type StathamCostume,
} from './funData'
import { playSoundEffect, SOUND_ITEMS, type SoundEffectType } from './funSounds'
import './Fun.css'

const TROPHIES_STORAGE_KEY = STORAGE_KEYS.stathamTrophies

type FloatingWord = {
  id: number
  text: string
  x: number
  y: number
}

export const FunPage = () => {
  const { t } = useTranslation()

  const [costume, setCostume] = useState<StathamCostume>('none')
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [statusIndex, setStatusIndex] = useState(0)
  const [punchlineIndex, setPunchlineIndex] = useState(0)
  const [circusMoveIndex, setCircusMoveIndex] = useState(0)
  const [honkCount, setHonkCount] = useState(0)
  const [clownPercent, setClownPercent] = useState(33)
  const verdict = getClownMeterVerdict(clownPercent)
  const [floatingWords, setFloatingWords] = useState<FloatingWord[]>([])

  const [isSpinning, setIsSpinning] = useState(false)
  const [reelPrize, setReelPrize] = useState<LotteryPrize>(LOTTERY_PRIZES[0])
  const [wonPrize, setWonPrize] = useState<LotteryPrize | null>(null)
  const [trophies, setTrophies] = useState<string[]>(() => storage.get<string[]>(TROPHIES_STORAGE_KEY, []))

  const [memeCategory, setMemeCategory] = useState<string>('all')
  const [memeIndex, setMemeIndex] = useState(0)

  const triggerHonk = useCallback((e?: React.MouseEvent) => {
    playSoundEffect('honk')
    setHonkCount((c) => c + 1)
    setClownPercent((prev) => Math.min(prev + 7, 100))

    const word = CLOWN_HONK_WORDS[Math.floor(Math.random() * CLOWN_HONK_WORDS.length)]
    const x = e ? e.clientX : window.innerWidth / 2
    const y = e ? e.clientY : window.innerHeight / 2

    const newId = Date.now() + Math.random()
    setFloatingWords((prev) => [...prev, { id: newId, text: word, x, y }])

    window.setTimeout(() => {
      setFloatingWords((prev) => prev.filter((item) => item.id !== newId))
    }, 1200)
  }, [])

  const nextQuote = () => {
    setQuoteIndex((i) => (i + 1) % STATHAM_QUOTES.length)
  }

  const nextStatus = () => {
    setStatusIndex((i) => (i + 1) % CLOWN_STATUSES.length)
  }

  const spinLottery = () => {
    if (isSpinning) return
    setIsSpinning(true)
    setWonPrize(null)
    playSoundEffect('boing')

    let counter = 0
    const interval = window.setInterval(() => {
      const randomP = LOTTERY_PRIZES[Math.floor(Math.random() * LOTTERY_PRIZES.length)]
      setReelPrize(randomP)
      counter++

      if (counter >= 18) {
        clearInterval(interval)

        const totalWeight = LOTTERY_PRIZES.reduce((sum, p) => sum + p.probabilityWeight, 0)
        let rand = Math.random() * totalWeight
        let selected = LOTTERY_PRIZES[0]

        for (const prize of LOTTERY_PRIZES) {
          if (rand < prize.probabilityWeight) {
            selected = prize
            break
          }
          rand -= prize.probabilityWeight
        }

        setReelPrize(selected)
        setWonPrize(selected)
        setIsSpinning(false)

        if (selected.isJackpot) {
          playSoundEffect('jackpot')
        } else {
          playSoundEffect('airhorn')
        }

        setTrophies((prev) => {
          if (!prev.includes(selected.id)) {
            const next = [...prev, selected.id]
            storage.set(TROPHIES_STORAGE_KEY, next)
            return next
          }
          return prev
        })
      }
    }, 90)
  }

  const filteredMemes = FUNNY_MEMES.filter((m) => (memeCategory === 'all' ? true : m.category === memeCategory))
  const currentMeme = filteredMemes[memeIndex % (filteredMemes.length || 1)] ?? FUNNY_MEMES[0]

  const nextRandomMeme = () => {
    playSoundEffect('boing')
    setMemeIndex((i) => (i + 1) % filteredMemes.length)
  }

  const isUnlocked = useShopStore((state) => state.isUnlocked('statham'))
  const buyPart = useShopStore((state) => state.buyPart)
  const userCoins = useShopStore((state) => state.coins)

  if (!isUnlocked) {
    const canAfford = userCoins >= 250
    const isEn = t('fun.title') === 'Fun' || t('fun.statham.title').includes('Jason')

    return (
      <div className="fun-page fun-locked-page">
        <div className="lottery-locked-card">
          <div className="lottery-locked-icon">
            <Lock size={32} />
          </div>

          <h2>{isEn ? 'Jason Statham: Memes & Quotes' : 'Джейсон Стэйтем: Мемы и Цитаты'}</h2>
          <p className="lottery-locked-intro">
            {isEn
              ? '“He who takes no risks drinks no champagne. And he who unlocks this section for 250 coins is a true wolf.” — Statham.'
              : '«Кто не рискует — тот не пьёт шампанское. А кто открывает раздел за 250 монет — тот истинный волк.» — Стэйтем.'}
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
              <button type="button" className="lottery-unlock-btn" onClick={() => buyPart('statham')}>
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
    <div className="fun-page">
      {floatingWords.map((item) => (
        <span key={item.id} className="floating-word" style={{ left: item.x, top: item.y }}>
          {item.text}
        </span>
      ))}

      <section className="extra-head">
        <p className="eyebrow">
          <Laugh size={15} /> {t('fun.kicker')}
        </p>
        <h1>{t('fun.title')}</h1>
        <p className="intro">{t('fun.intro')}</p>
      </section>

      <section className="statham-lottery-card">
        <div className="lottery-head">
          <h3>
            <Ticket size={24} /> {t('fun.lottery.title')}
          </h3>
          <div className="jackpot-banner">
            <Crown size={15} /> {t('fun.lottery.jackpotBanner')}
          </div>
        </div>

        <div className="lottery-machine-box">
          <div className={`lottery-reel ${isSpinning ? 'is-spinning' : ''}`}>
            <div className="reel-item-display">
              <span className="reel-icon">{reelPrize.icon}</span>
              <span className="reel-name">{reelPrize.name}</span>
            </div>
          </div>

          <button type="button" className="lottery-spin-btn" onClick={spinLottery} disabled={isSpinning}>
            <Dices size={20} />
            <span>{isSpinning ? t('fun.lottery.spinning') : t('fun.lottery.spin')}</span>
          </button>

          {wonPrize && (
            <div className={`won-prize-box ${wonPrize.isJackpot ? 'is-jackpot' : ''}`}>
              <div className="won-prize-title">
                {wonPrize.icon} {wonPrize.isJackpot ? t('fun.lottery.jackpot') : t('fun.lottery.yourPrize')} {wonPrize.name}
              </div>
              <p className="won-prize-desc">{wonPrize.description}</p>
              <div className="won-prize-quote">{wonPrize.quote}</div>
            </div>
          )}
        </div>

        {trophies.length > 0 && (
          <div className="trophies-shelf">
            <span className="trophies-shelf-title">
              <Award size={14} /> {t('fun.lottery.trophies', undefined, { current: trophies.length, total: LOTTERY_PRIZES.length })}
            </span>
            <div className="trophies-grid">
              {trophies.map((id) => {
                const prize = LOTTERY_PRIZES.find((p) => p.id === id)
                if (!prize) return null
                return (
                  <span key={id} className="trophy-badge" title={prize.description}>
                    {prize.icon} {prize.name}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </section>

      <section className="meme-section-card">
        <div className="meme-section-head">
          <h3>
            <Sparkles size={22} /> {t('fun.meme.title')}
          </h3>
          <div className="meme-categories-row">
            <button
              type="button"
              className={`meme-cat-btn ${memeCategory === 'all' ? 'is-active' : ''}`}
              onClick={() => setMemeCategory('all')}
            >
              {t('fun.meme.all')}
            </button>
            <button
              type="button"
              className={`meme-cat-btn ${memeCategory === 'statham' ? 'is-active' : ''}`}
              onClick={() => setMemeCategory('statham')}
            >
              {t('fun.meme.category.statham')}
            </button>
            <button
              type="button"
              className={`meme-cat-btn ${memeCategory === 'animals' ? 'is-active' : ''}`}
              onClick={() => setMemeCategory('animals')}
            >
              {t('fun.meme.category.animals')}
            </button>
            <button
              type="button"
              className={`meme-cat-btn ${memeCategory === 'office' ? 'is-active' : ''}`}
              onClick={() => setMemeCategory('office')}
            >
              {t('fun.meme.category.office')}
            </button>
            <button
              type="button"
              className={`meme-cat-btn ${memeCategory === 'life' ? 'is-active' : ''}`}
              onClick={() => setMemeCategory('life')}
            >
              {t('fun.meme.category.life')}
            </button>
          </div>
        </div>

        <div className="meme-stage">
          <div className="meme-picture-box">
            <img src={currentMeme.imageUrl} alt={currentMeme.title} className="meme-img" loading="lazy" />
          </div>

          <div className="meme-content-box">
            <h4 className="meme-title">{currentMeme.title}</h4>
            <div className="meme-caption-bubble">
              <p className="meme-caption-text">{currentMeme.caption}</p>
              {currentMeme.authorQuote && <p className="meme-quote-text">— {currentMeme.authorQuote}</p>}
            </div>

            <button type="button" className="meme-random-btn" onClick={nextRandomMeme}>
              <RefreshCw size={17} />
              <span>{t('fun.meme.next')}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="statham-hero-card">
        <div className="statham-portrait-box">
          <img src={STATHAM_IMAGE} alt={t('fun.statham.alt')} className="statham-photo" />

          <div className="statham-costume-overlay">
            {(costume === 'nose' || costume === 'full') && <div className="clown-nose-svg" />}
            {(costume === 'shades' || costume === 'full') && <div className="statham-shades-svg">🕶️</div>}
            {(costume === 'hair' || costume === 'full') && <div className="statham-hair-svg">💇</div>}
          </div>
        </div>

        <div className="statham-info-col">
          <div className="statham-name-row">
            <div>
              <h2 className="statham-title">Джейсон Стэйтем</h2>
              <span className="statham-status-tag">{CLOWN_STATUSES[statusIndex]}</span>
            </div>
            <button type="button" className="costume-btn" onClick={nextStatus} title={t('fun.statham.statusTitle')}>
              {t('fun.statham.newStatus')}
            </button>
          </div>

          <div className="statham-quote-bubble">
            <p className="statham-quote-text">«{STATHAM_QUOTES[quoteIndex]}»</p>
          </div>

          <div className="statham-costumes-row">
            {(['none', 'nose', 'shades', 'hair', 'full'] as StathamCostume[]).map((c) => (
              <button
                key={c}
                type="button"
                className={`costume-btn ${costume === c ? 'is-active' : ''}`}
                onClick={() => {
                  setCostume(c)
                  playSoundEffect(c === 'nose' ? 'honk' : c === 'shades' ? 'airhorn' : c === 'hair' ? 'boing' : 'auf')
                }}
              >
                {t(`fun.costume.${c}`, COSTUME_LABELS[c])}
              </button>
            ))}
          </div>

          <div className="statham-action-row">
            <button type="button" className="honk-big-btn" onClick={(e) => triggerHonk(e)}>
              {t('fun.statham.pressNose', undefined, { count: honkCount })}
            </button>
            <button type="button" className="costume-btn" onClick={nextQuote}>
              <MessageCircle size={15} /> {t('fun.statham.anotherQuote')}
            </button>
          </div>
        </div>
      </section>

      <section className="clown-soundboard-panel">
        <div className="soundboard-header">
          <span className="soundboard-badge">{t('fun.soundboard.badge')}</span>
          <Volume2 size={16} color="var(--accent)" />
        </div>

        <div className="soundboard-grid">
          {SOUND_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="soundboard-btn"
              onClick={() => playSoundEffect(item.id as SoundEffectType)}
              title={item.hint}
            >
              <span className="soundboard-emoji">{item.emoji}</span>
              <span className="soundboard-name">{item.name}</span>
              <span className="soundboard-hint">{item.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="clown-meter-card">
        <h3 className="clown-meter-title">
          <Flame size={20} color="var(--accent)" /> {t('fun.meter.title')}
        </h3>

        <div className="meter-track">
          <div className="meter-fill" style={{ width: `${clownPercent}%` }} />
        </div>

        <div className="meter-labels">
          <span>{t('fun.meter.low')}</span>
          <strong>{clownPercent}%</strong>
          <span>{t('fun.meter.high')}</span>
        </div>

        <div className="meter-verdict-box">
          <div className="meter-verdict-title">{verdict.label}</div>
          <p className="meter-verdict-desc">{verdict.verdict}</p>
        </div>

        <div className="statham-action-row">
          <button type="button" className="costume-btn" onClick={() => setClownPercent((p) => Math.min(p + 15, 100))}>
            {t('fun.meter.add')}
          </button>
          <button type="button" className="costume-btn" onClick={() => setClownPercent(10)}>
            {t('fun.meter.reset')}
          </button>
          <button type="button" className="costume-btn" onClick={() => setPunchlineIndex((i) => (i + 1) % STATHAM_BASE_PUNCHLINES.length)}>
            {t('fun.meter.basis')}
          </button>
        </div>

        <p className="meter-verdict-desc" style={{ fontStyle: 'italic', color: 'var(--muted)' }}>
          {STATHAM_BASE_PUNCHLINES[punchlineIndex]}
        </p>
        <p className="meter-verdict-desc" style={{ fontStyle: 'italic', color: 'var(--accent)' }}>
          {t('fun.meter.action', undefined, { move: CIRCUS_MOVES[circusMoveIndex % CIRCUS_MOVES.length] })}
          <button type="button" className="costume-btn" style={{ marginLeft: 8 }} onClick={() => setCircusMoveIndex((i) => i + 1)}>
            ↻
          </button>
        </p>
      </section>
    </div>
  )
}
