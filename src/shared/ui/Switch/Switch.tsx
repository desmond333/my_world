import { useId, type ReactNode } from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import './Switch.css'

export type SwitchProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: ReactNode
  hint?: ReactNode
  disabled?: boolean
  id?: string
  className?: string
  standalone?: boolean
}

export const Switch = ({ checked, onCheckedChange, label, hint, disabled, id, className = '', standalone = false }: SwitchProps) => {
  const generatedId = useId()
  const switchId = id || generatedId

  return (
    <label className={`ui-switch-row ${standalone ? 'ui-switch-row--standalone' : ''} ${className}`.trim()} htmlFor={switchId}>
      {(label || hint) && (
        <span className="ui-switch-text">
          {label && <span>{label}</span>}
          {hint && <small>{hint}</small>}
        </span>
      )}
      <SwitchPrimitive.Root
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="ui-switch-root"
      >
        <SwitchPrimitive.Thumb className="ui-switch-thumb" />
      </SwitchPrimitive.Root>
    </label>
  )
}
