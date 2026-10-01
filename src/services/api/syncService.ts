import { apiFetch, getAuthToken } from './apiClient'
import { registerSyncTrigger, scheduleDebouncedSync } from './syncDebounce'
import { offlineStorage } from '../../lib/storage'
import { validateSyncSnapshot } from '../../lib/validation'
import { useBirthdayStore } from '../../store/birthday/birthdayStore'
import { useAvailabilityStore } from '../../store/availability/availabilityStore'
import { useBooksStore, useGamesStore, useMoviesStore } from '../../store/collection'
import { useDailyStore } from '../../store/daily/dailyStore'
import { useFavoritesStore } from '../../store/favorites/favoritesStore'
import { useFinanceStore } from '../../store/finance/financeStore'
import { useLotteryStore } from '../../store/lottery/lotteryStore'
import { useNotesStore } from '../../store/notes/notesStore'
import { useProductivityStore } from '../../store/productivity/productivityStore'
import { useShopStore } from '../../store/shop/shopStore'
import { useSubscriptionStore } from '../../store/subscription/subscriptionStore'
import { useTrainingStore } from '../../store/training/trainingStore'
import { useViewModeStore } from '../../store/viewMode/viewModeStore'
import type { SyncSnapshot } from '../../store/types'

export const collectLocalSnapshot = (): SyncSnapshot => {
  const daily = useDailyStore.getState()
  const training = useTrainingStore.getState()
  const finance = useFinanceStore.getState()
  const productivity = useProductivityStore.getState()
  const subscription = useSubscriptionStore.getState()
  const birthday = useBirthdayStore.getState()
  const movies = useMoviesStore.getState()
  const books = useBooksStore.getState()
  const games = useGamesStore.getState()
  const favorites = useFavoritesStore.getState()
  const lottery = useLotteryStore.getState()
  const notes = useNotesStore.getState()
  const shop = useShopStore.getState()
  const viewMode = useViewModeStore.getState()
  const availability = useAvailabilityStore.getState()

  return {
    settings: {
      lang: daily.lang ?? 'ru',
      themeMode: daily.themeMode ?? 'system',
      cityId: daily.cityId ?? 'moscow',
      scope: daily.scope ?? 'all',
      extraTab: Boolean(daily.extraTab),
      startPage: daily.startPage ?? '/today',
      blocks: daily.blocks,
      allowFriendTasks: daily.allowFriendTasks ?? true,
      hiddenSections: daily.hiddenSections ?? [],
    },
    training: {
      days: training.days,
      sports: training.sports,
    },
    finance: {
      entries: finance.entries,
      balance: finance.balance,
      rates: finance.rates,
      ratesSource: finance.ratesSource,
    },
    productivity: {
      items: productivity.items,
      months: productivity.months,
      mood: productivity.mood,
    },
    subscriptions: {
      items: subscription.items,
    },
    birthdays: {
      ownBirthday: birthday.ownBirthday,
      birthdays: birthday.birthdays,
    },
    collection: {
      movies: { wishlist: movies.wishlist, watched: movies.watched },
      books: { wishlist: books.wishlist, watched: books.watched },
      games: { wishlist: games.wishlist, watched: games.watched },
    },
    favorites: favorites.favorites,
    lottery: lottery.stats,
    notes: notes.notes,
    shop: {
      coins: shop.coins,
      unlockedParts: shop.unlockedParts,
      activeCatSkin: shop.activeCatSkin,
      activeThemeSkin: shop.activeThemeSkin,
      greetingSent: shop.greetingSent,
      greetingFriendName: shop.greetingFriendName,
      greetingTimestamp: shop.greetingTimestamp,
      greetingRewardClaimed: shop.greetingRewardClaimed,
      hasPendingGreetingReply: shop.hasPendingGreetingReply,
    },
    viewModes: {
      globalMode: viewMode.globalMode,
      pageModes: viewMode.pageModes,
      avatarMode: viewMode.avatarMode,
    },
    availability: {
      windows: availability.windows,
    },
  }
}

export const applyRemoteSnapshot = (snapshot: SyncSnapshot): void => {
  if (snapshot.settings) {
    useDailyStore.setState((state) => ({
      lang: (snapshot.settings.lang as 'ru' | 'en') ?? state.lang,
      themeMode: snapshot.settings.themeMode ?? state.themeMode,
      cityId: snapshot.settings.cityId ?? state.cityId,
      scope: snapshot.settings.scope ?? state.scope,
      extraTab: snapshot.settings.extraTab ?? state.extraTab,
      startPage: snapshot.settings.startPage ?? state.startPage,
      blocks: snapshot.settings.blocks ? { ...state.blocks, ...snapshot.settings.blocks } : state.blocks,
      allowFriendTasks: snapshot.settings.allowFriendTasks !== undefined ? snapshot.settings.allowFriendTasks : state.allowFriendTasks,
      hiddenSections: Array.isArray(snapshot.settings.hiddenSections) ? snapshot.settings.hiddenSections : state.hiddenSections,
    }))
  }

  if (snapshot.training) {
    useTrainingStore.setState({
      days: snapshot.training.days || {},
      sports: snapshot.training.sports?.length ? snapshot.training.sports : useTrainingStore.getState().sports,
    })
  }

  if (snapshot.finance) {
    useFinanceStore.setState((state) => ({
      entries: snapshot.finance.entries || state.entries,
      balance: snapshot.finance.balance || state.balance,
      rates: snapshot.finance.rates || state.rates,
      ratesSource: (snapshot.finance.ratesSource as 'default' | 'server' | 'manual') || state.ratesSource,
    }))
  }

  if (snapshot.productivity) {
    useProductivityStore.setState({
      items: snapshot.productivity.items || [],
      months: snapshot.productivity.months || {},
      mood: snapshot.productivity.mood || {},
    })
  }

  if (snapshot.subscriptions) {
    useSubscriptionStore.setState({
      items: snapshot.subscriptions.items || [],
    })
  }

  if (snapshot.birthdays) {
    useBirthdayStore.setState({
      ownBirthday: snapshot.birthdays.ownBirthday || '',
      birthdays: snapshot.birthdays.birthdays || [],
    })
  }

  if (snapshot.collection) {
    if (snapshot.collection.movies) {
      useMoviesStore.setState({
        wishlist: snapshot.collection.movies.wishlist || [],
        watched: snapshot.collection.movies.watched || [],
      })
    }
    if (snapshot.collection.books) {
      useBooksStore.setState({
        wishlist: snapshot.collection.books.wishlist || [],
        watched: snapshot.collection.books.watched || [],
      })
    }
    if (snapshot.collection.games) {
      useGamesStore.setState({
        wishlist: snapshot.collection.games.wishlist || [],
        watched: snapshot.collection.games.watched || [],
      })
    }
  }

  if (snapshot.favorites) {
    useFavoritesStore.setState({
      favorites: snapshot.favorites,
    })
  }

  if (snapshot.lottery) {
    useLotteryStore.setState({
      stats: snapshot.lottery,
    })
  }

  if (snapshot.notes) {
    useNotesStore.setState({
      notes: snapshot.notes,
    })
  }

  if (snapshot.shop) {
    useShopStore.setState((state) => ({
      coins: snapshot.shop.coins ?? state.coins,
      unlockedParts: snapshot.shop.unlockedParts ?? state.unlockedParts,
      activeCatSkin: snapshot.shop.activeCatSkin ?? state.activeCatSkin,
      activeThemeSkin: snapshot.shop.activeThemeSkin ?? state.activeThemeSkin,
      greetingSent: snapshot.shop.greetingSent ?? state.greetingSent,
      greetingFriendName: snapshot.shop.greetingFriendName ?? state.greetingFriendName,
      greetingTimestamp: snapshot.shop.greetingTimestamp ?? state.greetingTimestamp,
      greetingRewardClaimed: snapshot.shop.greetingRewardClaimed ?? state.greetingRewardClaimed,
      hasPendingGreetingReply: snapshot.shop.hasPendingGreetingReply ?? state.hasPendingGreetingReply,
    }))
  }

  if (snapshot.viewModes) {
    useViewModeStore.setState({
      globalMode: snapshot.viewModes.globalMode || 'simple',
      pageModes: snapshot.viewModes.pageModes || {},
      avatarMode: snapshot.viewModes.avatarMode || 'simple',
    })
  }

  if (snapshot.availability) {
    const now = new Date().toISOString()
    useAvailabilityStore.setState({
      windows: (snapshot.availability.windows ?? []).map((window) => ({
        id: window.id,
        userId: window.userId ?? '',
        scope: window.scope === 'date' ? 'date' : 'weekly',
        dayOfWeek: window.dayOfWeek ?? null,
        date: window.date ?? null,
        startMin: window.startMin,
        endMin: window.endMin,
        note: window.note ?? '',
        createdAt: window.createdAt ?? now,
        updatedAt: window.updatedAt ?? now,
      })),
    })
  }
}

export const pushSync = async (): Promise<void> => {
  await useShopStore.getState().flushOps()
  const snapshot = collectLocalSnapshot()
  try {
    await apiFetch('/api/sync', {
      method: 'POST',
      body: JSON.stringify(snapshot),
    })
    await offlineStorage.remove('pending_offline_sync')
    await offlineStorage.remove('pending_sync_snapshot')
  } catch (err) {
    await offlineStorage.set('pending_offline_sync', true)
    await offlineStorage.set('pending_sync_snapshot', snapshot)
    throw err
  }
}

registerSyncTrigger(pushSync)

export { scheduleDebouncedSync }

export const pullSync = async (): Promise<SyncSnapshot> => {
  await useShopStore.getState().flushOps()
  const raw = await apiFetch<unknown>('/api/sync')
  const snapshot = validateSyncSnapshot(raw)
  if (!snapshot) {
    throw new Error('Invalid sync snapshot from server')
  }
  applyRemoteSnapshot(snapshot)
  return snapshot
}

let isOnlineListenerInit = false

export const initOfflineSync = (): void => {
  if (typeof window === 'undefined' || isOnlineListenerInit) return
  isOnlineListenerInit = true

  window.addEventListener('online', async () => {
    if (!getAuthToken()) return
    const isPending = await offlineStorage.get('pending_offline_sync', false)
    if (isPending) {
      try {
        const rawPending = await offlineStorage.get<unknown>('pending_sync_snapshot', null)
        const validPending = validateSyncSnapshot(rawPending)
        if (validPending) {
          applyRemoteSnapshot(validPending)
        }
        await pushSync()
      } catch (err) {
        void err
      }
    }
  })
}
