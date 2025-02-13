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
        'https://peaq.api.onfinality.io/public',
        'https://peaq-rpc.dwellir.com',
        'https://peaq-rpc.publicnode.com',
        'https://evm.peaq.network',
      ],
      webSocket: [
        'wss://peaq.api.onfinality.io/public',
        'wss://peaq-rpc.publicnode.com',
        'wss://peaq-rpc.dwellir.com',
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
