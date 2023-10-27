import { defineChain } from '../../utils/chain/defineChain.js'

export const dfk = /*#__PURE__*/ defineChain({
  id: 53_935,
  name: 'DFK Chain',
  network: 'dfk',
  nativeCurrency: {
    decimals: 18,
    name: 'Jewel',
    symbol: 'JEWEL',
  },
  rpcUrls: {
    default: {
      http: ['https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc'],
    },
    public: {
      http: ['https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'DFKSubnetScan',
      url: 'https://subnets.avax.network/defi-kingdoms',
    },
    default: {
      name: 'DFKSubnetScan',
      url: 'https://subnets.avax.network/defi-kingdoms',
    },
  },
})
