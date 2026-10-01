import { useMemo, useState } from 'react'
import { Coins, RotateCcw, Shuffle, Swords, Trophy, X, Zap } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import { usePageViewMode, useShopStore } from '../../../store'
import { playBattleHorn, playSwordClash, playVictoryFanfare } from './battleSounds'
import './Lottery.css'

type TroopId = 'swordsmen' | 'archers' | 'knights' | 'siege'

type TroopConfig = {
  id: TroopId
  nameRu: string
  nameEn: string
  icon: string
  power: number
  descRu: string
  descEn: string
}

const TROOPS: TroopConfig[] = [
  {
    id: 'swordsmen',
    nameRu: 'Мечники',
    nameEn: 'Swordsmen',
    icon: '🗡️',
    power: 10,
    descRu: 'Надёжная основа пехоты',
    descEn: 'Reliable infantry frontline',
  },
  {
    id: 'archers',
    nameRu: 'Лучники',
    nameEn: 'Archers',
    icon: '🏹',
    power: 25,
    descRu: 'Дальний град стрел',
    descEn: 'Ranged volley of arrows',
  },
  {
    id: 'knights',
    nameRu: 'Рыцари',
    nameEn: 'Knights',
    icon: '🐎',
    power: 60,
    descRu: 'Ударная тяжёлая кавалерия',
    descEn: 'Shock heavy cavalry',
  },
  {
    id: 'siege',
    nameRu: 'Осадные маги',
    nameEn: 'Siege Mages',
    icon: '🧙‍♂️',
    power: 120,
    descRu: 'Разрушительные боевые чары',
    descEn: 'Devastating arcane siege',
  },
]

type ArmyRoster = Record<TroopId, number>

type BattleResult = {
  winner: 'green' | 'purple'
  reward: number
  greenPower: number
  purplePower: number
  story: string
}

const INITIAL_ARMY: ArmyRoster = {
  swordsmen: 10,
  archers: 5,
  knights: 2,
  siege: 0,
}

export const LotteryBattleTab = () => {
  const { lang, t } = useTranslation()
  const { isSimple } = usePageViewMode('lottery')

  const credit = useShopStore((state) => state.credit)

  const [greenArmy, setGreenArmy] = useState<ArmyRoster>({ ...INITIAL_ARMY })
  const [purpleArmy, setPurpleArmy] = useState<ArmyRoster>({ ...INITIAL_ARMY })
  const [isFighting, setIsFighting] = useState(false)
  const [lastResult, setLastResult] = useState<BattleResult | null>(null)
  const [wins, setWins] = useState({ green: 0, purple: 0 })

  const isEn = lang === 'en'

  const greenPower = useMemo(() => {
    return TROOPS.reduce((acc, tr) => acc + (greenArmy[tr.id] || 0) * tr.power, 0)
  }, [greenArmy])

  const purplePower = useMemo(() => {
    return TROOPS.reduce((acc, tr) => acc + (purpleArmy[tr.id] || 0) * tr.power, 0)
  }, [purpleArmy])

  const totalPower = greenPower + purplePower || 1
  const greenRatio = greenPower / totalPower

  const balanceStatus = useMemo(() => {
    if (greenPower === 0 && purplePower === 0) {
      return t('lotteryBattle.no-armies-recruited', 'Армии не набраны ⚔️')
    }
    if (greenRatio >= 0.48 && greenRatio <= 0.52) {
      return t('lotteryBattle.forces-are-perfectly-balanced', 'Силы абсолютно равны ⚖️')
    }
    if (greenRatio > 0.52 && greenRatio <= 0.62) {
      return t('lotteryBattle.slight-edge-for-green-kingdom', 'Лёгкий перевес Зелёных 🟢')
    }
    if (greenRatio > 0.62 && greenRatio <= 0.74) {
      return t('lotteryBattle.clear-advantage-for-emerald-order', 'Ощутимое преимущество Зелёных 🛡️')
    }
    if (greenRatio > 0.74) {
      return t('lotteryBattle.overwhelming-emerald-dragon-might', 'Подавляющая мощь Зелёного Королевства 🐉')
    }
    if (greenRatio >= 0.38 && greenRatio < 0.48) {
      return t('lotteryBattle.slight-edge-for-purple-empire', 'Лёгкий перевес Фиолетовых 🟣')
    }
    if (greenRatio >= 0.26 && greenRatio < 0.38) {
      return t('lotteryBattle.clear-advantage-for-amethyst-legion', 'Ощутимое преимущество Фиолетовых ⚔️')
    }
    return t('lotteryBattle.overwhelming-amethyst-imperial-might', 'Подавляющая мощь Фиолетовой Империи 👑')
  }, [greenPower, purplePower, greenRatio, t])

  const modifyTroop = (side: 'green' | 'purple', troop: TroopId, delta: number) => {
    const setter = side === 'green' ? setGreenArmy : setPurpleArmy
    setter((prev) => ({
      ...prev,
      [troop]: Math.max(0, (prev[troop] || 0) + delta),
    }))
  }

  const applyPreset = (preset: 'duel' | 'ambush' | 'siege' | 'kings' | 'random' | 'reset') => {
    if (preset === 'reset') {
      setGreenArmy({ swordsmen: 0, archers: 0, knights: 0, siege: 0 })
      setPurpleArmy({ swordsmen: 0, archers: 0, knights: 0, siege: 0 })
      return
    }
    if (preset === 'duel') {
      setGreenArmy({ swordsmen: 12, archers: 0, knights: 0, siege: 0 })
      setPurpleArmy({ swordsmen: 12, archers: 0, knights: 0, siege: 0 })
      return
    }
    if (preset === 'ambush') {
      setGreenArmy({ swordsmen: 4, archers: 22, knights: 0, siege: 0 })
      setPurpleArmy({ swordsmen: 6, archers: 0, knights: 6, siege: 0 })
      return
    }
    if (preset === 'siege') {
      setGreenArmy({ swordsmen: 16, archers: 8, knights: 0, siege: 2 })
      setPurpleArmy({ swordsmen: 10, archers: 4, knights: 7, siege: 1 })
      return
    }
    if (preset === 'kings') {
      setGreenArmy({ swordsmen: 15, archers: 12, knights: 6, siege: 3 })
      setPurpleArmy({ swordsmen: 15, archers: 12, knights: 6, siege: 3 })
      return
    }
    if (preset === 'random') {
      setGreenArmy({
        swordsmen: Math.floor(Math.random() * 20),
        archers: Math.floor(Math.random() * 15),
        knights: Math.floor(Math.random() * 8),
        siege: Math.floor(Math.random() * 4),
      })
      setPurpleArmy({
        swordsmen: Math.floor(Math.random() * 20),
        archers: Math.floor(Math.random() * 15),
        knights: Math.floor(Math.random() * 8),
        siege: Math.floor(Math.random() * 4),
      })
    }
  }

  const handleStartBattle = () => {
    if (greenPower === 0 && purplePower === 0) return
    setIsFighting(true)
    playBattleHorn()

    setTimeout(() => {
      playSwordClash()
    }, 600)

    setTimeout(() => {
      playSwordClash()
    }, 1200)

    setTimeout(() => {
      const roll = Math.random() * totalPower
      const winner: 'green' | 'purple' = roll < greenPower ? 'green' : 'purple'
      const reward = Math.floor(Math.random() * 30) + 35

      credit('battle', reward)
      playVictoryFanfare()

      setWins((w) => ({
        ...w,
        [winner]: w[winner] + 1,
      }))

      const story =
        winner === 'green'
          ? t(
              'lotteryBattle.the-emerald-dragon-banners-surged-forward-with-p',
              'Изумрудные драконы ринулись вперёд! Слаженная стрельба лучников и несокрушимые щиты Зелёного Королевства сломили ряды противника и принесли славную победу!',
            )
          : t(
              'lotteryBattle.the-amethyst-raven-legion-struck-with-ruthless-f',
              'Легион Аметистового Ворона нанёс сокрушительный удар! Тяжёлая кавалерия смяла фланги, а разрушительные чары обратили оборону в бегство!',
            )

      setLastResult({
        winner,
        reward,
        greenPower,
        purplePower,
        story,
      })

      setIsFighting(false)
    }, 1900)
  }

  return (
    <div className={`lottery-page medieval-battle-page ${isFighting ? 'is-in-clash' : ''}`}>
      {lastResult && (
        <div className="battle-modal-backdrop" role="dialog" aria-modal="true">
          <div className={`battle-result-card winner-${lastResult.winner}`}>
            <button type="button" className="battle-result-close" onClick={() => setLastResult(null)}>
              <X size={16} />
            </button>

            <div className="battle-result-badge">
              <Trophy size={18} />
              <span>
                {lastResult.winner === 'green'
                  ? t('lotteryBattle.victory-for-green-kingdom', 'ПОБЕДА ЗЕЛЁНОГО КОРОЛЕВСТВА! 🟢')
                  : t('lotteryBattle.victory-for-purple-empire', 'ПОБЕДА ФИОЛЕТОВОЙ ИМПЕРИИ! 🟣')}
              </span>
            </div>

            <h2 className="battle-result-title">
              {lastResult.winner === 'green'
                ? t('lotteryBattle.emerald-dragon-triumphs', 'Триумф Изумрудного Дракона!')
                : t('lotteryBattle.amethyst-raven-conquers', 'Триумф Аметистового Ворона!')}
            </h2>

            <p className="battle-result-story">{lastResult.story}</p>

            <div className="battle-reward-chip">
              <Coins size={16} />
              <span>{t('lotteryBattle.warPlunder', undefined, { reward: lastResult.reward })}</span>
            </div>

            <div className="battle-score-row">
              <span className="score-green">🟢 {wins.green}</span>
              <span className="score-vs">:</span>
              <span className="score-purple">{wins.purple} 🟣</span>
            </div>

            <button type="button" className="battle-next-btn" onClick={() => setLastResult(null)}>
              {t('lotteryBattle.back-to-battlements', 'Вернуться к армиям')}
            </button>
          </div>
        </div>
      )}

      <section className="battle-presets-bar">
        <span className="presets-label">
          <Zap size={14} /> {t('lotteryBattle.quick-presets', 'Шаблоны армий:')}
        </span>
        <div className="presets-btns">
          <button type="button" className="preset-btn" onClick={() => applyPreset('duel')}>
            🛡️ {t('lotteryBattle.duel')}
          </button>
          <button type="button" className="preset-btn" onClick={() => applyPreset('ambush')}>
            🏹 {t('lotteryBattle.ambush')}
          </button>
          <button type="button" className="preset-btn" onClick={() => applyPreset('siege')}>
            🏰 {t('lotteryBattle.siege')}
          </button>
          <button type="button" className="preset-btn" onClick={() => applyPreset('kings')}>
            👑 {t('lotteryBattle.kings-clash', 'Короли')}
          </button>
          <button type="button" className="preset-btn" onClick={() => applyPreset('random')}>
            <Shuffle size={12} /> {t('lotteryBattle.random')}
          </button>
          <button type="button" className="preset-btn btn-reset" onClick={() => applyPreset('reset')}>
            <RotateCcw size={12} /> {t('lotteryBattle.clear')}
          </button>
        </div>
      </section>

      <section className="balance-tug-section">
        <div className="balance-status-header">
          <span className="balance-side-badge green-badge">🟢 {t('lotteryBattle.emerald-dragon', 'Изумрудный Дракон')}</span>
          <div className="balance-indicator-text">{balanceStatus}</div>
          <span className="balance-side-badge purple-badge">{t('lotteryBattle.amethyst-raven', 'Аметистовый Ворон')} 🟣</span>
        </div>

        <div className="tug-of-war-track">
          <div className="tug-bar-green" style={{ width: `${Math.round(greenRatio * 100)}%` }} />
          <div className="tug-divider" />
          <div className="tug-bar-purple" style={{ width: `${100 - Math.round(greenRatio * 100)}%` }} />
        </div>
      </section>

      <div className="armies-grid">
        <div className="army-card army-green">
          <div className="army-card-header">
            <div className="army-crest">🟢</div>
            <div>
              <h3 className="army-name">{t('lotteryBattle.green-kingdom', 'Зелёное Королевство')}</h3>
              <span className="army-motto">{t('lotteryBattle.emerald-order-of-the-dragon', 'Орден Изумрудного Дракона')}</span>
            </div>
          </div>

          <div className="troops-roster">
            {TROOPS.map((troop) => {
              const count = greenArmy[troop.id] || 0
              return (
                <div key={troop.id} className="troop-row">
                  <div className="troop-info">
                    <span className="troop-icon">{troop.icon}</span>
                    <div>
                      <strong className="troop-name">{isEn ? troop.nameEn : troop.nameRu}</strong>
                      {!isSimple && <span className="troop-desc">{isEn ? troop.descEn : troop.descRu}</span>}
                    </div>
                  </div>

                  <div className="troop-controls">
                    <button type="button" className="troop-btn" onClick={() => modifyTroop('green', troop.id, -1)} disabled={count <= 0}>
                      -
                    </button>
                    <span className="troop-count">{count}</span>
                    <button type="button" className="troop-btn" onClick={() => modifyTroop('green', troop.id, 1)}>
                      +1
                    </button>
                    <button type="button" className="troop-btn troop-btn-bulk" onClick={() => modifyTroop('green', troop.id, 5)}>
                      +5
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="battle-action-center">
          <button
            type="button"
            className={`start-clash-btn ${isFighting ? 'is-fighting' : ''}`}
            onClick={handleStartBattle}
            disabled={isFighting || (greenPower === 0 && purplePower === 0)}
          >
            <Swords size={22} className="clash-swords-icon" />
            <span>
              {isFighting
                ? t('lotteryBattle.clashing-in-battle', 'Сражение идёт! ⚡')
                : t('lotteryBattle.begin-battle', 'Начать битву! ⚔️')}
            </span>
          </button>

          <div className="battle-score-pill">
            <span>{t('lotteryBattle.victories')}</span>
            <strong className="score-badge green-badge">{wins.green}</strong>
            <span>:</span>
            <strong className="score-badge purple-badge">{wins.purple}</strong>
          </div>
        </div>

        <div className="army-card army-purple">
          <div className="army-card-header">
            <div className="army-crest">🟣</div>
            <div>
              <h3 className="army-name">{t('lotteryBattle.purple-empire', 'Фиолетовая Империя')}</h3>
              <span className="army-motto">{t('lotteryBattle.amethyst-raven-legion', 'Легион Аметистового Ворона')}</span>
            </div>
          </div>

          <div className="troops-roster">
            {TROOPS.map((troop) => {
              const count = purpleArmy[troop.id] || 0
              return (
                <div key={troop.id} className="troop-row">
                  <div className="troop-info">
                    <span className="troop-icon">{troop.icon}</span>
                    <div>
                      <strong className="troop-name">{isEn ? troop.nameEn : troop.nameRu}</strong>
                      {!isSimple && <span className="troop-desc">{isEn ? troop.descEn : troop.descRu}</span>}
                    </div>
                  </div>

                  <div className="troop-controls">
                    <button type="button" className="troop-btn" onClick={() => modifyTroop('purple', troop.id, -1)} disabled={count <= 0}>
                      -
                    </button>
                    <span className="troop-count">{count}</span>
                    <button type="button" className="troop-btn" onClick={() => modifyTroop('purple', troop.id, 1)}>
                      +1
                    </button>
                    <button type="button" className="troop-btn troop-btn-bulk" onClick={() => modifyTroop('purple', troop.id, 5)}>
                      +5
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
