import React from 'react'

export default function Sparkline({ data = [], color = '#4caf50', height = 40 }) {
  if (!data || data.length === 0) return <svg height={height} width="100%" />
  const w = Math.max(60, Math.min(240, data.length * 6))
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => `${(i/(data.length-1))*w},${height - ((v-min)/range) * (height-4) - 2}`).join(' ')
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
