import { useState } from 'react'
import { Coins, Heart, Mail, Send, Sparkles, X } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import { Dialog, DialogContent, DialogTitle } from '../../../shared/ui'
import { useShopStore } from '../../../store'
import { playCatMeow, playCatPurr } from '../../../widgets/CatAssistant'
import './DreamFriendGreeting.css'

type DreamFriendGreetingProps = {
  onShowToast: (msg: string) => void
}

export const DreamFriendGreeting = ({ onShowToast }: DreamFriendGreetingProps) => {
  const { t } = useTranslation()
  const hasPendingReply = useShopStore((state) => state.hasPendingGreetingReply)
  const friendName = useShopStore((state) => state.greetingFriendName)
  const sendGreeting = useShopStore((state) => state.sendFriendGreeting)
  const claimReply = useShopStore((state) => state.claimFriendGreetingReply)

  const [inputName, setInputName] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [claimedNotice, setClaimedNotice] = useState(false)

  const presets = [t('notesDream.preset.bestFriend'), t('notesDream.preset.soulmate'), t('notesDream.preset.nightWanderer')]

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    const name = inputName.trim() || presets[0]
    sendGreeting(name)
    setInputName('')
    setFormOpen(false)
    playCatPurr()
    onShowToast(t('notesDream.sent', undefined, { name }))
  }

  const handleClaim = () => {
    claimReply()
    setClaimedNotice(true)
    playCatMeow()
    onShowToast(t('notesDream.100-coins-added-to-your-treasury', '+100 коинов зачислено в казну! 🪙'))
    setTimeout(() => {
      setClaimedNotice(false)
    }, 2500)
  }

  return (
    <>
      <Dialog open={hasPendingReply && !claimedNotice} onOpenChange={() => {}}>
        {hasPendingReply && !claimedNotice && (
          <DialogContent
            className="dream-reply-card"
            showCloseButton={false}
            aria-describedby={undefined}
            onEscapeKeyDown={(event) => event.preventDefault()}
            onPointerDownOutside={(event) => event.preventDefault()}
            onInteractOutside={(event) => event.preventDefault()}
          >
            <div className="dream-reply-stars">✨ 🌙 ✨</div>
            <div className="dream-reply-icon">
              <Mail size={28} className="dream-mail-icon" />
              <Heart size={16} className="dream-heart-badge" />
            </div>

            <DialogTitle asChild>
              <h3 className="dream-reply-title">{t('notesDream.dream-letter-received', 'Ответ из мира снов получен!')}</h3>
            </DialogTitle>

            <p className="dream-reply-text">
              {t('notesDream.replyText', undefined, { name: friendName || t('notesDream.kindredSpirit') })}
            </p>

            <div className="dream-reply-reward">
              <Coins size={22} className="dream-coins-icon" />
              <span className="dream-reward-amount">+100 {t('notesDream.coins')}</span>
            </div>

            <button type="button" className="dream-claim-btn" onClick={handleClaim}>
              <Sparkles size={15} />
              <span>{t('notesDream.claim-100-coins', 'Забрать 100 коинов 🪙')}</span>
            </button>
          </DialogContent>
        )}
      </Dialog>

      <div className="dream-greeting-bar">
        {!formOpen ? (
          <button type="button" className="dream-greeting-trigger" onClick={() => setFormOpen(true)}>
            <Mail size={14} className="dream-trigger-mail" />
            <span>{t('notesDream.send-a-dream-greeting-to-a-friend', 'Отправить приветствие другу через сны 💌')}</span>
          </button>
        ) : (
          <form className="dream-greeting-form" onSubmit={handleSend}>
            <div className="dream-form-header">
              <span className="dream-form-label">
                <Send size={13} /> {t('notesDream.send-greeting-across-dreams', 'Приветствие сквозь сновидение')}
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
                placeholder={t('notesDream.namePlaceholder')}
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                autoFocus
              />
              <button type="submit" className="dream-send-btn">
                <Send size={13} />
                <span>{t('notesDream.send')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
