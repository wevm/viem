import { defineChain } from '../../utils/chain/defineChain.js'

export const kinetiqElysiumTestnet = /*#__PURE__*/ defineChain({
  id: 99_801,
  name: 'Kinetiq Elysium Testnet',
  blockTime: 100,
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.elysium.kinetiq.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Elysium Testnet Explorer',
      url: 'https://testnet.elysium.kinetiq.xyz',
      apiUrl: 'https://testnet.elysium.kinetiq.xyz/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 91163,
    },
  },
  sourceId: 998,
  testnet: true,
})
