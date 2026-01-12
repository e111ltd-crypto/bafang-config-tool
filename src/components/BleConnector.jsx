import React, { useState, useEffect, useRef } from 'react'

export default function BleConnector({ onDeviceConnected, onRawData, onCharData, onStatus, onError }) {
  const [device, setDevice] = useState(null)
  const [services, setServices] = useState([])
  const [log, setLog] = useState([])
  const [status, setStatus] = useState('idle')
  const [rssi, setRssi] = useState(null)
  const [autoReconnect, setAutoReconnect] = useState(true)
  const reconnectAttempts = useRef(0)
  const reconnectTimer = useRef(null)

  useEffect(() => {
    onStatus && onStatus(status, { rssi })
  }, [status, rssi, onStatus])

  function addLog(s) {
    setLog(l => [s, ...l].slice(0, 50))
  }

  async function requestDevice() {
    try {
      addLog('Requesting device...')
      setStatus('requesting')
      const d = await navigator.bluetooth.requestDevice({
        // prefer devices that look like the Varstrom advertisement name
        filters: [{ namePrefix: 'Varstrom' }],
        optionalServices: ['battery_service']
      })
      setDevice(d)
      addLog(`Selected: ${d.name || d.id}`)
      d.addEventListener('gattserverdisconnected', onDisconnected)

      // if we can, start listening for advertisement events to get RSSI
      if (d.watchAdvertisements) {
        try {
          await d.watchAdvertisements()
          d.addEventListener('advertisementreceived', e => {
            if (typeof e.rssi === 'number') {
              setRssi(e.rssi)
              addLog(`Advertisement RSSI: ${e.rssi}`)
            }
          })
        } catch (err) {
          // watchAdvertisements can fail (permissions), ignore
          addLog('watchAdvertisements not available: ' + err)
        }
      }

      await connectDevice(d)
    } catch (err) {
      addLog('Request failed: ' + err)
      setStatus('error')
      onError && onError(err)
    }
  }

  async function connectDevice(d) {
    try {
      setStatus('connecting')
      addLog('Connecting...')
      const s = await d.gatt.connect()
      addLog('Connected to GATT')
      setStatus('connected')
      reconnectAttempts.current = 0
      onDeviceConnected && onDeviceConnected(d, s)

      // discover primary services (limited set to avoid long waits)
      const svcs = await s.getPrimaryServices()
      setServices(svcs)
      addLog(`Discovered ${svcs.length} services`)

      // Auto-detect Nordic UART Service (NUS) and subscribe if present
      try {
        const nus = svcs.find(x => x.uuid && x.uuid.toLowerCase().includes('6e400001'))
        if (nus) {
          addLog('Found Nordic UART Service (NUS), enumerating characteristics')
          const chars = await nus.getCharacteristics()
          const notifyChar = chars.find(c => c.properties.notify)
          if (notifyChar) {
            addLog('Subscribing to NUS notify characteristic')
            await notifyChar.startNotifications()
            notifyChar.addEventListener('characteristicvaluechanged', ev => {
              const v = ev.target.value
              const arr = new Uint8Array(v.buffer)
              onRawData && onRawData(arr)
              if (typeof onCharData === 'function') onCharData(notifyChar.uuid, arr)
              addLog('NUS notify -> forwarded raw data')
            })
          }
        }
      } catch (e) {
        addLog('Auto-subscribe failed: ' + e)
      }
    } catch (err) {
      addLog('Connect failed: ' + err)
      setStatus('error')
      onError && onError(err)
    }
  }

  function scheduleReconnect(d) {
    if (!autoReconnect) return
    reconnectAttempts.current = Math.min(6, reconnectAttempts.current + 1)
    const delay = Math.pow(2, reconnectAttempts.current) * 1000
    addLog(`Scheduling reconnect in ${delay / 1000}s (attempt ${reconnectAttempts.current})`)
    reconnectTimer.current = setTimeout(async () => {
      if (!d) return
      try {
        await connectDevice(d)
        if (d.gatt && d.gatt.connected) {
          addLog('Reconnected successfully')
          setStatus('connected')
        } else {
          scheduleReconnect(d)
        }
      } catch (err) {
        addLog('Reconnect attempt failed: ' + err)
        scheduleReconnect(d)
      }
    }, delay)
  }

  function onDisconnected() {
    addLog('Device disconnected')
    setStatus('disconnected')
    setDevice(null)
    setServices([])
    if (autoReconnect && device) {
      scheduleReconnect(device)
    }
  }

  async function disconnect() {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current)
      reconnectTimer.current = null
    }
    if (device && device.gatt && device.gatt.connected) {
      device.gatt.disconnect()
      addLog('Manually disconnected')
      setDevice(null)
      setServices([])
      setStatus('idle')
    }
  }

  return (
    <div className="ble-connector">
      <h2>Bluetooth</h2>
      <div className="controls">
        <button onClick={requestDevice} disabled={!navigator.bluetooth || status === 'connecting'}>Connect device</button>
        <button onClick={disconnect} disabled={!device}>Disconnect</button>
        <button onClick={() => { if (device) connectDevice(device); }} disabled={!device}>Reconnect now</button>
        <label style={{marginLeft:12}}><input type="checkbox" checked={autoReconnect} onChange={e => setAutoReconnect(e.target.checked)} /> Auto-reconnect</label>
      </div>

      <div className="device-info">
        <div><strong>Device:</strong> {device ? (device.name || device.id) : '—'}</div>
        <div><strong>Status:</strong> {status}</div>
        <div><strong>RSSI:</strong> {rssi !== null ? `${rssi} dBm` : '—'}</div>
        <div><strong>Services:</strong> {services.length}</div>
      </div>

      <details>
        <summary>Log</summary>
        <div className="log">
          {log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </details>
    </div>
  )
}