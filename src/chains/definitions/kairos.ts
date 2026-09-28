import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const kairos = /*#__PURE__*/ Chain.from({
  id: 1_001,
  name: 'Kairos Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Kairos KAIA',
    symbol: 'KAIA',
  },
  rpcUrls: { http: 'https://public-en-kairos.node.kaia.io' },
  blockExplorers: {
    name: 'KaiaScan',
    url: 'https://kairos.kaiascan.io',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 123390593,
    },
  },
  testnet: true,
})
