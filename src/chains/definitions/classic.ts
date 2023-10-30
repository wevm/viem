import { defineChain } from '../../utils/chain/defineChain.js'

export const classic = /*#__PURE__*/ defineChain({
  id: 61,
  name: 'Ethereum Classic',
  nativeCurrency: {
    decimals: 18,
    name: 'ETC',
    symbol: 'ETC',
  },
  rpcUrls: {
    default: { http: ['https://etc.rivet.link'] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout.com/etc/mainnet',
    },
  },
})
