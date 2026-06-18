import * as Chain from '../../core/Chain.js'

export const potos = /*#__PURE__*/ Chain.from({
  id: 60603,
  name: 'POTOS Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'POTOS Token',
    symbol: 'POT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.potos.hk'],
    },
  },
  blockExplorers: {
    default: {
      name: 'POTOS Mainnet explorer',
      url: 'https://scan.potos.hk',
    },
  },
  testnet: false,
})
