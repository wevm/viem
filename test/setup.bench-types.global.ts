import { join } from 'node:path'
import { setup } from '@ark/attest'

// Precomputes type assertion data for `*.bench-d.ts` instantiation benches.
export default function () {
  return setup({
    benchErrorOnThresholdExceeded: true,
    shouldFormat: false,
    tsconfig: join(import.meta.dirname, './tsconfig.json'),
  })
}
