import * as Chain from '../../core/Chain.js'

export const potosTestnet = /*#__PURE__*/ Chain.from({
  id: 60600,
  name: 'POTOS Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'POTOS Token',
    symbol: 'POT',
  },
  rpcUrls: {
    http: 'https://rpc-testnet.potos.hk',
  },
  blockExplorers: {
    name: 'POTOS Testnet explorer',
    url: 'https://scan-testnet.potos.hk',
  },
  testnet: true,
})
