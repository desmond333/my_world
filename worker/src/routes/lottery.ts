import { Hono } from 'hono'
import { getLotteryStats, recordLotterySpin, setLotteryStats } from '../db/queries/lottery'
import { authMiddleware } from '../middleware/auth'
import type { Env, LotteryStats } from '../types'

export const lotteryRouter = new Hono<{ Bindings: Env }>()
  .use('*', authMiddleware)
  .get('/stats', async (c) => {
    const userId = c.get('user').userId
    const stats = await getLotteryStats(c.env.DB, userId)
    return c.json(stats)
  })
  .put('/stats', async (c) => {
    const userId = c.get('user').userId
    const body = (await c.req.json().catch(() => ({}))) as LotteryStats
    await setLotteryStats(c.env.DB, userId, body)
    return c.json({ success: true })
  })
  .post('/record', async (c) => {
    const userId = c.get('user').userId
    const body = (await c.req.json().catch(() => ({}))) as { sectorId?: string; won?: boolean; prize?: number }
    if (!body.sectorId) {
      return c.json({ error: 'sectorId is required', code: 'INVALID_DATA' }, 400)
    }
    const result = await recordLotterySpin(c.env.DB, userId, body.sectorId, Boolean(body.won), Number(body.prize) || 0)
    return c.json(result)
  })
