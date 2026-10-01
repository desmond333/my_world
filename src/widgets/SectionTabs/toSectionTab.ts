import type { LucideIcon } from 'lucide-react'
import { getTranslation, type Lang } from '../../lib/i18n'
import type { SectionTab } from './SectionTabs'

export type SectionTabSource<Key extends string = string> = {
  key: Key
  label: string
  hint: string
  icon: LucideIcon
}

export const toSectionTab = <Key extends string>(
  basePath: string,
  namespace: string,
  lang: Lang,
  tab: SectionTabSource<Key>,
  end = false,
): SectionTab => ({
  to: `${basePath}/${tab.key}`,
  label: getTranslation(`${namespace}.tab.${tab.key}`, lang, tab.label),
  hint: getTranslation(`${namespace}.tab.${tab.key}Hint`, lang, tab.hint),
  icon: tab.icon,
  end,
})
