import { parseTelemetry } from '../src/lib/parser.js'

const tests = [
  { input: 'SPD:12.3;BAT:85;ASS:3;CAD:80', expectKeys: ['SPD','BAT','ASS','CAD'] },
  { input: '{"speed":15.4,"battery":92}', expectKeys: ['speed','battery'] },
  { input: '12.3,85,3', expectKeys: ['speed','battery','assist'] },
]

for (const t of tests) {
  const bytes = new TextEncoder().encode(t.input)
  const out = parseTelemetry(bytes)
  console.log('IN:', t.input)
  console.log('OUT:', out)
  console.log('---')
}
