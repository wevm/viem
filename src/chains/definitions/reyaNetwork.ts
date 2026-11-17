import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const reyaNetwork = /*#__PURE__*/ Chain.from({
  id: 1729,
  name: 'Reya Network',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: {
    http: 'https://rpc.reya.network',
    ws: 'wss://ws.reya.network',
  },
  blockExplorers: {
    name: 'Reya Network Explorer',
    url: 'https://explorer.reya.network',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: false,
})
