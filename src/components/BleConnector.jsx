import React, { useState } from 'react'

export default function BleConnector({ onDeviceConnected, onRawData, onCharData }) {
  const [device, setDevice] = useState(null)
  const [services, setServices] = useState([])
  const [log, setLog] = useState([])

  function addLog(s) {
    setLog(l => [s, ...l].slice(0, 50))
  }

  async function requestDevice() {
    try {
      addLog('Requesting device...')
      const d = await navigator.bluetooth.requestDevice({
        // prefer devices that look like the Varstrom advertisement name
        filters: [{ namePrefix: 'Varstrom' }],
        optionalServices: ['battery_service']
      })
      setDevice(d)
      addLog(`Selected: ${d.name || d.id}`)
      d.addEventListener('gattserverdisconnected', onDisconnected)
      await connectDevice(d)
    } catch (err) {
      addLog('Request failed: ' + err)
    }
  }

  async function connectDevice(d) {
    try {
      addLog('Connecting...')
      const s = await d.gatt.connect()
      addLog('Connected to GATT')
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
        // ignore auto-subscribe failures
      }
    } catch (err) {
      addLog('Connect failed: ' + err)
    }
  }

  function onDisconnected() {
    addLog('Device disconnected')
    setDevice(null)
    setServices([])
  }

  async function disconnect() {
    if (device && device.gatt.connected) {
      device.gatt.disconnect()
      addLog('Manually disconnected')
      setDevice(null)
      setServices([])
    }
  }

  return (
    <div className="ble-connector">
      <h2>Bluetooth</h2>
      <div className="controls">
        <button onClick={requestDevice} disabled={!navigator.bluetooth}>Connect device</button>
        <button onClick={disconnect} disabled={!device}>Disconnect</button>
      </div>

      <div className="device-info">
        <div><strong>Device:</strong> {device ? (device.name || device.id) : '—'}</div>
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