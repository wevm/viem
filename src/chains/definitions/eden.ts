import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const eden = /*#__PURE__*/ Chain.from({
  id: 714,
  name: 'Eden',
  nativeCurrency: {
    name: 'TIA',
    symbol: 'TIA',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://rpc.eden.gateway.fm',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://eden.blockscout.com',
    apiUrl: 'https://eden.blockscout.com/api',
  },
})
