import { useState } from 'react'
import { Coins, Heart, Mail, Send, Sparkles, X } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import { useShopStore } from '../../../store'
import { playCatMeow, playCatPurr } from '../../../components/CatAssistant/catAudio'
import './DreamFriendGreeting.css'

type DreamFriendGreetingProps = {
  onShowToast: (msg: string) => void
}

export const DreamFriendGreeting = ({ onShowToast }: DreamFriendGreetingProps) => {
  const { lang } = useTranslation()
  const hasPendingReply = useShopStore((state) => state.hasPendingGreetingReply)
  const friendName = useShopStore((state) => state.greetingFriendName)
  const sendGreeting = useShopStore((state) => state.sendFriendGreeting)
  const claimReply = useShopStore((state) => state.claimFriendGreetingReply)

  const [inputName, setInputName] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [claimedNotice, setClaimedNotice] = useState(false)

  const isEn = lang === 'en'

  const presets = isEn ? ['Best Friend', 'Soulmate', 'Night Wanderer'] : ['Лучший друг', 'Родственная душа', 'Ночной странник']

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    const name = inputName.trim() || presets[0]
    sendGreeting(name)
    setInputName('')
    setFormOpen(false)
    playCatPurr()
    onShowToast(
      isEn
        ? `Dream letter sent to ${name}! Check back on your next visit 🌙`
        : `Письмо отправлено ${name}! Ожидай ответа при следующем входе 🌙`,
    )
  }

  const handleClaim = () => {
    claimReply()
    setClaimedNotice(true)
    playCatMeow()
    onShowToast(isEn ? '+100 Coins added to your Treasury! 🪙' : '+100 коинов зачислено в казну! 🪙')
    setTimeout(() => {
      setClaimedNotice(false)
    }, 2500)
  }

  return (
    <>
      {hasPendingReply && !claimedNotice && (
        <div className="dream-reply-modal-backdrop" role="dialog" aria-modal="true">
          <div className="dream-reply-card">
            <div className="dream-reply-stars">✨ 🌙 ✨</div>
            <div className="dream-reply-icon">
              <Mail size={28} className="dream-mail-icon" />
              <Heart size={16} className="dream-heart-badge" />
            </div>

            <h3 className="dream-reply-title">{isEn ? 'Dream Letter Received!' : 'Ответ из мира снов получен!'}</h3>

            <p className="dream-reply-text">
              {isEn
                ? `Your friend ${friendName || 'a kindred spirit'} felt your warm dream greeting, smiled back across the night sky, and sent you a magical gift:`
                : `Твой друг ${friendName || 'родственная душа'} почувствовал твой ночной привет, ответил взаимностью сквозь сновидение и передал подарок:`}
            </p>

            <div className="dream-reply-reward">
              <Coins size={22} className="dream-coins-icon" />
              <span className="dream-reward-amount">+100 {isEn ? 'Coins' : 'Коинов'}</span>
            </div>

            <button type="button" className="dream-claim-btn" onClick={handleClaim}>
              <Sparkles size={15} />
              <span>{isEn ? 'Claim 100 Coins 🪙' : 'Забрать 100 коинов 🪙'}</span>
            </button>
          </div>
        </div>
      )}

      <div className="dream-greeting-bar">
        {!formOpen ? (
          <button type="button" className="dream-greeting-trigger" onClick={() => setFormOpen(true)}>
            <Mail size={14} className="dream-trigger-mail" />
            <span>{isEn ? 'Send a dream greeting to a friend 💌' : 'Отправить приветствие другу через сны 💌'}</span>
          </button>
        ) : (
          <form className="dream-greeting-form" onSubmit={handleSend}>
            <div className="dream-form-header">
              <span className="dream-form-label">
                <Send size={13} /> {isEn ? 'Send greeting across dreams' : 'Приветствие сквозь сновидение'}
              </span>
              <button type="button" className="dream-form-close" onClick={() => setFormOpen(false)}>
                <X size={13} />
              </button>
            </div>

            <div className="dream-presets-row">
              {presets.map((p) => (
                <button key={p} type="button" className="dream-preset-chip" onClick={() => setInputName(p)}>
                  {p}
                </button>
              ))}
            </div>

            <div className="dream-input-group">
              <input
                type="text"
                className="dream-friend-input"
                placeholder={isEn ? "Friend's name (e.g. Alex)..." : 'Имя друга (напр. Алекс)...'}
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                autoFocus
              />
              <button type="submit" className="dream-send-btn">
                <Send size={13} />
                <span>{isEn ? 'Send ✨' : 'Отправить ✨'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
