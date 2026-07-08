import { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import { useWsStore } from '@/stores/wsStore'
import { useAuthStore } from '@/stores/authStore'

const WS_URL = import.meta.env.VITE_WS_URL ?? ''
const MAX_RECONNECT_DELAY = 30000
const BASE_RECONNECT_DELAY = 1000

interface WebSocketContextValue {
  send: (data: string) => void
}

const WebSocketContext = createContext<WebSocketContextValue>({
  send: () => {},
})

export function useWebSocket() {
  return useContext(WebSocketContext)
}

export default function WebSocketProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectDelayRef = useRef(BASE_RECONNECT_DELAY)
  const mountedRef = useRef(true)

  const { setStatus, setPayload, incrementReconnect, resetReconnect } = useWsStore()
  const { isAuthenticated } = useAuthStore()

  const connect = () => {
    if (!mountedRef.current || !isAuthenticated) return
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setStatus('connecting')

    const ws = new WebSocket(`${WS_URL}/ws/dashboard`)
    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) return
      setStatus('connected')
      resetReconnect()
      reconnectDelayRef.current = BASE_RECONNECT_DELAY
    }

    ws.onmessage = (event) => {
      if (!mountedRef.current) return
      try {
        const payload = JSON.parse(event.data)
        setPayload(payload)
      } catch {
      }
    }

    ws.onerror = () => {
      if (!mountedRef.current) return
      setStatus('error')
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setStatus('disconnected')
      wsRef.current = null
      scheduleReconnect()
    }
  }

  const scheduleReconnect = () => {
    if (!mountedRef.current) return
    incrementReconnect()
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectDelayRef.current = Math.min(
        reconnectDelayRef.current * 2,
        MAX_RECONNECT_DELAY
      )
      connect()
    }, reconnectDelayRef.current)
  }

  const send = (data: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    if (isAuthenticated) connect()

    return () => {
      mountedRef.current = false
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [isAuthenticated])

  return (
    <WebSocketContext.Provider value={{ send }}>
      {children}
    </WebSocketContext.Provider>
  )
}