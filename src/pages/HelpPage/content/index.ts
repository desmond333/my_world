import type { HelpSection } from './types'
import { helpRu } from './ru'
import { helpEn } from './en'
import type { Lang } from '../../../lib/i18n/types'

const CONTENT: Record<Lang, HelpSection[]> = {
  ru: helpRu,
  en: helpEn,
}

export const getHelpContent = (lang: Lang): HelpSection[] => CONTENT[lang] ?? helpRu

export type { HelpSection, HelpSubsection, HelpBlock, HelpSectionKey, HelpNoteTone } from './types'
