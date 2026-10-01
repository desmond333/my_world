import type { Dictionary } from './types'

export const auth: Dictionary = {
  ru: {
    'auth.account.title': 'Личный кабинет',
    'auth.title.guest': 'Аккаунт и облачная синхронизация',
    'auth.subtitle.account': 'Твои данные подключены и синхронизируются с облаком Cloudflare D1.',
    'auth.subtitle.guest': 'Войди, чтобы синхронизировать задачи, заметки, тренировки и финансы между всеми устройствами.',

    'auth.field.email': 'Электронная почта',
    'auth.field.emailShort': 'Почта',
    'auth.field.password': 'Пароль',
    'auth.field.role': 'Роль',
    'auth.field.lastSynced': 'Синхронизировано',

    'auth.sync.syncing': 'Синхронизация...',
    'auth.sync.now': 'Синхронизировать сейчас',
    'auth.sync.success': 'Синхронизация успешно завершена!',
    'auth.sync.failed': 'Ошибка синхронизации. Проверь сеть.',

    'auth.adminPanel': 'Открыть Панель Администратора',
    'auth.logout': 'Выйти из аккаунта',

    'auth.tab.login': 'Вход',
    'auth.tab.register': 'Регистрация',
    'auth.submit.login': 'Войти',
    'auth.submit.register': 'Зарегистрироваться',
    'auth.submit.processing': 'Обработка...',

    'auth.date.never': 'Никогда',
    'auth.notice.offline':
      'Офлайн-first: все данные сохраняются локально в твоём браузере. Регистрация подключает устройство к Cloudflare D1 для бэкапа и синхронизации.',

    'auth.birthday.title': 'Мой день рождения',
    'auth.birthday.desc': 'Используется для персонального поздравления на главном экране и праздничных отметок.',
    'auth.birthday.current': 'Установленная дата',
    'auth.birthday.none': 'Пока не указана',
    'auth.birthday.remove': 'Сбросить дату',
    'auth.birthday.clear': 'Сбросить',
  },
  en: {
    'auth.account.title': 'Your Account',
    'auth.title.guest': 'Cloud Sync & Account',
    'auth.subtitle.account': 'Your data is connected and synchronized with Cloudflare D1.',
    'auth.subtitle.guest': 'Sign in to sync your tasks, notes, habits, and finance across all devices.',

    'auth.field.email': 'Email Address',
    'auth.field.emailShort': 'Email',
    'auth.field.password': 'Password',
    'auth.field.role': 'Role',
    'auth.field.lastSynced': 'Last Synced',

    'auth.sync.syncing': 'Synchronizing...',
    'auth.sync.now': 'Sync Data Now',
    'auth.sync.success': 'Sync completed successfully!',
    'auth.sync.failed': 'Sync failed. Check connection.',

    'auth.adminPanel': 'Open Admin Control Panel',
    'auth.logout': 'Sign Out',

    'auth.tab.login': 'Sign In',
    'auth.tab.register': 'Create Account',
    'auth.submit.login': 'Sign In',
    'auth.submit.register': 'Create Account',
    'auth.submit.processing': 'Processing...',

    'auth.date.never': 'Never',
    'auth.notice.offline':
      'Offline-first design: all your data stays stored locally in your browser. Registration connects your device to Cloudflare D1 for safe backups and cross-device sync.',

    'auth.birthday.title': 'My Birthday',
    'auth.birthday.desc': 'Used for personal celebration on the daily dashboard and special event tags.',
    'auth.birthday.current': 'Current date',
    'auth.birthday.none': 'Not specified yet',
    'auth.birthday.remove': 'Remove date',
    'auth.birthday.clear': 'Clear',
  },
}
