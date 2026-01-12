import React, { useEffect } from 'react'

export default function Toasts({ toasts = [], onRemove }) {
  useEffect(() => {
    const timers = toasts.map(t => {
      if (!t.duration || t.duration <= 0) return null
      return setTimeout(() => onRemove && onRemove(t.id), t.duration)
    })
    return () => timers.forEach(t => t && clearTimeout(t))
  }, [toasts, onRemove])

  return (
    <div className="toasts-root" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type || 'info'}`} role="status">
          <div className="toast-body">{t.msg}</div>
          <button className="toast-close" onClick={() => onRemove && onRemove(t.id)}>×</button>
        </div>
      ))}
    </div>
  )
}
