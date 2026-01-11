import React, { useState } from 'react'

function byHex(buf) {
  const view = new Uint8Array(buf)
  return Array.from(view).map(b => b.toString(16).padStart(2, '0')).join(' ')
}

export default function GattExplorer({ server, onRawData, onCharData }) {
  const [services, setServices] = useState([])
  const [selected, setSelected] = useState(null)
  const [chars, setChars] = useState([])
  const [charLog, setCharLog] = useState([])

  async function discoverServices() {
    if (!server) return
    const svcs = await server.getPrimaryServices()
    setServices(svcs)
  }

  async function selectService(s) {
    setSelected(s)
    const cs = await s.getCharacteristics()
    setChars(cs)
  }

  async function readChar(c) {
    const v = await c.readValue()
    const text = new TextDecoder().decode(v)
    setCharLog(l => [`read ${c.uuid}: ${text}`, ...l].slice(0, 200))
  }

  async function writeChar(c, txt) {
    const data = new TextEncoder().encode(txt)
    await c.writeValue(data)
    setCharLog(l => [`wrote ${txt} -> ${c.uuid}`, ...l].slice(0,200))
  }

  async function toggleNotify(c) {
    if (c.properties.notify) {
      await c.startNotifications()
      c.addEventListener('characteristicvaluechanged', (ev) => {
        const v = ev.target.value
        const arr = new Uint8Array(v.buffer)
        const asText = new TextDecoder().decode(v)
        setCharLog(l => [`notify ${c.uuid}: ${asText || byHex(v.buffer)}`, ...l].slice(0,200))
        onRawData && onRawData(arr)
        // expose UUID + raw bytes for mapping logic
        if (typeof onCharData === 'function') onCharData(c.uuid, arr)
      })
      setCharLog(l => [`started notifications ${c.uuid}`, ...l].slice(0,200))
    }
  }

  if (!server) return null

  return (
    <div className="gatt-explorer">
      <h2>GATT Explorer</h2>
      <div className="explorer-controls">
        <button onClick={discoverServices}>Discover Services</button>
      </div>

      <div className="services">
        {services.map(s => (
          <div key={s.uuid} className="service">
            <button onClick={() => selectService(s)}>{s.uuid}</button>
          </div>
        ))}
      </div>

      <div style={{marginTop:8,color:'#9aa7bd'}}>Selected service: {selected ? selected.uuid : '—'}</div>

      <div className="characteristics">
        {chars.map(c => (
          <div key={c.uuid} className="char">
            <div><strong>{c.uuid}</strong></div>
            <div>Properties: {Object.keys(c.properties).filter(k => c.properties[k]).join(', ')}</div>
            <div className="char-actions">
              <button onClick={() => readChar(c)}>Read</button>
              <button onClick={() => toggleNotify(c)}>Start Notify</button>
              <button onClick={() => writeChar(c, 'ping')}>Write ping</button>
            </div>
          </div>
        ))}
      </div>

      <details>
        <summary>Characteristic Log</summary>
        <div className="char-log">
          {charLog.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </details>
    </div>
  )
}
