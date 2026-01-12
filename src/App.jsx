import React, { useState } from 'react'
import LogViewer from './components/LogViewer'
import './App.css'
import BleConnector from './components/BleConnector'
import GattExplorer from './components/GattExplorer'
import Dashboard from './components/Dashboard'
import Mapper from './components/Mapper'
import { parseTelemetry } from './lib/parser'
import Toasts from './components/Toasts'
import Onboarding from './components/Onboarding'
import Presets from './components/Presets'
function App() {
  const [telemetry, setTelemetry] = useState({})
  const [server, setServer] = useState(null)
  const [device, setDevice] = useState(null)
  const [mappings, setMappings] = useState([])
  const [bleStatus, setBleStatus] = useState('idle')
  const [bleRssi, setBleRssi] = useState(null)

  function handleDeviceConnected(d, s) {
    setDevice(d)
    setServer(s)
    pushLog({ type: 'bt', level: 'info', msg: `Connected to ${d.name || d.id}` })
  }

  function handleBleStatus(status, info = {}) {
    setBleStatus(status)
    if (info && typeof info.rssi !== 'undefined') setBleRssi(info.rssi)
    pushLog({ type: 'bt', level: 'info', msg: `BLE status: ${status}${info.rssi ? ` (RSSI ${info.rssi})` : ''}` })
  }

  function handleBleError(err) {
    pushLog({ type: 'bt', level: 'error', msg: String(err) })
  }

  function handleRawData(bytes) {
    const parsed = parseTelemetry(bytes)
    // merge into telemetry state for display
    setTelemetry(prev => ({ ...prev, ...parsed }))
  }

  // called when a notification from a characteristic arrives, with uuid
  const [logs, setLogs] = React.useState([])
  const [recording, _setRecording] = React.useState(false)
  const [_telemetryHistory, setTelemetryHistory] = React.useState({ speed:[], battery:[], assist:[], cadence:[] })

  function pushLog(entry) {
    const e = { ts: Date.now(), ...entry }
    setLogs(l => [e, ...l].slice(0, 200))
  }

  function clearLogs() { setLogs([]) }

  function pushTelemetrySample(obj) {
    setTelemetryHistory(h => ({
      speed: [...(h.speed||[]), Number(obj.speed||obj.SPD||obj.value||0)].slice(-120),
      battery: [...(h.battery||[]), Number(obj.battery||obj.BAT||obj.battery_level||0)].slice(-120),
      assist: [...(h.assist||[]), Number(obj.assist||obj.ASS||0)].slice(-120),
      cadence: [...(h.cadence||[]), Number(obj.cadence||obj.CAD||0)].slice(-120),
    }))
    if (recording) {
      // store logs are already captured; optionally persist other session data
    }
  }

  function handleCharData(uuid, bytes) {
    const text = new TextDecoder().decode(bytes).trim()
    const hex = Array.from(new Uint8Array(bytes)).map(b => b.toString(16).padStart(2,'0')).join(' ')

    // log first (mapping may transform)
    pushLog({ ts: Date.now(), uuid, text: text || undefined, hex, parsed: null, mapping: null })

    const candidates = mappings.filter(m => m.charUuid && uuid.toLowerCase().includes(m.charUuid.toLowerCase()))
    if (candidates.length === 0) {
      // nothing mapped: fallback to auto-parse and merge
      const parsed = parseTelemetry(bytes)
      // update last log with parsed
      pushLog({ ts: Date.now(), uuid, text, hex, parsed, mapping: null })
      setTelemetry(prev => ({ ...prev, ...parsed }))
      return
    }

    for (const m of candidates) {
      let parsed = {}
      try {
        if (m.parseType === 'auto') parsed = parseTelemetry(bytes)
        else if (m.parseType === 'json') parsed = JSON.parse(text)
        else if (m.parseType === 'kv') {
          text.split(';').forEach(p => { const [k,v] = p.split(':'); if (k) parsed[k.trim()] = Number(v) || v.trim() })
        } else if (m.parseType === 'csv') {
          parsed = text.split(',').map(s => s.trim())
        } else if (m.parseType === 'number') parsed = { value: Number(text) }
        else if (m.parseType === 'hex') parsed = { rawHex: hex }
      } catch {
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

      const finalObj = Object.keys(km).length === 0 ? (Array.isArray(parsed) ? { rawArray: parsed } : parsed) : out

      // write merged telemetry and push a mapping log
      setTelemetry(prev => ({ ...prev, ...finalObj }))
      pushLog({ ts: Date.now(), uuid, text, hex, parsed: finalObj, mapping: m.name || m.charUuid })
      pushTelemetrySample(finalObj)
    }
  }

  const [toasts, setToasts] = React.useState([])
  const [onboardingOpen, setOnboardingOpen] = React.useState(false)

  function addToast({ msg, type = 'info', duration = 4000 }) {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts(t => [...t, { id, msg, type, duration }])
    return id
  }

  function removeToast(id) {
    setToasts(t => t.filter(x => x.id !== id))
  }

  // small helper: notify user on BLE events
  React.useEffect(() => {
    if (bleStatus === 'connected') addToast({ msg: 'Bluetooth connected', type: 'success' })
    else if (bleStatus === 'disconnected') addToast({ msg: 'Bluetooth disconnected', type: 'warning' })
    else if (bleStatus === 'error') addToast({ msg: 'Bluetooth error', type: 'error' })
  }, [bleStatus])

  return (
    <div className="app-root">
      <header className="app-header">
        <div>
          <h1>EKD01 Master — Varstrom Display Companion</h1>
          <div style={{color:'#9aa7bd',fontSize:12}}>
            {device ? `Connected: ${device.name || device.id}` : 'Not connected'}
            <span style={{marginLeft:12}}>| Status: {bleStatus}</span>
            <span style={{marginLeft:12}}>| RSSI: {bleRssi !== null ? `${bleRssi} dBm` : '—'}</span>
          </div>
        </div>

        <div className="header-actions">
          <button onClick={() => setOnboardingOpen(true)}>Help</button>
        </div>
      </header>

      <main>
        <aside className="side">
          <BleConnector onDeviceConnected={handleDeviceConnected} onRawData={handleRawData} onCharData={handleCharData} onStatus={handleBleStatus} onError={handleBleError} />

          {server && <GattExplorer server={server} onRawData={handleRawData} onCharData={handleCharData} />}

          <Mapper mappings={mappings} onChange={setMappings} />

          <Presets mappings={mappings} onApply={setMappings} />

        </aside>

        <section className="content">
          <Dashboard telemetry={telemetry} />

          <LogViewer logs={logs} onClear={clearLogs} />
        </section>
      </main>

      <Toasts toasts={toasts} onRemove={removeToast} />
      <Onboarding open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />

      <footer>
        <small>Built for Varstrom EDK01 — Web Bluetooth (PWA) demo. Use Chrome/Edge on desktop or Android for Web Bluetooth support.</small>
      </footer>
    </div>
  )
}

export default App
