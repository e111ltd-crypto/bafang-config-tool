import React from 'react'

export default function Dashboard({ telemetry }) {
  const speed = telemetry.speed || telemetry.SPD || telemetry.value || 0
  const battery = telemetry.battery || telemetry.BAT || telemetry.battery_level || 0
  const assist = telemetry.assist || telemetry.ASS || 0
  const cadence = telemetry.CAD || telemetry.cadence || 0

  return (
    <div className="dashboard">
      <h2>Live Dashboard</h2>
      <div className="panels">
        <div className="panel big">
          <div className="label">Speed</div>
          <div className="value">{Number(speed).toFixed(1)} km/h</div>
        </div>
        <div className="panel" style={{'--accent': '#4caf50'}}>
          <div className="label">Battery</div>
          <div className="value">{battery}%</div>
        </div>
        <div className="panel" style={{'--accent': '#ff9800'}}>
          <div className="label">Assist</div>
          <div className="value">{assist}</div>
        </div>
        <div className="panel" style={{'--accent': '#2196f3'}}>
          <div className="label">Cadence</div>
          <div className="value">{cadence}</div>
        </div>
      </div>

      <div className="details">
        <pre>{JSON.stringify(telemetry, null, 2)}</pre>
      </div>
    </div>
  )
}
