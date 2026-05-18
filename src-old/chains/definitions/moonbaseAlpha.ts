import { defineChain } from '../../utils/chain/defineChain.js'

export const moonbaseAlpha = /*#__PURE__*/ defineChain({
  id: 1287,
  name: 'Moonbase Alpha',
  nativeCurrency: {
    decimals: 18,
    name: 'DEV',
    symbol: 'DEV',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.api.moonbase.moonbeam.network'],
      webSocket: ['wss://wss.api.moonbase.moonbeam.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Moonscan',
      url: 'https://moonbase.moonscan.io',
      apiUrl: 'https://moonbase.moonscan.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1850686,
    },
  },
  testnet: true,
})
