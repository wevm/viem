import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const rootstock = /*#__PURE__*/ Chain.from({
  id: 30,
  name: 'Rootstock Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Rootstock Bitcoin',
    symbol: 'RBTC',
  },
  rpcUrls: { http: 'https://public-node.rsk.co' },
  blockExplorers: {
    name: 'RSK Explorer',
    url: 'https://explorer.rsk.co',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 4249540,
    },
  },
})
