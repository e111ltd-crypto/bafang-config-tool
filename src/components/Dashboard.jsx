import React from 'react'

import Sparkline from './Sparkline'

export default function Dashboard({ telemetry, history }) {
  const speed = Number(telemetry.speed || telemetry.SPD || telemetry.value || 0)
  const battery = Number(telemetry.battery || telemetry.BAT || telemetry.battery_level || 0)
  const assist = Number(telemetry.assist || telemetry.ASS || 0)
  const cadence = Number(telemetry.CAD || telemetry.cadence || 0)

  const speedHistory = history.speed || []
  const batHistory = history.battery || []
  const assistHistory = history.assist || []
  const cadHistory = history.cadence || []

  return (
    <div className="dashboard">
      <h2>Live Dashboard</h2>
      <div className="panels">
        <div className="panel big">
          <div className="label">Speed</div>
          <div className="value">{speed.toFixed(1)} km/h</div>
          <div style={{height:36}}><Sparkline data={speedHistory} color="#8bc34a" /></div>
        </div>
        <div className="panel" style={{'--accent': '#4caf50'}}>
          <div className="label">Battery</div>
          <div className="value">{battery}%</div>
          <div style={{height:36}}><Sparkline data={batHistory} color="#4caf50" /></div>
        </div>
        <div className="panel" style={{'--accent': '#ff9800'}}>
          <div className="label">Assist</div>
          <div className="value">{assist}</div>
          <div style={{height:36}}><Sparkline data={assistHistory} color="#ff9800" /></div>
        </div>
        <div className="panel" style={{'--accent': '#2196f3'}}>
          <div className="label">Cadence</div>
          <div className="value">{cadence}</div>
          <div style={{height:36}}><Sparkline data={cadHistory} color="#2196f3" /></div>
        </div>
      </div>

      <div className="details">
        <pre>{JSON.stringify(telemetry, null, 2)}</pre>
      </div>
    </div>
  )
}
