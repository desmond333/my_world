import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check, Minus } from 'lucide-react'
import './Checkbox.css'

export type CheckboxProps = ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
  label?: ReactNode
  hint?: ReactNode
}

export const Checkbox = forwardRef<ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className = '', label, hint, id, checked, ...props }, ref) => {
    const content = (
      <CheckboxPrimitive.Root ref={ref} id={id} checked={checked} className={`ui-checkbox-root ${className}`.trim()} {...props}>
        <CheckboxPrimitive.Indicator className="ui-checkbox-indicator">
          {checked === 'indeterminate' ? <Minus size={12} /> : <Check size={12} strokeWidth={2.5} />}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    )

    if (!label && !hint) return content

    return (
      <label className="ui-checkbox-wrapper" htmlFor={id}>
        {content}
        <span className="ui-checkbox-text">
          {label && <span className="ui-checkbox-label">{label}</span>}
          {hint && <span className="ui-checkbox-hint">{hint}</span>}
        </span>
      </label>
    )
  },
)
Checkbox.displayName = CheckboxPrimitive.Root.displayName
