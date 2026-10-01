import { Hono } from 'hono'
import type { Env } from '../types'

export const realtimeRouter = new Hono<{ Bindings: Env }>()

realtimeRouter.get('/ws', async (c) => {
  const upgradeHeader = c.req.header('Upgrade')
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
    return c.text('Expected Upgrade: websocket', 426)
  }

  const pair = new WebSocketPair()
  const [client, server] = Object.values(pair)

  server.accept()
  server.addEventListener('message', (event) => {
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : null
      if (data && data.type === 'ping') {
        server.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }))
      }
    } catch {
      server.send(JSON.stringify({ type: 'error', message: 'Invalid payload' }))
    }
  })

  return new Response(null, {
    status: 101,
    webSocket: client,
  })
})
