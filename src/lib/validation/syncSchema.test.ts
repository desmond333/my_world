import { describe, expect, it } from 'vitest'
import { validateSyncSnapshot } from './syncSchema'

describe('validateSyncSnapshot', () => {
  it('validates a valid snapshot successfully', () => {
    const validData = {
      settings: {
        lang: 'ru',
        themeMode: 'system',
        cityId: 'moscow',
        scope: 'all',
        extraTab: true,
        startPage: '/today',
        blocks: { weather: true, animal: true },
        allowFriendTasks: true,
      },
      notes: [
        {
          id: 'test-1',
          kind: 'note',
          title: 'Title',
          body: 'Content',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    }

    const result = validateSyncSnapshot(validData)
    expect(result).not.toBeNull()
    expect(result?.settings?.lang).toBe('ru')
    expect(result?.notes?.[0]?.title).toBe('Title')
  })

  it('returns null for invalid or non-object data', () => {
    expect(validateSyncSnapshot(null)).toBeNull()
    expect(validateSyncSnapshot(undefined)).toBeNull()
    expect(validateSyncSnapshot('not-an-object')).toBeNull()
    expect(validateSyncSnapshot(12345)).toBeNull()
  })

  it('rejects malformed items inside arrays', () => {
    const invalidData = {
      notes: [
        {
          id: 123,
          kind: 'note',
        },
      ],
    }
    expect(validateSyncSnapshot(invalidData)).toBeNull()
  })
})
