import type { Birthday } from '../../data'

export type BirthdayModalProps = { onClose: () => void }

export type SortedBirthday = Birthday & { next: Date; status: string }
