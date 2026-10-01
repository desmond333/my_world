export type HelpNoteTone = 'info' | 'warn' | 'success'

export type HelpBlock =
  | { type: 'text'; value: string }
  | { type: 'list'; items: string[] }
  | { type: 'steps'; items: string[] }
  | { type: 'note'; tone: HelpNoteTone; title: string; value: string }
  | { type: 'keys'; items: { keys: string; desc: string }[] }

export type HelpSubsection = {
  id: string
  title: string
  blocks: HelpBlock[]
}

export type HelpSectionKey =
  'start' | 'modes' | 'today' | 'useful' | 'misc' | 'social' | 'notes' | 'animals' | 'shop' | 'account' | 'settings' | 'faq'

export type HelpSection = {
  id: HelpSectionKey
  icon: string
  title: string
  intro: string
  subsections: HelpSubsection[]
}
