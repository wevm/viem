import { defineChain } from '../../utils/chain/defineChain.js'

export const dfk = /*#__PURE__*/ defineChain({
  id: 53_935,
  name: 'DFK Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Jewel',
    symbol: 'JEWEL',
  },
  rpcUrls: {
    default: {
      http: ['https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'DFKSubnetScan',
      url: 'https://subnets.avax.network/defi-kingdoms',
    },
  },
})
