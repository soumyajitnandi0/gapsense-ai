import { useState, useCallback } from 'react'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { id, title, description, variant }
    
    setToasts((prev) => [...prev, newToast])
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
    
    // Also log to console for debugging
    if (variant === 'destructive') {
      console.error(`[Toast] ${title}: ${description}`)
    } else {
      console.log(`[Toast] ${title}: ${description}`)
    }
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toast, toasts, dismiss }
}
