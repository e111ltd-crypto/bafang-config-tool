Summary of findings for Varstrom EDK01 (EKD01)

- Vendor product page: https://varstrom.com/en-gb/products/varstrom-edk01
- The product page shows the display supports Bluetooth and images indicate UART/CAN support as well.
- No public GATT (BLE) specification or protocol document was found on the manufacturer page.
- Product images hint at telemetry keys or UI fields: SPD (speed), BAT (battery), ASS (assist), CAD (cadence/step), and typical HMI fields (odometer, error codes, navigation)

Recommended approach

1. Implement a flexible BLE client that can:
   - Discover services and characteristics (GATT explorer)
   - Subscribe to notifications and read text/binary payloads
   - Allow user to configure the expected service/characteristic or use heuristics

2. Create protocol parsers and presets when the exact docs are available. In the meantime, support common encodings:
   - JSON payloads in a notification
   - Key:value; semicolon-delimited telemetry
   - CSV or simple numeric lines
   - Binary frames: allow byte offset/length mapping in a future UI

3. Provide a Characteristic Mapping UI so end users can map notification characteristics to telemetry fields and save presets for EKD01. This enables live testing on the bike without hardcoded assumptions.

Next steps I can take (if you want me to continue):
- Reach out to Varstrom or try to obtain a firmware or SDK for the EDK01 to find the GATT UUIDs and message formats
- Add presets/parsers once the spec is obtained
- Add a mobile-focused PWA UI and a React Native version for broader mobile BLE support
- Implement recorded logging, export and replay of telemetry sessions

If you have the device or any logs/packet captures, share them and I'll create an exact EKD01 parser and presets for one-click connection.
