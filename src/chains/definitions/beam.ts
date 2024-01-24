import { defineChain } from '../../utils/chain/defineChain.js'

export const beam = /*#__PURE__*/ defineChain({
  id: 4_337,
  name: 'Beam Mainnet',
  nativeCurrency: { name: 'Beam', symbol: 'BEAM', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://build.onbeam.com/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Avalanche Explorer',
      url: 'https://subnets.avax.network/beam',
    },
  },
  contracts: {
    multicall3: {
      address: '0x4956F15eFdc3dC16645e90Cc356eAFA65fFC65Ec',
      blockCreated: 1,
    },
  },
})
