import type { ReactNode } from 'react'
import { APP_BUILT_AT, APP_COMMIT, APP_VERSION } from '../../lib/version'
import { CreatorNote } from './CreatorNote'
import './Footer.css'

export type FooterProps = {
  leftText?: ReactNode
  note?: ReactNode
  children?: ReactNode
  className?: string
}

export const Footer = ({ leftText, note, children, className = '' }: FooterProps) => {
  return (
    <footer className={className || undefined}>
      {leftText && <span>{leftText}</span>}
      {note && <span className="footer-note">{note}</span>}
      {children}
      <span className="footer-version">
        TAU v{APP_VERSION} · {APP_COMMIT}
        {APP_BUILT_AT ? ` · ${APP_BUILT_AT}` : ''}
      </span>
      <CreatorNote />
    </footer>
  )
}

export const AppFooter = Footer
