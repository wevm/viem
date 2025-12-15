import { defineChain } from '../../../utils/chain/defineChain.js'

export const skaleBase = /*#__PURE__*/ defineChain({
  id: 1187947933,
  name: 'SKALE Base',
  nativeCurrency: { name: 'Credits', symbol: 'CREDIT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://skale-base.skalenodes.com/v1/base'],
      webSocket: ['wss://skale-base.skalenodes.com/v1/ws/base'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SKALE Explorer',
      url: 'https://skale-base-explorer.skalenodes.com/',
    },
  },
  testnet: true,
})
