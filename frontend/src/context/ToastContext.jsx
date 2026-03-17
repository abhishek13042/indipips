import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4 md:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

const ToastItem = ({ toast, onRemove }) => {
  const { id, message, type } = toast

  const variants = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  }

  const getStylesAndIcon = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={18} className="text-green-400" />,
          bd: 'border-green-400/30 text-green-400 bg-green-400/10'
        }
      case 'error':
        return {
          icon: <XCircle size={18} className="text-red-400" />,
          bd: 'border-red-500/30 text-red-500 bg-red-500/10'
        }
      case 'warning':
        return {
          icon: <AlertCircle size={18} className="text-yellow-400" />,
          bd: 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10'
        }
      default:
        return {
          icon: <Info size={18} className="text-blue-400" />,
          bd: 'border-blue-500/30 text-blue-400 bg-blue-500/10'
        }
    }
  }

  const { icon, bd } = getStylesAndIcon()

  return (
    <motion.div
      layout
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`relative overflow-hidden pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border bg-black shadow-2xl backdrop-blur-md ${bd.replace('bg-', 'placeholder')}`} // We keep background black but border colored
    >
      <div className={`absolute inset-0 opacity-10 ${bd.split(' ').find(c => c.startsWith('bg-'))}`}></div>
      <div className="relative z-10 shrink-0 mt-0.5">{icon}</div>
      <div className="relative z-10 flex-1">
        <p className="text-sm font-bold text-white leading-tight">{message}</p>
      </div>
      <button 
        onClick={onRemove}
        className="relative z-10 shrink-0 text-gray-500 hover:text-white transition-colors"
      >
         <X size={16} />
      </button>
    </motion.div>
  )
}
