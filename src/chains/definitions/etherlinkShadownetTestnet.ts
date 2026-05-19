import * as Chain from '../../core/Chain.js'

export const etherlinkShadownetTestnet = /*#__PURE__*/ Chain.define({
  id: 127823n,
  name: 'Etherlink Shadownet Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tez',
    symbol: 'XTZ',
  },
  rpcUrls: {
    default: { http: ['https://node.shadownet.etherlink.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Etherlink Shadownet Testnet Explorer',
      url: 'https://shadownet.explorer.etherlink.com',
    },
  },
  testnet: true,
})
