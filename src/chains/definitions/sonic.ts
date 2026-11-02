import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const sonic = /*#__PURE__*/ Chain.from({
  id: 146,
  name: 'Sonic',
  blockTime: 630,
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: { http: 'https://rpc.soniclabs.com' },
  blockExplorers: {
    name: 'Sonic Explorer',
    url: 'https://sonicscan.org',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 60,
    },
  },
  testnet: false,
})
