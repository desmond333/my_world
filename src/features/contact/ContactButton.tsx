import { useState } from 'react'
import { Mail } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import { Button, type ButtonProps } from '../../shared/ui'
import { ContactModal } from './ContactModal'

export type ContactButtonProps = {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
  label?: string
}

export const ContactButton = ({ variant = 'secondary', size = 'md', className, label }: ContactButtonProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant={variant} size={size} className={className} leftIcon={<Mail size={15} />} onClick={() => setOpen(true)}>
        {label ?? t('contact.open')}
      </Button>
      <ContactModal open={open} onOpenChange={setOpen} />
    </>
  )
}
