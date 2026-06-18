import * as Chain from '../../core/Chain.js'

export const kairos = /*#__PURE__*/ Chain.from({
  id: 1_001,
  name: 'Kairos Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Kairos KAIA',
    symbol: 'KAIA',
  },
  rpcUrls: {
    default: { http: ['https://public-en-kairos.node.kaia.io'] },
  },
  blockExplorers: {
    default: {
      name: 'KaiaScan',
      url: 'https://kairos.kaiascan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 123390593,
    },
  },
  testnet: true,
})
