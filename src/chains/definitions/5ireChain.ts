import * as Chain from '../../core/Chain.js'

export const fireChain = /*#__PURE__*/ Chain.define({
  id: 995n,
  name: '5ireChain',
  nativeCurrency: { name: '5ire Token', symbol: '5IRE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.5ire.network'],
    },
  },
  blockExplorers: {
    default: {
      name: '5ireChain Mainnet Explorer',
      url: 'https://5irescan.io/',
    },
  },
  testnet: false,
})
