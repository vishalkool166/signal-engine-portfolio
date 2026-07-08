import { useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/lib/api'

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, setUser, setLoading, isLoading } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const verify = async () => {
      setLoading(true)
      try {
        const res = await authApi.get('/auth/session')
        if (res.data.authenticated && res.data.user) {
          setUser({
            sub:      res.data.user.id,
            email:    res.data.user.email,
            tier:     res.data.user.tier as never,
            is_admin: res.data.user.is_admin,
            type:     'oauth',
          })
        } else {
          setUser(null)
          navigate('/login', { replace: true })
        }
      } catch {
        setUser(null)
        navigate('/login', { replace: true })
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
          <p className="text-sm text-muted-foreground">Verifying session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return <>{children}</>
}