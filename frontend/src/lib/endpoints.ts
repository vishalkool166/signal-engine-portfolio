import api from './api'
import type {
  Summary,
  Performance,
  Signal,
  CoinConfig,
  CoinDetail,
  RadarItem,
  QueueItem,
  AdminUser,
  AdminStats,
  AuditEntry,
  SystemStats,
  FactorAnalysis,
  Trade,
  TradesSummary,
  TradesBalance,
  TradesProfit,
  CoinPerformance,
  DailyEntry,
  ModeStatus,
  UserSession,
} from '@/types'

export const authApi = {
  session: () =>
    api.get<{ authenticated: boolean; user?: { id: string; email: string; tier: string; is_admin: boolean } }>('/auth/session'),
  logout: () =>
    api.get('/auth/logout'),
}

export const dashboardApi = {
  full: () =>
    api.get('/api/dashboard'),
  summary: () =>
    api.get<Summary>('/api/dashboard/summary'),
  performance: () =>
    api.get<Performance>('/api/dashboard/performance'),
  signals: () =>
    api.get<{ radar: RadarItem[]; queue: QueueItem[]; timestamp: string }>('/api/dashboard/signals'),
  history: (limit = 20) =>
    api.get<Signal[]>(`/api/dashboard/history?limit=${limit}`),
  universe: () =>
    api.get<CoinConfig[]>('/api/dashboard/universe'),
  ticker: () =>
    api.get('/api/dashboard/ticker'),
  coinDetail: (coin: string) =>
    api.get<CoinDetail>(`/api/dashboard/coin/${coin}`),
}

export const signalsApi = {
  list: (params?: { limit?: number; grade?: string; coin?: string; outcome?: string }) =>
    api.get<Signal[]>('/api/signals', { params }),
  active: () =>
    api.get('/api/signals/active'),
  latest: () =>
    api.get('/api/signals/latest'),
  byId: (id: number) =>
    api.get(`/api/signal/${id}`),
  analyze: (coin: string) =>
    api.get(`/api/analyze/${coin}`),
  scan: () =>
    api.get('/api/scan'),
}

export const coinsApi = {
  list: () =>
    api.get<CoinConfig[]>('/api/coins'),
  add: (coin: string) =>
    api.post('/api/coins/add', { coin }),
  toggle: (coin: string, enabled: boolean) =>
    api.post('/api/coins/toggle', { coin, enabled }),
  remove: (coin: string) =>
    api.delete(`/api/coins/${coin}`),
  validate: (coin: string) =>
    api.get(`/api/coins/validate/${coin}`),
}

export const tradesApi = {
  summary: () =>
    api.get<TradesSummary>('/api/trades/summary'),
  open: () =>
    api.get<Trade[]>('/api/trades/open'),
  profit: () =>
    api.get<TradesProfit>('/api/trades/profit'),
  balance: () =>
    api.get<TradesBalance>('/api/trades/balance'),
  history: (limit = 20, offset = 0) =>
    api.get<{ trades: Trade[]; trades_count: number }>(`/api/trades/history?limit=${limit}&offset=${offset}`),
  daily: (days = 7) =>
    api.get<{ data: DailyEntry[] }>(`/api/trades/daily?days=${days}`),
  performance: () =>
    api.get<CoinPerformance[]>('/api/trades/performance'),
  ping: () =>
    api.get('/api/trades/ping'),
  wsStatus: () =>
    api.get('/api/trades/ws_status'),
  forceSell: (trade_id: number, totp_code: string) =>
    api.post('/api/trades/close', { trade_id, totp_code }),
}

export const adminApi = {
  overview: () =>
    api.get('/api/admin/overview'),
  stats: () =>
    api.get<AdminStats>('/api/admin/stats'),
  users: (params?: { limit?: number; offset?: number; tier?: string }) =>
    api.get<{ total: number; users: AdminUser[] }>('/api/admin/users', { params }),
  userById: (id: number) =>
    api.get<{ user: AdminUser; subscription: unknown; sessions: UserSession[] }>(`/api/admin/users/${id}`),
  updateTier: (id: number, tier: string) =>
    api.post(`/api/admin/users/${id}/tier`, { tier }),
  deactivate: (id: number) =>
    api.post(`/api/admin/users/${id}/deactivate`),
  reactivate: (id: number) =>
    api.post(`/api/admin/users/${id}/reactivate`),
  sessions: (params?: { user_id?: number; limit?: number }) =>
    api.get('/api/admin/sessions', { params }),
  revokeSession: (sessionId: string) =>
    api.post(`/api/admin/sessions/${sessionId}/revoke`),
  revokeAllSessions: (userId: number) =>
    api.post(`/api/admin/users/${userId}/sessions/revoke-all`),
  cleanupSessions: () =>
    api.post('/api/admin/sessions/cleanup'),
  audit: (params?: { limit?: number; offset?: number }) =>
    api.get<{ total: number; logs: AuditEntry[] }>('/api/admin/audit', { params }),
  system: () =>
    api.get<SystemStats>('/api/admin/system'),
  pricing: () =>
    api.get('/api/admin/pricing'),
}

export const systemApi = {
  health: () =>
    api.get('/api/health'),
  disk: () =>
    api.get('/api/system/disk'),
  dockerPurge: (totp_code: string) =>
    api.post('/api/system/docker-purge', { totp_code }),
  modeStatus: () =>
    api.get<ModeStatus>('/api/mode/status'),
  modeToggle: (mode: string, totp_code: string) =>
    api.post('/api/mode/toggle', { mode, totp_code }),
  syncOutcomes: () =>
    api.post('/api/sync/outcomes'),
  auditLog: (limit = 50) =>
    api.get<AuditEntry[]>(`/api/audit/log?limit=${limit}`),
}

export const performanceApi = {
  stats: () =>
    api.get('/api/stats'),
  backtest: (coin: string) =>
    api.get(`/api/backtest/${coin}`),
  backtestHistory: () =>
    api.get('/api/backtest/history/all'),
  factorAnalysis: () =>
    api.get<FactorAnalysis>('/api/analysis/factors'),
}

export const marketApi = {
  fearGreed: () =>
    api.get('/api/fear-greed'),
  macroEvents: () =>
    api.get('/api/macro-events'),
}

export const meApi = {
  get: () =>
    api.get('/api/me'),
  createApiKey: (name: string) =>
    api.post('/api/me/api-keys', { name }),
  deleteApiKey: (id: number) =>
    api.delete(`/api/me/api-keys/${id}`),
  sessions: () =>
    api.get<{ sessions: UserSession[] }>('/api/me/sessions'),
  revokeSession: (sessionId: string) =>
    api.post(`/api/me/sessions/${sessionId}/revoke`),
  revokeAllSessions: () =>
    api.post('/api/me/sessions/revoke-all'),
}

export const pricingApi = {
  get: () =>
    api.get('/api/pricing'),
}