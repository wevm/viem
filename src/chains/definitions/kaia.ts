import { defineChain } from '../../utils/chain/defineChain.js'

export const kaia = /*#__PURE__*/ defineChain({
  id: 8_217,
  name: 'Kaia',
  nativeCurrency: {
    decimals: 18,
    name: 'Kaia',
    symbol: 'KAIA',
  },
  rpcUrls: {
    default: { http: ['https://public-en.node.kaia.io'] },
  },
  blockExplorers: {
    default: {
      name: 'KaiaScope',
      url: 'https://kaiascope.com',
      apiUrl: 'https://api-cypress.klaytnscope.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 96002415,
    },
  },
})
