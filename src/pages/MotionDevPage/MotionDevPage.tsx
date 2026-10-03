import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, ArrowLeft, RotateCcw } from 'lucide-react'
import { MOTION_CATALOG, motionCounts } from '../../lib/motion'
import { AnimatedNumber, Parallax, Reveal, ScrollReveal, Stagger, StaggerItem, TiltCard, useMotionDose } from '../../shared/ui'
import './MotionDevPage.css'

const randomTarget = () => 500 + Math.round(Math.random() * 9500)

export const MotionDevPage = () => {
  const dose = useMotionDose()
  const [nonce, setNonce] = useState(0)
  const [target, setTarget] = useState(randomTarget)
  const counts = motionCounts()

  const replay = () => {
    setTarget(randomTarget())
    setNonce((n) => n + 1)
  }

  return (
    <main className="page-shell motion-dev-page">
      <header className="motion-dev-header">
        <div>
          <span className="motion-dev-kicker">
            <Activity size={14} /> dev · motion
          </span>
          <h1>Каталог анимаций</h1>
          <p className="intro">
            Текущая доза: <strong>{dose}</strong>. В режиме <code>base</code> видно половину каталога, в <code>full</code> — все. base{' '}
            {counts.base} · full {counts.full} · всего {counts.total}. Переключай дозу панелью слева внизу.
          </p>
        </div>
        <div className="motion-dev-actions">
          <Link to="/today" className="motion-dev-link">
            <ArrowLeft size={14} /> На главную
          </Link>
          <button type="button" className="motion-dev-replay" onClick={replay}>
            <RotateCcw size={14} /> Повторить
          </button>
        </div>
      </header>

      <div key={nonce} className="motion-dev-grid">
        <Reveal className="motion-dev-card">
          <span className="motion-dev-badge is-base">base · js</span>
          <strong>Reveal</strong>
          <p>Появление блока: сдвиг вверх + прозрачность.</p>
        </Reveal>

        <Reveal tier="premium" className="motion-dev-card" delay={0.05}>
          <span className="motion-dev-badge is-premium">premium · js</span>
          <strong>Reveal (premium)</strong>
          <p>Тот же эффект, но только при дозе full.</p>
        </Reveal>

        <Stagger className="motion-dev-card motion-dev-stagger">
          <span className="motion-dev-badge is-base">base · js</span>
          <strong>Stagger</strong>
          <div className="motion-dev-chips">
            <StaggerItem className="motion-dev-chip">раз</StaggerItem>
            <StaggerItem className="motion-dev-chip">два</StaggerItem>
            <StaggerItem className="motion-dev-chip">три</StaggerItem>
          </div>
        </Stagger>

        <div className="motion-dev-card">
          <span className="motion-dev-badge is-base">base · js</span>
          <strong>AnimatedNumber</strong>
          <p className="motion-dev-number">
            <AnimatedNumber value={target} format={(n) => Math.round(n).toLocaleString()} /> монет
          </p>
        </div>

        <div className="motion-dev-card motion-dev-tab-demo">
          <span className="motion-dev-badge is-base">base · css</span>
          <strong>Tab panel rise</strong>
          <div className="motion-dev-tabpanel">Содержимое вкладки появляется снизу.</div>
        </div>

        <div className="motion-dev-card">
          <span className="motion-dev-badge is-premium">premium · css</span>
          <strong>Hover lift</strong>
          <div className="motion-dev-hover">Наведи курсор</div>
        </div>

        <div className="motion-dev-card">
          <span className="motion-dev-badge is-premium">premium · css</span>
          <strong>Shimmer</strong>
          <span className="motion-dev-shimmer">PREMIUM</span>
        </div>

        <div className="motion-dev-card">
          <span className="motion-dev-badge is-premium">premium · css</span>
          <strong>Pulse</strong>
          <span className="motion-dev-pulse">🪙 1 000</span>
        </div>

        <ScrollReveal className="motion-dev-card">
          <span className="motion-dev-badge is-base">base · js</span>
          <strong>ScrollReveal</strong>
          <p>Появление при прокрутке. Прокрути страницу.</p>
        </ScrollReveal>

        <div className="motion-dev-card">
          <span className="motion-dev-badge is-base">base · js</span>
          <strong>TiltCard</strong>
          <TiltCard className="motion-dev-tilt">Наведи и веди мышью</TiltCard>
        </div>

        <div className="motion-dev-card">
          <span className="motion-dev-badge is-premium">premium · js</span>
          <strong>Parallax</strong>
          <Parallax className="motion-dev-parallax" speed={0.4}>
            <span className="motion-dev-parallax-chip">Слой плывёт при прокрутке</span>
          </Parallax>
        </div>
      </div>

      <section className="motion-dev-catalog">
        <h2>Каталог ({counts.total})</h2>
        <ul>
          {MOTION_CATALOG.map((item) => (
            <li key={item.id}>
              <span className={`motion-dev-badge ${item.dose === 'base' ? 'is-base' : 'is-premium'}`}>{item.dose}</span>
              <span>{item.label}</span>
              <span className="motion-dev-kind">{item.kind}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
