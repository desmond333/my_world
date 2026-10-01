import type { Dictionary } from './types'

export const premium: Dictionary = {
  ru: {
    'premium.badge': 'Премиум',
    'premium.status.lifetime': 'Пожизненный премиум',
    'premium.status.active': 'Премиум активен до {date}',
    'premium.status.none': 'Премиум не активен',
    'premium.sectionsUnlocked': 'Все премиум-разделы открыты.',

    'premium.referral.title': 'Пригласи друзей',
    'premium.referral.desc':
      'За каждого друга, который зарегистрируется по твоему коду, забери награду на выбор: {coins} монет или {months} мес. премиума.',
    'premium.referral.code': 'Твой код',
    'premium.referral.copyCode': 'Скопировать код',
    'premium.referral.copyLink': 'Скопировать ссылку',
    'premium.referral.invited': 'Приглашено: {count}',
    'premium.referral.earned': 'Заработано монет: {count}',
    'premium.referral.pendingTitle': 'Незабранные награды: {count}',
    'premium.referral.claimCoins': 'Забрать {coins} монет',
    'premium.referral.claimPremium': 'Забрать {months} мес. премиума',
    'premium.referral.claiming': 'Забираем…',
    'premium.referral.inputLabel': 'Код друга (необязательно)',
    'premium.referral.empty': 'Пока никого не пригласил.',
    'premium.referral.claimError': 'Не удалось забрать награду. Попробуйте ещё раз.',
    'premium.refereeReward': 'Тебе начислено {coins} монет за регистрацию по приглашению!',
    'premium.refereeInvalid': 'Код друга не найден — аккаунт создан без бонуса.',

    'admin.premium.grant': 'Выдать пожизненный премиум',
    'admin.premium.revoke': 'Снять пожизненный премиум',
    'admin.premium.active': 'Премиум активен',
  },
  en: {
    'premium.badge': 'Premium',
    'premium.status.lifetime': 'Lifetime premium',
    'premium.status.active': 'Premium active until {date}',
    'premium.status.none': 'Premium is not active',
    'premium.sectionsUnlocked': 'All premium sections are unlocked.',

    'premium.referral.title': 'Invite friends',
    'premium.referral.desc':
      'For each friend who signs up with your code, claim a reward of your choice: {coins} coins or {months} months of premium.',
    'premium.referral.code': 'Your code',
    'premium.referral.copyCode': 'Copy code',
    'premium.referral.copyLink': 'Copy invite link',
    'premium.referral.invited': 'Invited: {count}',
    'premium.referral.earned': 'Coins earned: {count}',
    'premium.referral.pendingTitle': 'Unclaimed rewards: {count}',
    'premium.referral.claimCoins': 'Claim {coins} coins',
    'premium.referral.claimPremium': 'Claim {months} months of premium',
    'premium.referral.claiming': 'Claiming…',
    'premium.referral.inputLabel': 'Friend referral code (optional)',
    'premium.referral.empty': 'No invites yet.',
    'premium.referral.claimError': 'Could not claim the reward. Please try again.',
    'premium.refereeReward': 'You received {coins} coins for joining by invitation!',
    'premium.refereeInvalid': 'Friend code was not found — the account was created without the bonus.',

    'admin.premium.grant': 'Grant lifetime premium',
    'admin.premium.revoke': 'Revoke lifetime premium',
    'admin.premium.active': 'Premium active',
  },
}
