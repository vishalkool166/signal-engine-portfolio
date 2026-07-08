import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import QueryProvider from '@/providers/QueryProvider'
import WebSocketProvider from '@/providers/WebSocketProvider'
import AuthGuard from '@/components/layout/AuthGuard'
import Layout from '@/components/layout/Layout'
import Login from '@/pages/Login'
import Home from '@/pages/Home'
import Signals from '@/pages/Signals'
import Trades from '@/pages/Trades'
import Performance from '@/pages/Performance'
import Users from '@/pages/Users'
import Coins from '@/pages/Coins'
import System from '@/pages/System'
import Audit from '@/pages/Audit'
import Settings from '@/pages/Settings'
import Profile from '@/pages/Profile'
import Pricing from '@/pages/Pricing'

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryProvider>
        <BrowserRouter basename="/">
          <Toaster
            position="top-right"
            toastOptions={{
              classNames: {
                toast: 'bg-card border border-border text-foreground',
                title: 'text-foreground font-medium',
                description: 'text-muted-foreground',
                error: 'border-destructive/50',
                success: 'border-emerald-500/50',
                warning: 'border-amber-500/50',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <AuthGuard>
                  <WebSocketProvider>
                    <Layout />
                  </WebSocketProvider>
                </AuthGuard>
              }
            >
              <Route index element={<Home />} />
              <Route path="signals" element={<Signals />} />
              <Route path="trades" element={<Trades />} />
              <Route path="performance" element={<Performance />} />
              <Route path="users" element={<Users />} />
              <Route path="coins" element={<Coins />} />
              <Route path="system" element={<System />} />
              <Route path="audit" element={<Audit />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="pricing" element={<Pricing />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryProvider>
    </ThemeProvider>
  )
}