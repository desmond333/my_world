import type { Dictionary } from './types'

export const notifications: Dictionary = {
  ru: {
    'notif.title': 'Уведомления',
    'notif.empty': 'Пока уведомлений нет',
    'notif.markRead': 'Отметить прочитанными',
    'notif.details': 'Подробности',
    'notif.from': 'От',
    'notif.date': 'Дата',
    'notif.note': 'Заметка',

    'notif.friendRequest.title': 'Заявка в друзья',
    'notif.friendRequest.body': '{email} хочет добавить вас в друзья',

    'notif.friendTask.title': 'Новая задача от друга',
    'notif.friendTask.body': '{name}: {title}',

    'notif.greeting.title': 'Ответ из мира снов',
    'notif.greeting.body': '{name} ответил на ваше приветствие',

    'notif.referral.title': 'Награда за друга',
    'notif.referral.body': 'Друг зарегистрировался — заберите награду',

    'notif.action.accept': 'Принять',
    'notif.action.decline': 'Отклонить',
    'notif.action.openTasks': 'Открыть задачи',
    'notif.action.claim': 'Забрать награду',
    'notif.action.openAccount': 'Открыть аккаунт',
  },
  en: {
    'notif.title': 'Notifications',
    'notif.empty': 'No notifications yet',
    'notif.markRead': 'Mark as read',
    'notif.details': 'Details',
    'notif.from': 'From',
    'notif.date': 'Date',
    'notif.note': 'Note',

    'notif.friendRequest.title': 'Friend request',
    'notif.friendRequest.body': '{email} wants to add you as a friend',

    'notif.friendTask.title': 'New task from a friend',
    'notif.friendTask.body': '{name}: {title}',

    'notif.greeting.title': 'Reply from the dream world',
    'notif.greeting.body': '{name} replied to your greeting',

    'notif.referral.title': 'Referral reward',
    'notif.referral.body': 'A friend signed up — claim your reward',

    'notif.action.accept': 'Accept',
    'notif.action.decline': 'Decline',
    'notif.action.openTasks': 'Open tasks',
    'notif.action.claim': 'Claim reward',
    'notif.action.openAccount': 'Open account',
  },
}
