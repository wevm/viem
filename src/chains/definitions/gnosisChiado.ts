import { defineChain } from '../../utils/chain/defineChain.js'

export const gnosisChiado = /*#__PURE__*/ defineChain({
  id: 10_200,
  name: 'Gnosis Chiado',
  nativeCurrency: {
    decimals: 18,
    name: 'Gnosis',
    symbol: 'xDAI',
  },
  blockTime: 5_000,
  rpcUrls: {
    default: {
      http: ['https://rpc.chiadochain.net'],
      webSocket: ['wss://rpc.chiadochain.net/wss'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout.chiadochain.net',
      apiUrl: 'https://blockscout.chiadochain.net/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 4967313,
    },
  },
  testnet: true,
})
