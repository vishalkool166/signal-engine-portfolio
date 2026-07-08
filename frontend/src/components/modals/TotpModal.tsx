import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TotpModalProps {
  open: boolean
  title: string
  description: string
  onConfirm: (code: string) => Promise<void>
  onClose: () => void
  loading?: boolean
  destructive?: boolean
}

export default function TotpModal({
  open,
  title,
  description,
  onConfirm,
  onClose,
  loading = false,
  destructive = false,
}: TotpModalProps) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!open) {
      setCode(['', '', '', '', '', ''])
      setError(null)
    } else {
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }, [open])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    setError(null)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async () => {
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }
    try {
      setError(null)
      await onConfirm(fullCode)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid code'
      setError(message)
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-sm"
            >
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-md',
                      destructive ? 'bg-red-500/10' : 'bg-primary/10'
                    )}>
                      <ShieldCheck className={cn(
                        'h-4 w-4',
                        destructive ? 'text-red-500' : 'text-primary'
                      )} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{title}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="px-5 py-6">
                  <p className="mb-4 text-xs text-muted-foreground text-center">
                    Enter the 6-digit code from your authenticator app
                  </p>

                  <div className="flex items-center justify-center gap-2">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className={cn(
                          'h-11 w-10 rounded-md border text-center text-lg font-mono font-semibold',
                          'bg-background text-foreground outline-none',
                          'transition-colors focus:border-primary focus:ring-1 focus:ring-primary',
                          error ? 'border-destructive' : 'border-border',
                          digit && 'border-primary/50'
                        )}
                      />
                    ))}
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 text-center text-xs text-destructive"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-2 border-t border-border px-5 py-4">
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className={cn(
                      'flex-1 rounded-md border border-border px-4 py-2',
                      'text-sm font-medium text-foreground',
                      'hover:bg-accent transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || code.join('').length !== 6}
                    className={cn(
                      'flex-1 rounded-md px-4 py-2',
                      'text-sm font-medium',
                      'transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      destructive
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    )}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Verifying...
                      </span>
                    ) : (
                      'Confirm'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}