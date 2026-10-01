import { getApiBaseUrl } from './apiClient'

export type RealtimeEventHandler = (data: unknown) => void

export class RealtimeService {
  private socket: WebSocket | null = null
  private listeners = new Set<RealtimeEventHandler>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private pingInterval: ReturnType<typeof setInterval> | null = null
  private isExplicitlyClosed = false

  public connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return
    }

    this.isExplicitlyClosed = false
    const isBrowser = typeof window !== 'undefined'
    const baseUrl = getApiBaseUrl()
    const protocol = isBrowser && window.location ? window.location.protocol : 'http:'
    const host = baseUrl ? baseUrl.replace(/^https?:\/\//, '') : isBrowser && window.location ? window.location.host : 'localhost:8787'
    const wsProto = protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProto}//${host}/api/realtime/ws`

    try {
      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        this.startHeartbeat()
      }

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data)
          this.listeners.forEach((listener) => listener(parsed))
        } catch {
          this.listeners.forEach((listener) => listener(event.data))
        }
      }

      this.socket.onclose = () => {
        this.stopHeartbeat()
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect()
        }
      }

      this.socket.onerror = () => {
        if (this.socket) {
          this.socket.close()
        }
      }
    } catch {
      this.scheduleReconnect()
    }
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }

  public subscribe(listener: RealtimeEventHandler): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public send(payload: unknown): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload))
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping' })
    }, 30000)
  }

  private stopHeartbeat(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.isExplicitlyClosed) return
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, 5000)
  }
}

export const realtimeService = new RealtimeService()
