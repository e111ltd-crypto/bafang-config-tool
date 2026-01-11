Release notes - EKD01 Companion App (v0.1.0)

Features added:

- Web Bluetooth connector with device selection and basic logging ✅
- GATT Explorer with service discovery, characteristic read/write and notifications ✅
- Flexible parser supporting JSON, key:value; pairs, CSVs and raw hex ✅
- Live Dashboard showing Speed, Battery, Assist, Cadence and raw telemetry ✅
- Characteristic Mapping UI to map BLE notifications to telemetry fields and save presets ✅
- Minimal unit test for parser and documentation (research notes) ✅

Known gaps and next steps:

- No official Varstrom GATT spec found (help from vendor or packet captures required)
- Add a preset EKD01 parser and GATT configuration if specs are shared
- Add PWA manifest, icons, and mobile layout polish
- Add more visualization (maps, historic graphs, session logging)

How to build and run:

  npm install
  npm run dev

Browser compatibility:
- Web Bluetooth works best in Chrome / Edge (desktop, Android). iOS Safari does not support Web Bluetooth at time of writing.

If you have the physical device or raw captures, share them and I will implement exact binary parsers and presets to make a one-click EKD01 experience.