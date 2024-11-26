import { defineChain } from '../../utils/chain/defineChain.js'

export const worldLand = /*#__PURE__*/ defineChain({
  id: 103,
  name: 'WorldLand Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'WLC',
    symbol: 'WLC',
  },
  rpcUrls: {
    default: {
      http: ['https://seoul.worldland.foundation'],
    },
  },
  blockExplorers: {
    default: {
      name: 'WorldLand Scan',
      url: 'https://scan.worldland.foundation',
    },
  },
  testnet: false,
})
