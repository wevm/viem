require('ses')

// Freezes the intrinsics (e.g. `Function.prototype.call`), as LavaMoat and
// MetaMask Snaps do, before viem is evaluated.
lockdown()

const { readFileSync } = require('node:fs')
const { join } = require('node:path')

const { exports: entrypoints } = JSON.parse(
  readFileSync(join(__dirname, 'node_modules/viem/package.json'), 'utf8'),
)
for (const [path, entry] of Object.entries(entrypoints))
  if (typeof entry === 'object' && !path.includes('*'))
    require(`viem${path.slice(1)}`)

const { Actions, Client, http } = require('viem')
const { mainnet } = require('viem/chains')

const client = Client.create({ chain: mainnet, transport: http() })
const call = Actions.token.getAllowance.call(client, {
  account: '0x0000000000000000000000000000000000000001',
  spender: '0x0000000000000000000000000000000000000002',
  token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
})
if (call.functionName !== 'allowance') throw new Error('Invalid call.')

process.exit(0)
