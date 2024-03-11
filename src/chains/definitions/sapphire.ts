import { defineChain } from '../../utils/chain/defineChain.js'

export const sapphire = /*#__PURE__*/ defineChain({
  id: 23294,
  name: 'Oasis Sapphire',
  network: 'sapphire',
  nativeCurrency: { name: 'Sapphire Rose', symbol: 'ROSE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://sapphire.oasis.io'],
      webSocket: ['wss://sapphire.oasis.io/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Oasis Sapphire Explorer',
      url: 'https://explorer.sapphire.oasis.io',
      apiUrl: 'https://explorer.sapphire.oasis.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 734531,
    },
  },
})
