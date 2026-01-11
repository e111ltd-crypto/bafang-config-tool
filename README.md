# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Varstrom EKD01 Companion App (Preview)

This workspace now contains a Web Bluetooth (BLE) based companion app for the Varstrom EKD01 display. It provides:

- A Web Bluetooth connector and GATT explorer to connect to BLE-enabled displays or peripherals ✅
- A live dashboard showing telemetry (speed, battery, assist, cadence) ✅
- A flexible parser that handles JSON, key:value; pairs, CSVs, or raw binary and maps them to dashboard fields ✅
- A **Characteristic Mapping** UI so you can map BLE notification characteristics to telemetry fields and save presets for the EKD01 ✅

Note: The Varstrom product page was checked and did not provide a public GATT specification. This app is therefore intentionally flexible and configurable — it will work with devices that publish readable notifications or ASCII telemetry, and includes a GATT explorer for manual inspection.

Running locally

1. Install dependencies:

   npm install

2. Run the dev server (Chrome/Edge with Web Bluetooth support recommended):

   npm run dev

3. Open the app, use "Connect device" to select your EDK01. Use the **GATT Explorer** to discover services and enable notifications, then create a mapping in **Characteristic Mappings** to map notification data to the dashboard fields.

Security & compatibility

- Web Bluetooth requires a secure context (HTTPS or localhost) and is best supported in Chrome/Edge on desktop or Android.
- If you have official Varstrom protocol docs, we can add a specific parser to map binary fields to telemetry.

Next steps and how you can help

- If you can share device logs or the GATT spec, I will add a precise EKD01 parser and presets.
- I can add a React Native / native PWA build for broader device support.

