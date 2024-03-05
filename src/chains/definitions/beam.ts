import { defineChain } from '../../utils/chain/defineChain.js'

export const beam = /*#__PURE__*/ defineChain({
  id: 4337,
  name: 'Beam',
  network: 'beam',
  nativeCurrency: {
    decimals: 18,
    name: 'Beam',
    symbol: 'BEAM',
  },
  rpcUrls: {
    public: {
      http: ['https://build.onbeam.com/rpc'],
    },
    default: {
      http: ['https://build.onbeam.com/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Beam Explorer',
      url: 'https://subnets.avax.network/beam',
    },
  },
  contracts: {
    multicall3: {
      address: '0x4956f15efdc3dc16645e90cc356eafa65ffc65ec',
      blockCreated: 1,
    },
  },
})
