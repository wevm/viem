import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const lyra = /*#__PURE__*/ Chain.from({
  id: 957,
  name: 'Lyra Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.lyra.finance',
  },
  blockExplorers: {
    name: 'Lyra Explorer',
    url: 'https://explorer.lyra.finance',
    apiUrl: 'https://explorer.lyra.finance/api/v2',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1935198,
    },
  },
})
