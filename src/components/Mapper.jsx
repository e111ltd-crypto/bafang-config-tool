import React, { useEffect, useState } from 'react'

const STORAGE_KEY = 'ekd_mappings_v1'

function loadMappings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function saveMappings(m) { localStorage.setItem(STORAGE_KEY, JSON.stringify(m)) }

export default function Mapper({ onChange }) {
  const [list, setList] = useState(loadMappings())
  const [form, setForm] = useState({ name:'EKD01 preset', charUuid:'', parseType:'auto', keyMap: '{}' })

  useEffect(() => { onChange && onChange(list) }, [list, onChange])

  function addMapping() {
    const parsedKeyMap = (() => {
      try { return JSON.parse(form.keyMap) } catch { return {} }
    })()
    const next = [...list, { id: Date.now(), ...form, keyMap: parsedKeyMap }]
    setList(next); saveMappings(next)
    setForm({ name:'', charUuid:'', parseType:'auto', keyMap: '{}' })
  }

  function remove(id) {
    const next = list.filter(l => l.id !== id)
    setList(next); saveMappings(next)
  }

  return (
    <div className="mapper" style={{marginTop:12, background:'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', padding:12, borderRadius:10}}>
      <h3>Characteristic Mappings</h3>
      <p style={{color:'#9aa7bd',fontSize:12}}>Create mappings from BLE notifications (characteristic UUID) to telemetry fields.</p>

      <div style={{display:'grid',gap:8}}>
        <input placeholder="Mapping name" value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} />
        <input placeholder="Characteristic UUID (or substring)" value={form.charUuid} onChange={e => setForm(f => ({...f, charUuid:e.target.value}))} />
        <select value={form.parseType} onChange={e => setForm(f => ({...f, parseType:e.target.value}))}>
          <option value="auto">Auto (best-effort)</option>
          <option value="json">JSON</option>
          <option value="kv">Key:Value pairs (semicolon delimited)</option>
          <option value="csv">CSV (index based)</option>
          <option value="number">Single number (plain text)</option>
          <option value="hex">Raw hex to field</option>
        </select>
        <textarea rows={3} placeholder='{ "SPD":"speed", "BAT":"battery" }' value={form.keyMap} onChange={e => setForm(f => ({...f, keyMap:e.target.value}))} />
        <div>
          <button onClick={addMapping} style={{padding:'6px 10px',borderRadius:8}}>Add mapping</button>
        </div>
      </div>

      <hr />
      <div>
        <h4 style={{marginTop:6}}>Saved mappings</h4>
        {list.length === 0 && <div style={{color:'#9aa7bd'}}>No mappings yet — connect your device, discover a notify characteristic UUID and add a mapping.</div>}
        {list.map(m => (
          <div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px',borderRadius:8,background:'rgba(0,0,0,0.05)',marginTop:8}}>
            <div>
              <div style={{fontWeight:700}}>{m.name}</div>
              <div style={{fontSize:12,color:'#9aa7bd'}}>UUID: {m.charUuid} | parse: {m.parseType}</div>
            </div>
            <div>
              <button onClick={() => remove(m.id)} style={{padding:'6px 8px',borderRadius:8}}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
