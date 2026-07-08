import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

const API_URL = import.meta.env.VITE_API_URL ?? ''

function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
      <motion.div
        animate={{
          background: [
            'radial-gradient(600px circle at 20% 30%, hsl(var(--signal-blue) / 0.06), transparent 70%)',
            'radial-gradient(600px circle at 80% 70%, hsl(var(--signal-purple) / 0.06), transparent 70%)',
            'radial-gradient(600px circle at 50% 50%, hsl(var(--signal-green) / 0.04), transparent 70%)',
            'radial-gradient(600px circle at 20% 30%, hsl(var(--signal-blue) / 0.06), transparent 70%)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0"
      />
    </div>
  )
}

function FloatingOrb({
  className,
  delay = 0,
}: {
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      animate={{
        y: [-10, 10, -10],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      className={cn(
        'absolute rounded-full blur-3xl pointer-events-none',
        className
      )}
    />
  )
}

export default function Login() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated])

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`
  }

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center bg-background overflow-hidden">
      <GridBackground />

      <FloatingOrb
        className="h-64 w-64 bg-blue-500/10 -top-20 -left-20"
        delay={0}
      />
      <FloatingOrb
        className="h-48 w-48 bg-purple-500/10 bottom-20 right-10"
        delay={2}
      />
      <FloatingOrb
        className="h-32 w-32 bg-emerald-500/8 top-1/3 right-1/4"
        delay={1}
      />

      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors z-10"
      >
        {theme === 'dark'
          ? <Sun className="h-4 w-4" />
          : <Moon className="h-4 w-4" />
        }
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 flex flex-col items-center gap-4"
        >
          <div className="relative">
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0px hsl(var(--primary) / 0)',
                  '0 0 20px hsl(var(--primary) / 0.3)',
                  '0 0 0px hsl(var(--primary) / 0)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-lg"
            >
              <TrendingUp className="h-7 w-7 text-foreground" />
            </motion.div>
          </div>

          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-foreground tracking-tight"
            >
              Signal Engine
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-1.5 text-sm text-muted-foreground"
            >
              Automated crypto futures intelligence
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-xl space-y-4"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Welcome back</p>
            <p className="text-xs text-muted-foreground">
              Sign in to access your dashboard
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleGoogleLogin}
            className={cn(
              'flex w-full items-center justify-center gap-3 rounded-lg border border-border',
              'bg-background px-4 py-3 text-sm font-medium text-foreground',
              'transition-all hover:bg-accent hover:border-border/80',
              'shadow-sm'
            )}
          >
            <GoogleIcon />
            Continue with Google
          </motion.button>

          <div className="rounded-lg bg-muted/50 px-3 py-2.5">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Access is restricted to authorized accounts.
              Contact admin if you need access.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center justify-center gap-4"
        >
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">System operational</span>
          </div>
          <span className="text-xs text-muted-foreground/30">·</span>
          <span className="text-xs text-muted-foreground">
            v{import.meta.env.VITE_APP_VERSION}
          </span>
        </motion.div>
      </motion.div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}