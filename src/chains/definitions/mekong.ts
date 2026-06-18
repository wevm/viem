import * as Chain from '../../core/Chain.js'

export const mekong = /*#__PURE__*/ Chain.from({
  id: 7078815900,
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
