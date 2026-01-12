import React from 'react'

function toCSV(logs) {
  const rows = [['timestamp','uuid','text','hex','mapping','parsed']]
  for (const l of logs) {
    rows.push([
      new Date(l.ts).toISOString(),
      l.uuid || '',
      (l.text||'').replace(/\n/g,' '),
      l.hex || '',
      l.mapping || '',
      JSON.stringify(l.parsed||{})
    ])
  }
  return rows.map(r => r.map(c => '"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n')
}

export default function LogViewer({ logs, onClear }) {
  function exportJSON() {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ekd_logs_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportCSV() {
    const csv = toCSV(logs)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ekd_logs_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{marginTop:12, background:'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', padding:12, borderRadius:10}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3 style={{margin:0}}>Notification Log <small style={{color:'#9aa7bd',fontSize:12}}>({logs.length})</small></h3>
        <div>
          <button onClick={exportJSON} style={{marginRight:8,padding:'6px 10px',borderRadius:8}}>Export JSON</button>
          <button onClick={exportCSV} style={{marginRight:8,padding:'6px 10px',borderRadius:8}}>Export CSV</button>
          <button onClick={onClear} style={{padding:'6px 10px',borderRadius:8}}>Clear</button>
        </div>
      </div>

      <div style={{maxHeight:240,overflow:'auto',marginTop:10,fontSize:13}}>
        {logs.length === 0 && <div style={{color:'#9aa7bd'}}>No captured notifications yet.</div>}
        {logs.map((l, i) => (
          <div key={i} style={{padding:8,borderBottom:'1px solid rgba(255,255,255,0.02)'}}>
            <div style={{fontSize:12,color:'#9aa7bd'}}>{new Date(l.ts).toLocaleString()} • {l.uuid || '—'}</div>
            <div style={{fontWeight:700}}>{l.text || l.hex || 'binary'}</div>
            <div style={{fontSize:12,color:'#9aa7bd'}}>{l.mapping ? `mapping: ${l.mapping}` : ''} {l.parsed ? JSON.stringify(l.parsed) : ''}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
