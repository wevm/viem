import * as Chain from '../../../core/Chain.js'

export const skaleCryptoBlades = /*#__PURE__*/ Chain.from({
  id: 1_026_062_157,
  name: 'SKALE | CryptoBlades',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    http: 'https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux',
    ws: 'wss://mainnet.skalenodes.com/v1/ws/affectionate-immediate-pollux',
  },
  blockExplorers: {
    name: 'SKALE Explorer',
    url: 'https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com',
  },
  contracts: {},
})
