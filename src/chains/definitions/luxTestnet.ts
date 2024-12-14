import { defineChain } from '../../utils/chain/defineChain.js'

export const luxTestnet = /*#__PURE__*/ defineChain({
  id: 96_368,
  name: 'Lux Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tLux',
    symbol: 'tLux',
  },
  rpcUrls: {
    default: {
      http: ['https://api.lux-test.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Lux Network Explorer',
      url: 'https://explore.lux-test.network',
    },
  },
  testnet: true,
})
