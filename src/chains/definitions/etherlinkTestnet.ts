import * as Chain from '../../core/Chain.js'

export const etherlinkTestnet = /*#__PURE__*/ Chain.define({
  id: 128123n,
  name: 'Etherlink Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Tez',
    symbol: 'XTZ',
  },
  rpcUrls: {
    default: { http: ['https://node.ghostnet.etherlink.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Etherlink Testnet',
      url: 'https://testnet.explorer.etherlink.com',
    },
  },
  testnet: true,
})
