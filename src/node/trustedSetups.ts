import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(
  // import.meta' meta-property is only allowed when the '--module' option is 'es2020', 'es2022', 'esnext', 'system', 'node16', or 'nodenext'
  // @ts-ignore
  import.meta.url,
)
const __dirname = dirname(__filename)

export const mainnetTrustedSetupPath = resolve(
  __dirname,
  '../trusted-setups/mainnet.json',
)
