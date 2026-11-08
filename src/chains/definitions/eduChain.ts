import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const eduChain = /*#__PURE__*/ Chain.from({
  id: 41923,
  name: 'EDU Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'EDU',
    symbol: 'EDU',
  },
  rpcUrls: {
    http: 'https://rpc.educhain.xyz',
    ws: 'wss://rpc.educhain.xyz',
  },
  blockExplorers: {
    name: 'EDU Chain Explorer',
    url: 'https://explorer.educhain.xyz/',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 16410660,
    },
  },
  testnet: false,
})
