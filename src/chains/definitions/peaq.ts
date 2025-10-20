import { defineChain } from '../../utils/chain/defineChain.js'

export const peaq = /*#__PURE__*/ defineChain({
  id: 3338,
  name: 'Peaq',
  nativeCurrency: {
    decimals: 18,
    name: 'peaq',
    symbol: 'PEAQ',
  },
  rpcUrls: {
    default: {
      http: [
        'https://quicknode1.peaq.xyz',
        'https://quicknode2.peaq.xyz',
        'https://quicknode3.peaq.xyz',
      ],
      webSocket: [
        'wss://quicknode1.peaq.xyz',
        'wss://quicknode2.peaq.xyz',
        'wss://quicknode3.peaq.xyz',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Subscan',
      url: 'https://peaq.subscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 3566354,
    },
  },
})
