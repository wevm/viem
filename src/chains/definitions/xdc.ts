import { defineChain } from '../../utils/chain/defineChain.js'

export const xdc = /*#__PURE__*/ defineChain({
  id: 50,
  name: 'XDC Network',
  nativeCurrency: {
    decimals: 18,
    name: 'XDC',
    symbol: 'XDC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.xdcrpc.com'] },
  },
  blockExplorers: {
    default: {
      name: 'XDCScan',
      url: 'https://xdcscan.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0x0B1795ccA8E4eC4df02346a082df54D437F8D9aF',
      blockCreated: 75884020,
    },
  },
})
