import React from 'react'

export default function Onboarding({ open, onClose }) {
  if (!open) return null
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header>
          <h2>Getting started — Bluetooth & Android tips</h2>
        </header>
        <section>
          <ol>
            <li>Open the app and tap <strong>Connect device</strong> → choose your Varstrom device.</li>
            <li>If you have issues, enable <strong>Bluetooth scanning</strong> in Android Developer Options (Settings → System → Developer options → enable "Bluetooth HCI snoop log" / "Enable Bluetooth scanning" depending on OS). Reboot if necessary.</li>
            <li>Use Chrome on Android (or Edge) when testing Web Bluetooth — desktop Chrome also works for development.</li>
            <li>Make sure the phone and the dev machine (if using LAN dev server) are on the same network. For mobile: visit your dev server URL (provided when running `npm run dev`).</li>
            <li>If the device disconnects, enable <strong>Auto-reconnect</strong> in the Bluetooth panel or try the <strong>Reconnect now</strong> action.</li>
            <li>Export a short JSON log (10–30 entries) from the Notification Log and share it so we can create a one-click EKD01 preset.</li>
          </ol>
        </section>
        <footer>
          <button onClick={onClose}>Got it</button>
        </footer>
      </div>
    </div>
  )
}
