import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Server,
  Cpu,
  HardDrive,
  MemoryStick,
  RefreshCw,
  AlertTriangle,
  Container,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react'
import { systemApi } from '@/lib/endpoints'
import TotpModal from '@/components/modals/TotpModal'
import StatusBadge from '@/components/ui/StatusBadge'
import SpotlightCard from '@/components/ui/SpotlightCard'
import { PageSkeleton } from '@/components/ui/LoadingSkeleton'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function System() {
  const queryClient                         = useQueryClient()
  const [purgeTotpOpen, setPurgeTotpOpen]   = useState(false)
  const [modeTotpOpen, setModeTotpOpen]     = useState(false)
  const [pendingMode, setPendingMode]       = useState<'live' | 'paper' | null>(null)

  const { data: health, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: () => systemApi.health().then((r) => r.data),
    refetchInterval: 15000,
  })

  const { data: modeStatus } = useQuery({
    queryKey: ['mode-status'],
    queryFn: () => systemApi.modeStatus().then((r) => r.data),
    refetchInterval: 30000,
  })

  const purgeMutation = useMutation({
    mutationFn: (totp_code: string) => systemApi.dockerPurge(totp_code),
    onSuccess: (data) => {
      toast.success(`Docker purge complete — freed ${data.data.freed_mb}MB`)
      queryClient.invalidateQueries({ queryKey: ['health'] })
      setPurgeTotpOpen(false)
    },
    onError: () => {
      throw new Error('Invalid TOTP code')
    },
  })

  const modeMutation = useMutation({
    mutationFn: ({ mode, totp_code }: { mode: string; totp_code: string }) =>
      systemApi.modeToggle(mode, totp_code),
    onSuccess: (_, { mode }) => {
      toast.success(`Switched to ${mode} mode`)
      queryClient.invalidateQueries({ queryKey: ['mode-status'] })
      queryClient.invalidateQueries({ queryKey: ['health'] })
      setModeTotpOpen(false)
      setPendingMode(null)
    },
    onError: () => {
      throw new Error('Invalid TOTP code or open trades exist')
    },
  })

  if (isLoading) return <PageSkeleton />

  const system  = health?.system
  const isLive  = modeStatus?.mode === 'live'

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">System</h1>
          <p className="text-sm text-muted-foreground">
            Infrastructure monitor and controls
          </p>
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['health'] })}
          className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {system && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <ResourceCard
            icon={Cpu}
            label="CPU Usage"
            value={system.cpu_pct}
            unit="%"
            warn={system.cpu_pct > 80}
            critical={system.cpu_pct > 95}
          />
          <ResourceCard
            icon={MemoryStick}
            label="RAM Usage"
            value={system.ram_pct}
            unit="%"
            warn={system.ram_pct > 85}
            critical={system.ram_pct > 95}
            detail={`${system.ram_used_mb}MB / ${system.ram_total_mb}MB`}
          />
          <ResourceCard
            icon={HardDrive}
            label="Disk Usage"
            value={system.disk_pct}
            unit="%"
            warn={system.disk_pct > 80}
            critical={system.disk_pct > 90}
            detail={`${system.disk_used_gb}GB / ${system.disk_total_gb}GB`}
          />
          <SpotlightCard
            spotlightColor="blue"
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Server className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Uptime</p>
            </div>
            <p className="text-2xl font-semibold font-mono text-foreground">
              {system.uptime_str}
            </p>
          </SpotlightCard>
        </div>
      )}

      {system?.containers && system.containers.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3 flex items-center gap-2">
            <Container className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Docker Containers ({system.containers.length})
            </p>
          </div>
          <div className="divide-y divide-border">
            {system.containers.map((container, i) => (
              <motion.div
                key={container.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <StatusBadge status={container.status} />
                  <span className="text-sm font-mono font-medium text-foreground">
                    {container.name}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="h-3 w-3" />
                    <span className="font-mono">{container.cpu_pct}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MemoryStick className="h-3 w-3" />
                    <span className="font-mono">{container.mem_mb}MB</span>
                    <span className="text-muted-foreground/50">({container.mem_pct}%)</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-medium text-foreground">Services</p>
        </div>
        <div className="divide-y divide-border">
          <ServiceRow
            label="Signal Engine"
            description="FastAPI backend"
            ok={health?.status === 'ok'}
          />
          <ServiceRow
            label="Redis"
            description="Cache and pub/sub"
            ok={health?.redis_connected}
          />
          <ServiceRow
            label="ML Model"
            description={health?.ml_status?.message ?? 'LightGBM classifier'}
            ok={health?.ml_status?.ml_enabled}
            neutral={!health?.ml_status?.ml_enabled}
            neutralLabel="Collecting data"
          />
        </div>
      </div>

      <SpotlightCard
        spotlightColor={isLive ? 'red' : 'blue'}
        className="rounded-lg border border-border bg-card"
      >
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-medium text-foreground">Trading Mode</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Current Mode
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isLive
                  ? 'Live trading — real funds at risk'
                  : 'Paper trading — simulated with fake money'
                }
              </p>
            </div>
            <StatusBadge status={modeStatus?.mode ?? 'paper'} />
          </div>

          {modeStatus && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Active grades:</span>
              <span className="font-mono font-medium text-foreground">
                {modeStatus.grades.join(', ')}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setPendingMode('paper')
                setModeTotpOpen(true)
              }}
              disabled={!isLive}
              className={cn(
                'flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors',
                !isLive
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-500 cursor-default'
                  : 'border-border bg-background text-foreground hover:bg-accent'
              )}
            >
              {!isLive && <ToggleRight className="h-4 w-4" />}
              Paper Mode
            </button>
            <button
              onClick={() => {
                setPendingMode('live')
                setModeTotpOpen(true)
              }}
              disabled={isLive}
              className={cn(
                'flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors',
                isLive
                  ? 'border-red-500/30 bg-red-500/10 text-red-500 cursor-default'
                  : 'border-border bg-background text-foreground hover:bg-accent'
              )}
            >
              {isLive && <ToggleRight className="h-4 w-4" />}
              Live Mode
            </button>
          </div>

          {!isLive && (
            <div className="rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2.5">
              <p className="text-xs text-amber-500">
                Switching to Live mode requires TOTP confirmation and no open trades.
                Real funds will be used.
              </p>
            </div>
          )}
        </div>
      </SpotlightCard>

      <SpotlightCard
        spotlightColor="red"
        className="rounded-lg border border-destructive/20 bg-card"
      >
        <div className="border-b border-destructive/20 px-4 py-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <p className="text-sm font-medium text-foreground">Danger Zone</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Docker System Purge
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Remove unused images, containers, volumes and networks.
                Frees disk space.
              </p>
            </div>
            <button
              onClick={() => setPurgeTotpOpen(true)}
              className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Purge
            </button>
          </div>
        </div>
      </SpotlightCard>

      <TotpModal
        open={purgeTotpOpen}
        title="Confirm Docker Purge"
        description="This will remove all unused Docker resources"
        destructive
        loading={purgeMutation.isPending}
        onClose={() => setPurgeTotpOpen(false)}
        onConfirm={async (code) => {
          await purgeMutation.mutateAsync(code)
        }}
      />

      <TotpModal
        open={modeTotpOpen}
        title={`Switch to ${pendingMode === 'live' ? 'Live' : 'Paper'} Mode`}
        description={
          pendingMode === 'live'
            ? 'Real funds will be used. Ensure no open trades.'
            : 'Switch back to paper trading mode'
        }
        destructive={pendingMode === 'live'}
        loading={modeMutation.isPending}
        onClose={() => {
          setModeTotpOpen(false)
          setPendingMode(null)
        }}
        onConfirm={async (code) => {
          if (!pendingMode) return
          await modeMutation.mutateAsync({ mode: pendingMode, totp_code: code })
        }}
      />
    </div>
  )
}

function ResourceCard({
  icon: Icon,
  label,
  value,
  unit,
  warn,
  critical,
  detail,
}: {
  icon: React.ElementType
  label: string
  value: number
  unit: string
  warn?: boolean
  critical?: boolean
  detail?: string
}) {
  const color = critical
    ? 'text-red-500'
    : warn
    ? 'text-amber-500'
    : 'text-foreground'

  const barColor = critical
    ? 'bg-red-500'
    : warn
    ? 'bg-amber-500'
    : 'bg-emerald-500'

  const spotlightColor = critical
    ? 'red'
    : warn
    ? 'amber'
    : 'green'

  return (
    <SpotlightCard
      spotlightColor={spotlightColor as 'red' | 'amber' | 'green'}
      className="rounded-lg border border-border bg-card p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className={cn('text-2xl font-semibold font-mono', color)}>
        {value}{unit}
      </p>
      {detail && (
        <p className="text-xs text-muted-foreground mt-0.5 font-mono">{detail}</p>
      )}
      <div className="mt-3 h-1 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={cn('h-full rounded-full', barColor)}
        />
      </div>
    </SpotlightCard>
  )
}

function ServiceRow({
  label,
  description,
  ok,
  neutral = false,
  neutralLabel = 'Inactive',
}: {
  label: string
  description: string
  ok: boolean | undefined
  neutral?: boolean
  neutralLabel?: string
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={cn(
          'h-1.5 w-1.5 rounded-full',
          neutral ? 'bg-amber-500' : ok ? 'bg-emerald-500' : 'bg-red-500'
        )} />
        <span className={cn(
          'text-xs font-medium',
          neutral ? 'text-amber-500' : ok ? 'text-emerald-500' : 'text-red-500'
        )}>
          {neutral ? neutralLabel : ok ? 'Operational' : 'Down'}
        </span>
      </div>
    </div>
  )
}