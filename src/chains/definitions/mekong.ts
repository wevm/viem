import * as Chain from '../../core/Chain.js'

export const mekong = /*#__PURE__*/ Chain.define({
  id: 7078815900n,
  name: 'Mekong Pectra Devnet',
  nativeCurrency: { name: 'eth', symbol: 'eth', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.mekong.ethpandaops.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Block Explorer',
      url: 'https://explorer.mekong.ethpandaops.io',
    },
  },
  testnet: true,
})
