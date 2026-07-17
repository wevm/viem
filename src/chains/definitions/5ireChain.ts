import * as Chain from '../../core/Chain.js'

export const fireChain = /*#__PURE__*/ Chain.from({
  id: 995,
  name: '5ireChain',
  nativeCurrency: { name: '5ire Token', symbol: '5IRE', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.5ire.network',
  },
  blockExplorers: {
    name: '5ireChain Mainnet Explorer',
    url: 'https://5irescan.io/',
  },
  testnet: false,
})
