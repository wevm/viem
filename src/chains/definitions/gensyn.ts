import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const gensyn = /*#__PURE__*/ Chain.from({
  id: 685_689,
  name: 'Gensyn Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: { http: 'https://gensyn-mainnet.g.alchemy.com/public' },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://gensyn-mainnet.explorer.alchemy.com',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
})
