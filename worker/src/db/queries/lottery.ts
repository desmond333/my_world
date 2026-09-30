import type { LotteryStats } from '../../types'

type LotteryRow = {
  sector_id: string
  spins: number
  wins: number
  earned: number
}

export const getLotteryStats = async (db: D1Database, userId: string): Promise<LotteryStats> => {
  const { results } = await db.prepare('SELECT * FROM lottery_stats WHERE user_id = ?').bind(userId).all<LotteryRow>()

  const stats: LotteryStats = {}
  for (const row of results) {
    stats[row.sector_id] = {
      spins: row.spins,
      wins: row.wins,
      earned: row.earned,
    }
  }
  return stats
}

export const setLotteryStats = async (db: D1Database, userId: string, stats: LotteryStats): Promise<void> => {
  const statements: D1PreparedStatement[] = [db.prepare('DELETE FROM lottery_stats WHERE user_id = ?').bind(userId)]

  for (const [sectorId, entry] of Object.entries(stats)) {
    statements.push(
      db
        .prepare(
          `INSERT INTO lottery_stats (user_id, sector_id, spins, wins, earned)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .bind(userId, sectorId, entry.spins || 0, entry.wins || 0, entry.earned || 0),
    )
  }

  await db.batch(statements)
}

export const recordLotterySpin = async (
  db: D1Database,
  userId: string,
  sectorId: string,
  won: boolean,
  prize: number,
): Promise<{ spins: number; wins: number; earned: number }> => {
  const existing = await db
    .prepare('SELECT * FROM lottery_stats WHERE user_id = ? AND sector_id = ?')
    .bind(userId, sectorId)
    .first<LotteryRow>()

  const spins = (existing?.spins || 0) + 1
  const wins = (existing?.wins || 0) + (won ? 1 : 0)
  const earned = (existing?.earned || 0) + (won ? prize : 0)

  await db
    .prepare(
      `INSERT INTO lottery_stats (user_id, sector_id, spins, wins, earned)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, sector_id) DO UPDATE SET
         spins = excluded.spins,
         wins = excluded.wins,
         earned = excluded.earned`,
    )
    .bind(userId, sectorId, spins, wins, earned)
    .run()

  return { spins, wins, earned }
}
