import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const hashkey = /*#__PURE__*/ Chain.from({
  id: 177,
  name: 'HashKey Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'HashKey EcoPoints',
    symbol: 'HSK',
  },
  rpcUrls: {
    http: 'https://mainnet.hsk.xyz',
  },
  blockExplorers: {
    name: 'HashKey Chain Explorer',
    url: 'https://hashkey.blockscout.com',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
  },
})
