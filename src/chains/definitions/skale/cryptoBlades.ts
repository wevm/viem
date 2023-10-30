import { defineChain } from '../../../utils/chain/defineChain.js'

export const skaleCryptoBlades = /*#__PURE__*/ defineChain({
  id: 1_026_062_157,
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
