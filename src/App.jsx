import React, { useState } from 'react'
import './App.css'
import BleConnector from './components/BleConnector'
import GattExplorer from './components/GattExplorer'
import Dashboard from './components/Dashboard'
import Mapper from './components/Mapper'
import { parseTelemetry } from './lib/parser'

function App() {
  const [telemetry, setTelemetry] = useState({})
  const [server, setServer] = useState(null)
  const [device, setDevice] = useState(null)
  const [mappings, setMappings] = useState([])

  function handleDeviceConnected(d, s) {
    setDevice(d)
    setServer(s)
  }

  function handleRawData(bytes) {
    const parsed = parseTelemetry(bytes)
    // merge into telemetry state for display
    setTelemetry(prev => ({ ...prev, ...parsed }))
  }

  // called when a notification from a characteristic arrives, with uuid
  function handleCharData(uuid, bytes) {
    const candidates = mappings.filter(m => m.charUuid && uuid.toLowerCase().includes(m.charUuid.toLowerCase()))
    if (candidates.length === 0) {
      // nothing mapped: fallback to auto-parse and merge
      handleRawData(bytes)
      return
    }

    for (const m of candidates) {
      let parsed = {}
      const text = new TextDecoder().decode(bytes).trim()
      try {
        if (m.parseType === 'auto') parsed = parseTelemetry(bytes)
        else if (m.parseType === 'json') parsed = JSON.parse(text)
        else if (m.parseType === 'kv') {
          text.split(';').forEach(p => { const [k,v] = p.split(':'); if (k) parsed[k.trim()] = Number(v) || v.trim() })
        } else if (m.parseType === 'csv') {
          parsed = text.split(',').map(s => s.trim())
        } else if (m.parseType === 'number') parsed = { value: Number(text) }
        else if (m.parseType === 'hex') parsed = { rawHex: Array.from(new Uint8Array(bytes)).map(b => b.toString(16).padStart(2,'0')).join(' ') }
      } catch (e) {
        // fallback
        parsed = { raw: text }
      }

      // apply keyMap
      const out = {}
      const km = m.keyMap || {}
      for (const sourceKey of Object.keys(km)) {
        const targetKey = km[sourceKey]
        if (Array.isArray(parsed) && !isNaN(Number(sourceKey))) {
          const idx = Number(sourceKey)
          out[targetKey] = Number(parsed[idx]) || parsed[idx]
        } else if (parsed && Object.prototype.hasOwnProperty.call(parsed, sourceKey)) {
          out[targetKey] = parsed[sourceKey]
        }
      }

      // if keyMap empty, merge parsed directly
      const finalObj = Object.keys(km).length === 0 ? (Array.isArray(parsed) ? { rawArray: parsed } : parsed) : out
      setTelemetry(prev => ({ ...prev, ...finalObj }))
    }
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <div>
          <h1>EKD01 Master — Varstrom Display Companion</h1>
          <div style={{color:'#9aa7bd',fontSize:12}}>{device ? `Connected: ${device.name || device.id}` : 'Not connected'}</div>
        </div>


      </header>

      <main>
        <aside className="side">
          <BleConnector onDeviceConnected={handleDeviceConnected} onRawData={handleRawData} onCharData={handleCharData} />

          {server && <GattExplorer server={server} onRawData={handleRawData} onCharData={handleCharData} />}

          <Mapper mappings={mappings} onChange={setMappings} />

        </aside>

        <section className="content">
          <Dashboard telemetry={telemetry} />
        </section>
      </main>

      <footer>
        <small>Built for Varstrom EDK01 — Web Bluetooth (PWA) demo. Use Chrome/Edge on desktop or Android for Web Bluetooth support.</small>
      </footer>
    </div>
  )
}

export default App
