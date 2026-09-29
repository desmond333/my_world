import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import './Dialog.css'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogPortal = DialogPrimitive.Portal
export const DialogClose = DialogPrimitive.Close

export const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} className={`ui-dialog-overlay ${className ?? ''}`.trim()} {...props} />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

export type DialogContentProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  variant?: 'default' | 'accent'
  showCloseButton?: boolean
}

export const DialogContent = forwardRef<ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
  ({ className, children, variant = 'default', showCloseButton = true, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />
      <div className="ui-dialog-positioner">
        <DialogPrimitive.Content
          ref={ref}
          className={`ui-dialog-content ${variant === 'accent' ? 'ui-dialog-content--accent' : ''} ${className ?? ''}`.trim()}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close className="ui-dialog-close ui-dialog-close--corner" aria-label="Close">
              <X size={18} />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </div>
    </DialogPortal>
  ),
)
DialogContent.displayName = DialogPrimitive.Content.displayName

export const DialogHeader = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div className={`ui-dialog-header ${className ?? ''}`.trim()} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

export const DialogBody = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div className={`ui-dialog-body ${className ?? ''}`.trim()} {...props} />
)
DialogBody.displayName = 'DialogBody'

export const DialogFooter = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div className={`ui-dialog-footer ${className ?? ''}`.trim()} {...props} />
)
DialogFooter.displayName = 'DialogFooter'

export const DialogTitle = forwardRef<ElementRef<typeof DialogPrimitive.Title>, ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(
  ({ className, ...props }, ref) => <DialogPrimitive.Title ref={ref} className={`ui-dialog-title ${className ?? ''}`.trim()} {...props} />,
)
DialogTitle.displayName = DialogPrimitive.Title.displayName

export const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={`ui-dialog-description ${className ?? ''}`.trim()} {...props} />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export type ModalProps = {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  variant?: 'default' | 'accent'
  maxWidth?: number | string
  className?: string
  showCloseButton?: boolean
}

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  variant = 'default',
  maxWidth,
  className,
  showCloseButton = true,
}: ModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogPortal>
        <DialogOverlay />
        <div className="ui-dialog-positioner">
          <DialogPrimitive.Content
            className={`ui-dialog-content ${variant === 'accent' ? 'ui-dialog-content--accent' : ''} ${className ?? ''}`.trim()}
            style={maxWidth ? { maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth } : undefined}
          >
            {(title || showCloseButton) && (
              <div className="ui-dialog-header">
                <div>
                  {title && (typeof title === 'string' ? <DialogTitle>{title}</DialogTitle> : title)}
                  {description && (typeof description === 'string' ? <DialogDescription>{description}</DialogDescription> : description)}
                </div>
                {showCloseButton && (
                  <DialogPrimitive.Close className="ui-dialog-close" aria-label="Close" onClick={onClose}>
                    <X size={18} />
                  </DialogPrimitive.Close>
                )}
              </div>
            )}
            <div className="ui-dialog-body">{children}</div>
          </DialogPrimitive.Content>
        </div>
      </DialogPortal>
    </Dialog>
  )
}
