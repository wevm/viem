import { defineChain } from '../../utils/chain/defineChain.js'

export const bahamut = /*#__PURE__*/ defineChain({
  id: 5165,
  network: 'bahamut',
  name: 'Bahamut',
  nativeCurrency: { name: 'Fasttoken', symbol: 'FTN', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://rpc1.bahamut.io',
        'https://bahamut.publicnode.com',
        'https://rpc2.bahamut.io',
      ],
      webSocket: [
        'wss://ws1.sahara.bahamutchain.com',
        'wss://bahamut.publicnode.com',
        'wss://ws2.sahara.bahamutchain.com',
      ],
    },
    public: {
      http: [
        'https://rpc1.bahamut.io',
        'https://bahamut.publicnode.com',
        'https://rpc2.bahamut.io',
      ],
      webSocket: [
        'wss://ws1.sahara.bahamutchain.com',
        'wss://bahamut.publicnode.com',
        'wss://ws2.sahara.bahamutchain.com',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ftnscan',
      url: 'https://www.ftnscan.com',
    },
  },
})
