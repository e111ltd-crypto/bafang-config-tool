export function parseTelemetry(bytes) {
  // Try UTF-8 text
  try {
    const text = new TextDecoder().decode(bytes)
    const trimmed = text.trim()
    // try JSON
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return JSON.parse(trimmed)
      } catch {
        // fall through
      }
    }

    // key:value; pairs
    if (trimmed.includes(':') && trimmed.includes(';')) {
      const obj = {}
      trimmed.split(';').forEach(part => {
        const [k, v] = part.split(':')
        if (k) obj[k.trim()] = Number(v) || v.trim()
      })
      return obj
    }

    // CSV of values with known order speed,batt,assist
    if ((trimmed.match(/,/g)||[]).length >= 2) {
      const parts = trimmed.split(',').map(s => s.trim())
      const [speed, batt, assist] = parts
      return { speed: Number(speed), battery: Number(batt), assist: Number(assist) }
    }

    // If it's plain number
    if (!isNaN(Number(trimmed))) {
      return { value: Number(trimmed) }
    }

    // fallback: return as text
    return { raw: trimmed }
  } catch {
    // binary data fallback
    return { rawHex: Array.from(new Uint8Array(bytes)).map(b => b.toString(16).padStart(2,'0')).join(' ') }
  }
}
