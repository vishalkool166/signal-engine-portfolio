export interface User {
  id: number
  email: string
  name: string | null
  avatar: string | null
  provider: string
  tier: Tier
  is_admin: boolean
  is_active: boolean
  onboarded: boolean
  created_at: string | null
  last_seen: string | null
  last_login: string | null
}

export type Tier = 'free' | 'pro' | 'elite' | 'admin'

export type Grade = 'A+' | 'A' | 'B' | 'C' | 'F'

export type Direction = 'LONG' | 'SHORT' | 'WATCH' | 'NO TRADE'

export type TradeOutcome = 'win' | 'loss' | 'pending' | 'timeout' | 'cancelled' | 'expired'

export type HealthState = 'HEALTHY' | 'WARNING' | 'INVALIDATED'

export type TradingMode = 'live' | 'paper'

export type CloseReason = 'sl_hit' | 'tp_hit' | 'manual_close' | 'exchange_closed' | 'liquidated' | 'sl_placement_failed'

export interface AuthUser {
  sub: string
  email: string
  tier: Tier
  is_admin: boolean
  session_id?: string
  type: string
}

export interface Signal {
  id: number
  timestamp: string | null
  coin: string
  direction: Direction
  grade: Grade
  score: number
  signal_type: string
  entry: number | null
  sl: number | null
  tp1: number | null
  risk_amt: number | null
  regime: string | null
  session: string | null
  outcome: TradeOutcome
  exit_price: number | null
  pnl: number | null
  market_score: number | null
  entry_score: number | null
  btc_score: number | null
}

export interface RadarItem {
  coin: string
  grade: Grade
  direction: Direction
  score: number
  price: number
  change: number
  funding: number
  tradeable: boolean
  regime: string
  session: string
  confidence: string | null
  ml_probability: number | null
  actual_rr: number | null
  timestamp: number | null
}

export interface QueueItem {
  coin: string
  grade: Grade
  direction: Direction
  score: number
  entry: number | null
  sl: number | null
  tp1: number | null
  sl_pct: number | null
  risk_amt: number | null
  stake: number | null
  leverage: number | null
  regime: string
  session: string
  thesis: string | null
  confidence_label: string | null
  ml_probability: number | null
  actual_rr: number | null
}

export interface Factor {
  key: string
  label: string
  earned: number
  max: number
  pct: number
}

export interface CoinDetail {
  coin: string
  grade: Grade
  score: number
  direction: Direction
  regime: string
  session: string
  ml_probability: number | null
  actual_rr: number
  market: {
    price: number
    change: number
    change_pos: boolean
    funding: number
    oi_change: number
    long_ratio: number
    short_ratio: number
  }
  signal: {
    entry: number | null
    sl: number | null
    tp1: number | null
    sl_pct: number | null
    risk_amt: number | null
    leverage: number | null
    stake: number | null
  }
  thesis: string | null
  confidence: string | null
  factors: Factor[]
  norm_score: number
  market_score: number
  entry_score: number
  btc_score: number
}

export interface Trade {
  trade_id:           number
  coin:               string
  pair:               string
  direction:          string
  grade:              string
  is_short:           boolean
  entry_price:        number
  actual_fill_entry:  number | null
  current_price:      number
  exit_price:         number | null
  actual_fill_exit:   number | null
  sl_price:           number | null
  tp1_price:          number | null
  sl_signal:          number | null
  tp1:                number | null
  position_size:      number
  margin_used:        number
  leverage:           number
  profit_abs:         number
  profit_ratio:       number
  net_pnl_live:       number
  pnl:                number | null
  realized_pnl:       number | null
  entry_commission:   number | null
  exit_commission:    number | null
  total_commission:   number | null
  entry_role:         string | null
  exit_role:          string | null
  funding_fees_paid:  number | null
  slippage_entry_pct: number | null
  slippage_exit_pct:  number | null
  liquidation:        number
  duration:           string
  opened_at:          string
  closed_at:          string | null
  outcome:            TradeOutcome
  close_reason:       CloseReason | null
  tp1_hit:            boolean
  is_open:            boolean
  health:             TradeHealth | null
  regime_at_entry:    string
  session_at_entry:   string
  score_at_entry:     number
}

export interface TradeHealth {
  state:          HealthState
  failures:       string[]
  warnings:       string[]
  checks:         string[]
  move_pct:       number
  adverse_atr:    number
  is_healthy:     boolean
  is_warning:     boolean
  is_invalidated: boolean
  checked_at:     string
}

export interface TradesSummary {
  status:    Trade[]
  profit:    TradesProfit
  balance:   TradesBalance
  daily:     { data: DailyEntry[] }
  bot_state: string
}

export interface TradesBalance {
  total:      number
  free:       number
  used:       number
  unrealized: number
  currencies: Array<{
    currency: string
    free:     number
    used:     number
    total:    number
  }>
}

export interface TradesProfit {
  profit_all_coin:         number
  profit_all_percent:      number
  profit_closed_coin:      number
  winrate:                 number
  trade_count:             number
  wins:                    number
  losses:                  number
  total_commission:        number
  total_funding_fees:      number
  best_pair:               string
  best_pair_profit_ratio:  number
  worst_pair:              string
  worst_pair_profit_ratio: number
}

export interface DailyEntry {
  date:        string
  profit_abs:  number
  profit_ratio:number
  trade_count: number
  wins:        number
  losses:      number
  commission:  number
  funding:     number
}

export interface CoinPerformance {
  pair:         string
  coin:         string
  wins:         number
  losses:       number
  profit_abs:   number
  profit_ratio: number
  win_rate:     number
  commission:   number
  funding:      number
}

export interface FtTrade {
  trade_id:     number
  pair:         string
  is_short:     boolean
  open_rate:    number
  current_rate: number
  profit_abs:   number
  profit_ratio: number
  stake_amount: number
  open_date:    string
  enter_tag:    string | null
  tp1:          number | null
  sl_signal:    number | null
  health:       TradeHealth | null
}

export interface FtBalance {
  total:      number
  currencies: Array<{
    currency: string
    free:     number
    used:     number
    total:    number
  }>
}

export interface FtProfit {
  profit_all_coin:         number
  winrate:                 number
  trade_count:             number
  best_pair_profit_ratio:  number
  worst_pair_profit_ratio: number
}

export interface Summary {
  today_pnl:       number | null
  today_pnl_pos:   boolean
  today_trades:    number | null
  win_rate:        number | null
  coins_count:     number
  tradeable_count: number | null
  mode:            TradingMode
  grades:          string[]
  next_scan_epoch: number
  total_signals:   number
  closed_signals:  number
  pending_signals: number
  wins:            number | null
  losses:          number | null
  total_pnl:       number | null
  timestamp:       string
}

export interface Performance {
  win_rate:        number
  total_pnl:       number
  total_pnl_pos:   boolean
  wins:            number
  losses:          number
  closed:          number
  profit_factor:   number
  gross_profit:    number
  gross_loss:      number
  best_trade:      number
  best_trade_coin: string
  max_drawdown:    number
  peak_equity:     number
  equity_curve:    Array<{
    date:   string
    pnl:    number
    equity: number
  }>
  aplus: GradeStats
  a:     GradeStats
  b:     GradeStats
}

export interface GradeStats {
  win_rate: number
  wins:     number
  total:    number
  pnl:      number
}

export interface CoinConfig {
  coin:       string
  enabled:    boolean
  tier:       number
  source:     string
  volume_24h: number | null
  added_at:   string | null
  grade:      string
  score:      number
  direction:  string
  has_signal: boolean
  price:      number
  change:     number
  funding:    number
}

export interface AdminUser extends User {
  subscription?: {
    tier:                 Tier
    status:               string
    current_period_end:   string | null
    cancel_at_period_end: boolean
  } | null
  sessions?: UserSession[]
}

export interface UserSession {
  id:          number
  session_id:  string
  device:      string | null
  browser:     string | null
  ip:          string | null
  created_at:  string | null
  last_active: string | null
  expires_at:  string | null
}

export interface AuditEntry {
  id:        number
  timestamp: string | null
  action:    string
  source:    string
  detail:    string | null
  ip:        string | null
  success:   boolean
}

export interface SystemStats {
  ram_used_mb:   number
  ram_total_mb:  number
  ram_pct:       number
  ram_available: number
  cpu_pct:       number
  disk_used_gb:  number
  disk_total_gb: number
  disk_pct:      number
  uptime_secs:   number
  uptime_str:    string
  containers:    Container[]
}

export interface Container {
  name:    string
  status:  string
  mem_mb:  number
  mem_pct: number
  cpu_pct: number
}

export interface AdminStats {
  users: {
    total:     number
    active:    number
    new_today: number
    by_tier:   Record<Tier, number>
  }
  signups_week:    number
  signups_month:   number
  active_subs:     number
  mrr_estimate:    number
  pro_count:       number
  elite_count:     number
  active_sessions: number
  timestamp:       string
}

export interface FactorAnalysis {
  total:        number
  wins:         number
  losses:       number
  overall_wr:   number
  reliable:     boolean
  reliability:  string
  table:        FactorRow[]
  grade_stats:  GradeStatRow[]
  top_factors:  FactorRow[]
  weak_factors: FactorRow[]
}

export interface FactorRow {
  factor:           string
  present_total:    number
  absent_total:     number
  win_rate_present: number | null
  win_rate_absent:  number | null
  edge:             number | null
  observation:      string
}

export interface GradeStatRow {
  grade:    string
  total:    number
  wins:     number
  losses:   number
  win_rate: number
}

export interface TierFeatures {
  signal_delay_minutes: number
  signals_per_day:      number
  show_levels:          boolean
  show_factors:         boolean
  show_thesis:          boolean
  show_ml:              boolean
  show_positions:       boolean
  show_performance:     boolean
  show_full_history:    boolean
  show_universe:        boolean
  show_system:          boolean
  api_key_access:       boolean
  backtest_access:      boolean
  coins_limit:          number
}

export interface ApiKey {
  id:         number
  prefix:     string
  name:       string
  last_used:  string | null
  created_at: string | null
}

export interface WsPayload {
  type:        string
  tier?:       string
  summary?:    Summary
  signals?: {
    radar:     RadarItem[]
    queue:     QueueItem[]
    timestamp: string
  }
  history?:     Signal[]
  universe?:    CoinConfig[]
  performance?: Performance
  ticker?:      TickerItem[]
  open_trades?: Trade[]
  mark_prices?: Record<string, number>
  timestamp?:   string
}

export interface TickerItem {
  coin:   string
  price:  number
  change: number
}

export interface ModeStatus {
  mode:         TradingMode
  paper:        boolean
  grades:       string[]
  b_grade_live: boolean
}