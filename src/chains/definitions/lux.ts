import { defineChain } from '../../utils/chain/defineChain.js'

export const lux = /*#__PURE__*/ defineChain({
  id: 96_369,
  name: 'Lux Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Lux',
    symbol: 'Lux',
  },
  rpcUrls: {
    default: {
      http: ['https://api.lux.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Lux Network Explorer',
      url: 'https://explore.lux.network',
    },
  },
  testnet: false,
})
