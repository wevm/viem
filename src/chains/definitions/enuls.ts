import * as Chain from '../../core/Chain.js'

export const enuls = /*#__PURE__*/ Chain.from({
  id: 119,
  name: 'ENULS Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'NULS',
    symbol: 'NULS',
  },
  rpcUrls: { http: 'https://evmapi2.nuls.io' },
  blockExplorers: {
    name: 'ENULS Explorer',
    url: 'https://evmscan.nuls.io',
  },
  testnet: false,
})
