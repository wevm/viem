import * as Chain from '../../../core/Chain.js'

export const skaleCryptoBlades = /*#__PURE__*/ Chain.define({
  id: 1_026_062_157n,
  name: 'SKALE | CryptoBlades',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux'],
      webSocket: [
        'wss://mainnet.skalenodes.com/v1/ws/affectionate-immediate-pollux',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'SKALE Explorer',
      url: 'https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com',
    },
  },
  contracts: {},
})
