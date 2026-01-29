import { defineChain } from '../../utils/chain/defineChain.js'

export const moonriver = /*#__PURE__*/ defineChain({
  id: 1285,
  name: 'Moonriver',
  nativeCurrency: {
    decimals: 18,
    name: 'MOVR',
    symbol: 'MOVR',
  },
  rpcUrls: {
    default: {
      http: ['https://moonriver.public.blastapi.io'],
      webSocket: ['wss://moonriver.public.blastapi.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Moonscan',
      url: 'https://moonriver.moonscan.io',
      apiUrl: 'https://api-moonriver.moonscan.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1597904,
    },
  },
  testnet: false,
})
