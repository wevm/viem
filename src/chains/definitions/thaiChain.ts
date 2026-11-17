import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const thaiChain = /*#__PURE__*/ Chain.from({
  id: 7,
  name: 'ThaiChain',
  nativeCurrency: { name: 'TCH', symbol: 'TCH', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.thaichain.org',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://exp.thaichain.org',
    apiUrl: 'https://exp.thaichain.org/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0x0DaD6130e832c21719C5CE3bae93454E16A84826',
      blockCreated: 4806386,
    },
  },
  testnet: false,
})
