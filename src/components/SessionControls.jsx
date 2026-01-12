import React from 'react'

export default function SessionControls({ recording, onToggle, logs, telemetryHistory }) {
  function exportSession() {
    const payload = { startedAt: Date.now(), logs, telemetryHistory }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ekd_session_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{display:'flex',gap:8,alignItems:'center',marginTop:12}}>
      <button onClick={onToggle} style={{padding:'8px 12px',borderRadius:10,background:recording? '#d32f2f':'#4caf50',color:'#071020',border:'none',fontWeight:700}}>{recording ? 'Stop recording' : 'Start recording'}</button>
      <button onClick={exportSession} style={{padding:'8px 12px',borderRadius:10,background:'#2196f3',color:'#fff',border:'none'}}>Export session</button>
    </div>
  )
}
