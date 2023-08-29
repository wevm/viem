import { defineChain } from '../../utils/chain.js'

export const fuse = /*#__PURE__*/ defineChain({
  id: 122,
  name: 'Fuse',
  network: 'fuse',
  nativeCurrency: { name: 'Fuse', symbol: 'FUSE', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.fuse.io'] },
    public: { http: ['https://fuse-mainnet.chainstacklabs.com'] },
  },
  blockExplorers: {
    default: { name: 'Fuse Explorer', url: 'https://explorer.fuse.io' },
  },
})
