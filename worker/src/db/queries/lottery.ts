import { and, eq } from 'drizzle-orm'
import { getDb } from '../client'
import { lotteryStats } from '../schema'
import type { LotteryStats } from '../../types'

export const getLotteryStats = async (d1: D1Database, userId: string): Promise<LotteryStats> => {
  const db = getDb(d1)
  const rows = await db.select().from(lotteryStats).where(eq(lotteryStats.userId, userId))

  const stats: LotteryStats = {}
  for (const row of rows) {
    stats[row.sectorId] = {
      spins: row.spins,
      wins: row.wins,
      earned: row.earned,
    }
  }
  return stats
}

export const setLotteryStats = async (d1: D1Database, userId: string, stats: LotteryStats): Promise<void> => {
  const db = getDb(d1)
  await db.delete(lotteryStats).where(eq(lotteryStats.userId, userId))

  const entries = Object.entries(stats)
  if (entries.length > 0) {
    await db.insert(lotteryStats).values(
      entries.map(([sectorId, entry]) => ({
        userId,
        sectorId,
        spins: entry.spins || 0,
        wins: entry.wins || 0,
        earned: entry.earned || 0,
      })),
    )
  }
}

export const recordLotterySpin = async (
  d1: D1Database,
  userId: string,
  sectorId: string,
  won: boolean,
  prize: number,
): Promise<{ spins: number; wins: number; earned: number }> => {
  const db = getDb(d1)
  const existing = await db
    .select()
    .from(lotteryStats)
    .where(and(eq(lotteryStats.userId, userId), eq(lotteryStats.sectorId, sectorId)))
    .get()

  const spins = (existing?.spins || 0) + 1
  const wins = (existing?.wins || 0) + (won ? 1 : 0)
  const earned = (existing?.earned || 0) + (won ? prize : 0)

  await db
    .insert(lotteryStats)
    .values({ userId, sectorId, spins, wins, earned })
    .onConflictDoUpdate({
      target: [lotteryStats.userId, lotteryStats.sectorId],
      set: { spins, wins, earned },
    })

  return { spins, wins, earned }
}
