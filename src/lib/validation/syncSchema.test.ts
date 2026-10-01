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

  it('accepts availability windows in a snapshot', () => {
    const result = validateSyncSnapshot({
      availability: {
        windows: [
          {
            id: 'window-1',
            userId: 'user-1',
            scope: 'weekly',
            dayOfWeek: 3,
            date: null,
            startMin: 540,
            endMin: 720,
            note: 'Дома',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      },
    })

    expect(result).not.toBeNull()
    expect(result?.availability?.windows).toHaveLength(1)
    expect(result?.availability?.windows?.[0]?.startMin).toBe(540)
  })

  it('rejects availability windows without interval bounds', () => {
    const result = validateSyncSnapshot({
      availability: {
        windows: [{ id: 'window-1', note: 'Дома' }],
      },
    })

    expect(result).toBeNull()
  })
})
