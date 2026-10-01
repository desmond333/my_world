import type { LucideIcon } from 'lucide-react'

export type BlockType =
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'todo'
  | 'bullet'
  | 'numbered'
  | 'toggle'
  | 'callout'
  | 'quote'
  | 'code'
  | 'divider'
  | 'image'
  | 'audio'
  | 'pdf'

export type Block = {
  id: string
  type: BlockType
  content: string
  checked?: boolean
  open?: boolean
  emoji?: string
  language?: string
  url?: string
  fileName?: string
  fileSize?: number
  caption?: string
  mimeType?: string
}

export type SlashItem = {
  type: BlockType
  title: string
  description: string
  icon: LucideIcon
  group: 'basic' | 'advanced'
  keywords: string[]
}
