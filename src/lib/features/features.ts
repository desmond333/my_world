import type { ShopItemKey } from '../shop/catalog'

export type FeatureAccess = 'free' | 'premium'

export type FeatureDefinition = {
  access: FeatureAccess
  labelKey: string
  descriptionKey?: string
  shopKey?: ShopItemKey
}

export const FEATURES = {
  today: { access: 'free', labelKey: 'nav.today' },
  favorites: { access: 'free', labelKey: 'nav.favorites' },
  notes: { access: 'free', labelKey: 'nav.notes' },
  shop: { access: 'free', labelKey: 'nav.shop' },
  productivity: { access: 'free', labelKey: 'feature.productivity' },
  training: { access: 'free', labelKey: 'feature.training' },
  finance: { access: 'free', labelKey: 'feature.finance' },
  media: { access: 'free', labelKey: 'feature.media' },
  mind: { access: 'free', labelKey: 'feature.mind' },
  languages: { access: 'free', labelKey: 'feature.languages' },
  settings: { access: 'free', labelKey: 'feature.settings' },
  help: { access: 'free', labelKey: 'feature.help' },
  together: { access: 'free', labelKey: 'feature.together' },
  birthdays: { access: 'free', labelKey: 'feature.birthdays' },
  georgian: { access: 'free', labelKey: 'feature.georgian' },
  forecast: { access: 'free', labelKey: 'feature.forecast' },

  'notes.advanced': {
    access: 'premium',
    shopKey: 'notes_advanced',
    labelKey: 'feature.notesAdvanced',
    descriptionKey: 'feature.notesAdvancedDesc',
  },
  'languages.advanced': {
    access: 'premium',
    shopKey: 'lang_advanced',
    labelKey: 'feature.langAdvanced',
    descriptionKey: 'feature.langAdvancedDesc',
  },
  'finance.advice': {
    access: 'premium',
    shopKey: 'finance_advice',
    labelKey: 'feature.advice',
    descriptionKey: 'feature.adviceDesc',
  },
  'view.normal': {
    access: 'premium',
    shopKey: 'view_normal',
    labelKey: 'feature.viewNormal',
    descriptionKey: 'feature.viewNormalDesc',
  },
  'motion.double': {
    access: 'premium',
    shopKey: 'motion_pro',
    labelKey: 'feature.motionDouble',
    descriptionKey: 'feature.motionDoubleDesc',
  },
} as const satisfies Record<string, FeatureDefinition>

export type FeatureId = keyof typeof FEATURES
