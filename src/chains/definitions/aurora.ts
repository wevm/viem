import { defineChain } from '../../utils/chain/defineChain.js'

export const aurora = /*#__PURE__*/ defineChain({
  id: 1313161554,
  name: 'Aurora',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.aurora.dev'] },
  },
  blockExplorers: {
    default: { name: 'Aurorascan', url: 'https://aurorascan.dev' },
  },
})
