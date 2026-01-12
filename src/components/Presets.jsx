import React, { useEffect, useState } from 'react'

const STORAGE_KEY = 'ekd_presets_v1'

export default function Presets({ mappings = [], onApply }) {
  const [presets, setPresets] = useState([])
  const [name, setName] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      // update state after initial parsing to avoid sync setState in effect body
      window.requestAnimationFrame(() => setPresets(parsed))
    } catch {
      window.requestAnimationFrame(() => setPresets([]))
    }
  }, [])

  function savePresets(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    setPresets(list)
  }

  function saveCurrent() {
    if (!name) return alert('Enter a preset name')
    const p = { name, mappings: mappings || [], created: Date.now() }
    savePresets([p, ...presets])
    setName('')
  }

  function applyPreset(p) {
    if (onApply) onApply(p.mappings)
  }

  function deletePreset(i) {
    const next = presets.filter((_, idx) => idx !== i)
    savePresets(next)
  }

  function exportPreset(p) {
    const data = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(p, null, 2))}`
    const a = document.createElement('a')
    a.href = data
    a.download = `preset-${p.name.replace(/\s+/g,'_')}.json`
    a.click()
  }

  function importPreset(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result)
        if (obj && obj.mappings) {
          const next = [obj, ...presets]
          savePresets(next)
        } else {
          alert('Invalid preset file')
        }
      } catch {
        alert('Invalid JSON')
      }
    }
    reader.readAsText(f)
    e.target.value = ''
  }

  return (
    <div className="presets panel">
      <h3>Presets</h3>
      <div style={{display:'flex',gap:8,marginBottom:8}}>
        <input placeholder="Preset name" value={name} onChange={e => setName(e.target.value)} />
        <button onClick={saveCurrent}>Save current mappings</button>
        <label style={{display:'inline-block',padding:'6px 8px',background:'#0b1220',borderRadius:6,cursor:'pointer'}}>
          Import <input type="file" accept="application/json" style={{display:'none'}} onChange={importPreset} />
        </label>
      </div>

      <div style={{maxHeight:240,overflow:'auto'}}>
        {presets.length === 0 && <div style={{color:'#9aa7bd'}}>No presets saved</div>}
        {presets.map((p, i) => (
          <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 6px',borderBottom:'1px solid rgba(255,255,255,0.02)'}}>
            <div>
              <div style={{fontWeight:700}}>{p.name}</div>
              <div style={{fontSize:12,color:'#9aa7bd'}}>{new Date(p.created).toLocaleString()}</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={() => applyPreset(p)}>Apply</button>
              <button onClick={() => exportPreset(p)}>Export</button>
              <button onClick={() => deletePreset(i)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
