import type { Birthday } from '../../data'
import type { BirthdayStatus } from '../../lib'

export type BirthdayModalProps = { onClose: () => void }

export type SortedBirthday = Birthday & { next: Date; status: BirthdayStatus }
