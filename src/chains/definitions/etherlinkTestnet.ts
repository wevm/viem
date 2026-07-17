import * as Chain from '../../core/Chain.js'

export const etherlinkTestnet = /*#__PURE__*/ Chain.from({
  id: 128123,
  name: 'Etherlink Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Tez',
    symbol: 'XTZ',
  },
  rpcUrls: { http: 'https://node.ghostnet.etherlink.com' },
  blockExplorers: {
    name: 'Etherlink Testnet',
    url: 'https://testnet.explorer.etherlink.com',
  },
  testnet: true,
})
