import * as Chain from '../../core/Chain.js'

export const thunderTestnet = /*#__PURE__*/ Chain.from({
  id: 997,
  name: '5ireChain Thunder Testnet',
  nativeCurrency: { name: '5ire Token', symbol: '5IRE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.5ire.network'],
    },
  },
  blockExplorers: {
    default: {
      name: '5ireChain Thunder Explorer',
      url: 'https://testnet.5irescan.io/',
    },
  },
  testnet: true,
})
