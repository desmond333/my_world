import type { ReactNode } from 'react'
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
      <CreatorNote />
    </footer>
  )
}

export const AppFooter = Footer
