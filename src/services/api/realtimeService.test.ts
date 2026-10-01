import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { realtimeService } from './realtimeService'

class MockWebSocket {
  public static OPEN = 1
  public static CONNECTING = 0
  public readyState = MockWebSocket.OPEN
  public onopen: (() => void) | null = null
  public onmessage: ((event: { data: string }) => void) | null = null
  public onclose: (() => void) | null = null
  public onerror: (() => void) | null = null
  public sent: string[] = []

  constructor(public url: string) {
    setTimeout(() => {
      if (this.onopen) this.onopen()
    }, 0)
  }

  public send(data: string) {
    this.sent.push(data)
  }

  public close() {
    this.readyState = 3
    if (this.onclose) this.onclose()
  }
}

describe('realtimeService', () => {
  const originalWebSocket = global.WebSocket

  beforeEach(() => {
    vi.stubGlobal('WebSocket', MockWebSocket)
  })

  afterEach(() => {
    realtimeService.disconnect()
    vi.stubGlobal('WebSocket', originalWebSocket)
  })

  it('subscribes and receives incoming messages', async () => {
    const received: unknown[] = []
    const unsub = realtimeService.subscribe((msg) => received.push(msg))

    realtimeService.connect()
    await new Promise((resolve) => setTimeout(resolve, 10))

    const socket = (realtimeService as unknown as { socket: MockWebSocket }).socket
    expect(socket).toBeDefined()

    socket.onmessage?.({ data: JSON.stringify({ type: 'sync_update', entity: 'notes' }) })
    expect(received).toEqual([{ type: 'sync_update', entity: 'notes' }])

    unsub()
    socket.onmessage?.({ data: JSON.stringify({ type: 'another' }) })
    expect(received.length).toBe(1)
  })

  it('sends messages when socket is open', async () => {
    realtimeService.connect()
    await new Promise((resolve) => setTimeout(resolve, 10))

    const socket = (realtimeService as unknown as { socket: MockWebSocket }).socket
    realtimeService.send({ type: 'client_ping' })
    expect(socket.sent).toContain(JSON.stringify({ type: 'client_ping' }))
  })
})
