import { useState } from 'react'
import { Lightbulb, LifeBuoy, Send, TriangleAlert } from 'lucide-react'
import { rpc, rpcError } from '../../services/api/rpcClient'
import { useTranslation } from '../../lib/i18n'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ToggleGroup,
  ToggleGroupItem,
} from '../../shared/ui'
import './ContactModal.css'

type ContactTopic = 'support' | 'idea' | 'bug'

const TOPICS: { id: ContactTopic; icon: typeof LifeBuoy }[] = [
  { id: 'support', icon: LifeBuoy },
  { id: 'idea', icon: Lightbulb },
  { id: 'bug', icon: TriangleAlert },
]

type ContactModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ContactModal = ({ open, onOpenChange }: ContactModalProps) => {
  const { t } = useTranslation()
  const [topic, setTopic] = useState<ContactTopic>('support')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'short'>('idle')

  const submit = async () => {
    if (body.trim().length < 5) {
      setStatus('short')
      return
    }
    setStatus('sending')
    try {
      const res = await rpc.api.contact.$post({ json: { topic, body: body.trim() } })
      if (!res.ok) throw await rpcError(res, 'Failed to send message')
      setStatus('sent')
      setBody('')
      window.setTimeout(() => {
        onOpenChange(false)
        setStatus('idle')
      }, 1400)
    } catch {
      setStatus('error')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="contact-modal">
        <DialogHeader>
          <DialogTitle>{t('contact.title')}</DialogTitle>
          <DialogDescription>{t('contact.desc')}</DialogDescription>
        </DialogHeader>

        <div className="contact-body">
          <ToggleGroup
            type="single"
            value={topic}
            onValueChange={(val) => {
              if (val) setTopic(val as ContactTopic)
            }}
            className="contact-topics"
            aria-label={t('contact.topicLabel')}
          >
            {TOPICS.map((item) => {
              const Icon = item.icon
              return (
                <ToggleGroupItem key={item.id} value={item.id} className="contact-topic-btn">
                  <Icon size={14} />
                  {t(`contact.topic.${item.id}`)}
                </ToggleGroupItem>
              )
            })}
          </ToggleGroup>

          <textarea
            className="contact-textarea"
            value={body}
            onChange={(event) => {
              setBody(event.target.value)
              if (status !== 'idle' && status !== 'sending') setStatus('idle')
            }}
            placeholder={t('contact.placeholder')}
            rows={6}
            maxLength={4000}
          />

          {status !== 'idle' && status !== 'sending' && (
            <p className={`contact-status is-${status}`}>
              {status === 'sent' ? t('contact.sent') : status === 'short' ? t('contact.tooShort') : t('contact.error')}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="primary"
            leftIcon={<Send size={14} />}
            isLoading={status === 'sending'}
            disabled={status === 'sending' || status === 'sent'}
            onClick={submit}
          >
            {status === 'sending' ? t('contact.sending') : t('contact.send')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
