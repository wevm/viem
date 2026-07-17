import * as Chain from '../../core/Chain.js'

export const etherlink = /*#__PURE__*/ Chain.from({
  id: 42793,
  name: 'Etherlink',
  blockTime: 4_830,
  nativeCurrency: {
    decimals: 18,
    name: 'Tez',
    symbol: 'XTZ',
  },
  rpcUrls: { http: 'https://node.mainnet.etherlink.com' },
  blockExplorers: {
    name: 'Etherlink',
    url: 'https://explorer.etherlink.com',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 33899,
    },
  },
})
