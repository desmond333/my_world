import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import './RadioGroup.css'

export const RadioGroup = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Root>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className = '', ...props }, ref) => <RadioGroupPrimitive.Root ref={ref} className={`ui-radio-group ${className}`.trim()} {...props} />)
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

export type RadioGroupItemProps = ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
  label?: ReactNode
  hint?: ReactNode
}

export const RadioGroupItem = forwardRef<ElementRef<typeof RadioGroupPrimitive.Item>, RadioGroupItemProps>(
  ({ className = '', label, hint, id, ...props }, ref) => {
    const content = (
      <RadioGroupPrimitive.Item ref={ref} id={id} className={`ui-radio-item ${className}`.trim()} {...props}>
        <RadioGroupPrimitive.Indicator className="ui-radio-indicator" />
      </RadioGroupPrimitive.Item>
    )

    if (!label && !hint) return content

    return (
      <label className="ui-radio-wrapper" htmlFor={id}>
        {content}
        <span className="ui-radio-text">
          {label && <span className="ui-radio-label">{label}</span>}
          {hint && <span className="ui-radio-hint">{hint}</span>}
        </span>
      </label>
    )
  },
)
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName
