import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const sapphireTestnet = /*#__PURE__*/ Chain.from({
  id: 23295,
  name: 'Oasis Sapphire Testnet',
  nativeCurrency: { name: 'Sapphire Test Rose', symbol: 'TEST', decimals: 18 },
  rpcUrls: {
    http: 'https://testnet.sapphire.oasis.dev',
    ws: 'wss://testnet.sapphire.oasis.dev/ws',
  },
  blockExplorers: {
    name: 'Oasis Explorer',
    url: 'https://explorer.oasis.io/testnet/sapphire',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
