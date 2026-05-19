import * as Chain from '../../core/Chain.js'

export const enuls = /*#__PURE__*/ Chain.define({
  id: 119n,
  name: 'ENULS Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'NULS',
    symbol: 'NULS',
  },
  rpcUrls: {
    default: { http: ['https://evmapi2.nuls.io'] },
  },
  blockExplorers: {
    default: {
      name: 'ENULS Explorer',
      url: 'https://evmscan.nuls.io',
    },
  },
  testnet: false,
})
