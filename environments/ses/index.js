require('ses')

// Freezes the intrinsics (e.g. `Function.prototype.call`), as LavaMoat and
// MetaMask Snaps do, before viem is evaluated.
lockdown()

const { exports: entrypoints } = require('viem/package.json')
for (const [path, entry] of Object.entries(entrypoints))
  if (typeof entry === 'object') require(`viem${path.slice(1)}`)

const { createClient, http } = require('viem')
const { token } = require('viem/actions')
const { mainnet } = require('viem/chains')

const client = createClient({ chain: mainnet, transport: http() })
const call = token.getAllowance.call(client, {
  account: '0x0000000000000000000000000000000000000001',
  spender: '0x0000000000000000000000000000000000000002',
  token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
})
if (call.functionName !== 'allowance') throw new Error('Invalid call.')

process.exit(0)
