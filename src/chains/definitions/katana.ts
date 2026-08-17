import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const katana = /*#__PURE__*/ Chain.from({
  id: 747474,
  name: 'Katana',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://rpc.katana.network',
  },
  blockExplorers: {
    name: 'katana explorer',
    url: 'https://katanascan.com',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  testnet: false,
})
