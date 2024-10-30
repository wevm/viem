import { defineChain } from '../../utils/chain/defineChain.js'

export const xdc = /*#__PURE__*/ defineChain({
  id: 50,
  name: 'XinFin Network',
  nativeCurrency: {
    decimals: 18,
    name: 'XDC',
    symbol: 'XDC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.xdcrpc.com'] },
    xinfin: { http: ['https://erpc.xinfin.network'] },
  },
  blockExplorers: {
    default: {
      name: 'XDCScan',
      url: 'https://xdcscan.com',
    },
    blocksscan: {
      name: 'Blocksscan',
      url: 'https://xdcscan.io',
    }
  },
  contracts: {
    multicall3: {
      address: '0x0B1795ccA8E4eC4df02346a082df54D437F8D9aF',
      blockCreated: 75884020,
    },
  },
})
