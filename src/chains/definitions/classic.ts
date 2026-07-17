import * as Chain from '../../core/Chain.js'

export const classic = /*#__PURE__*/ Chain.from({
  id: 61,
  name: 'Ethereum Classic',
  nativeCurrency: {
    decimals: 18,
    name: 'ETC',
    symbol: 'ETC',
  },
  rpcUrls: { http: 'https://etc.rivet.link' },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://blockscout.com/etc/mainnet',
  },
})
