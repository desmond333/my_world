import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import './Input.css'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  helperText?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, className, disabled, id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

    return (
      <div className={`ui-input-wrapper ${className ?? ''}`.trim()}>
        {label && (
          <label htmlFor={inputId} className="ui-input-label">
            {label}
          </label>
        )}
        <div className={`ui-input-container ${error ? 'ui-input-container--error' : ''} ${disabled ? 'ui-input-container--disabled' : ''}`}>
          {leftIcon && <span className="ui-input-icon">{leftIcon}</span>}
          <input id={inputId} ref={ref} disabled={disabled} className="ui-input-field" {...props} />
          {rightIcon && <span className="ui-input-icon">{rightIcon}</span>}
        </div>
        {error && <p className="ui-input-error">{error}</p>}
        {!error && helperText && <p className="ui-input-helper">{helperText}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'
